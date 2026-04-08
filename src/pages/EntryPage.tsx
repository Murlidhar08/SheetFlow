import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSheetData, addSheetRow, updateSheetRow, deleteSheetRow } from '../lib/google-sheets'
import { useSheetStore } from '../store/useSheetStore'
import { ChevronLeft, Save, Trash2, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

const EntryPage = () => {
  const { index } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { settings, accessToken } = useSheetStore()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const rowIndex = index ? parseInt(index) : null

  const { data, isLoading } = useQuery({
    queryKey: ['sheetData', settings.spreadsheetId, settings.sheetName],
    queryFn: () => fetchSheetData(settings.spreadsheetId, settings.sheetName, accessToken || ''),
    enabled: !!settings.spreadsheetId && !!accessToken
  })

  useEffect(() => {
    if (rowIndex && data?.rows) {
      const row = data.rows.find(r => r.rowIndex === rowIndex)
      if (row) {
        setFormData(row.values)
      }
    } else if (data?.headers && !rowIndex) {
      const initials: Record<string, string> = {}
      data.headers.forEach(h => {
        if ([settings.buyColumn, settings.sellColumn, settings.repairColumn, settings.transportColumn, settings.totalCostColumn, settings.profitColumn].includes(h)) {
          initials[h] = '0'
        } else {
          initials[h] = ''
        }
      })
      setFormData(initials)
    }
  }, [rowIndex, data, settings])

  // Multi-stage Auto-calculation
  useEffect(() => {
    const buy = parseFloat(formData[settings.buyColumn]) || 0
    const repair = parseFloat(formData[settings.repairColumn]) || 0
    const transport = parseFloat(formData[settings.transportColumn]) || 0
    const sell = parseFloat(formData[settings.sellColumn]) || 0
    
    // 1. Calculate Total Cost
    const totalCost = (buy + repair + transport).toString()
    
    // 2. Calculate Profit based on Total Cost
    const profit = (sell - parseFloat(totalCost)).toString()

    const updates: Record<string, string> = {}
    if (settings.totalCostColumn && formData[settings.totalCostColumn] !== totalCost) {
      updates[settings.totalCostColumn] = totalCost
    }
    if (settings.profitColumn && formData[settings.profitColumn] !== profit) {
      updates[settings.profitColumn] = profit
    }

    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }))
    }
  }, [formData[settings.buyColumn], formData[settings.repairColumn], formData[settings.transportColumn], formData[settings.sellColumn]])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!data?.headers) return
      if (rowIndex) {
        await updateSheetRow(settings.spreadsheetId, settings.sheetName, data.headers, rowIndex, formData, accessToken!)
      } else {
        await addSheetRow(settings.spreadsheetId, settings.sheetName, data.headers, formData, accessToken!)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheetData'] })
      navigate('/')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!rowIndex || !data?.sheetId) return
      await deleteSheetRow(settings.spreadsheetId, data.sheetId, rowIndex, accessToken!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheetData'] })
      navigate('/')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  const handleDelete = () => {
    if (window.confirm('Are you absolutely sure you want to delete this record? This action cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  const headers = data?.headers || []
  const profit = parseFloat(formData[settings.profitColumn]) || 0

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-3 bg-surface-container hover:bg-surface-container-high rounded-2xl text-on-surface-variant transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-headline font-bold text-2xl text-on-surface">
          {rowIndex ? 'Refine Record' : 'Log New Asset'}
        </h2>
        <div className="w-12 h-12" />
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Live Calculation Display */}
        <div className={cn(
          "p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transition-colors duration-500",
          profit >= 0 ? "bg-primary shadow-primary/20" : "bg-error shadow-error/20"
        )}>
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-2">Real-time Performance</p>
            <div className="flex items-end gap-2">
              <h3 className="font-headline font-black text-5xl tracking-tight leading-none">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(profit)}
              </h3>
              {profit >= 0 ? <TrendingUp className="w-8 h-8 mb-1" /> : <TrendingDown className="w-8 h-8 mb-1" />}
            </div>
            <p className="mt-4 text-xs font-medium opacity-70">
              Formula: Sell - (Buy + Repair + Transport)
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl font-black text-8xl flex items-center justify-center pointer-events-none">
            {profit >= 0 ? '+' : '-'}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-[2.5rem] p-8 space-y-6">
          {headers.map((header) => {
            const isAuto = [settings.profitColumn, settings.totalCostColumn].includes(header)
            const isNumeric = [settings.buyColumn, settings.sellColumn, settings.repairColumn, settings.transportColumn, settings.totalCostColumn, settings.profitColumn].includes(header)
            
            return (
              <div key={header} className="space-y-2">
                <label 
                  className={cn(
                    "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                    isNumeric ? (isAuto ? "text-secondary" : "text-primary") : "text-outline/80"
                  )}
                >
                  {header}
                  {isAuto && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-[8px] tracking-normal">CALCULATED</span>}
                </label>
                <input
                  type={isNumeric ? 'number' : 'text'}
                  readOnly={isAuto}
                  value={formData[header] || ''}
                  onChange={(e) => setFormData({ ...formData, [header]: e.target.value })}
                  className={cn(
                    "w-full ledger-input font-headline font-bold text-xl py-2",
                    isAuto && "bg-surface-container/30 opacity-70 cursor-not-allowed border-dashed"
                  )}
                  placeholder={isAuto ? 'Auto-calculated' : `Enter ${header}...`}
                />
              </div>
            )
          })}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-3 py-5 bg-on-surface text-white font-bold rounded-2xl hover:bg-on-surface/90 active:scale-95 transition-all shadow-xl disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          <span className="text-lg">{rowIndex ? 'Update Records' : 'Commit Entry'}</span>
        </button>

        {rowIndex && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full flex items-center justify-center gap-3 py-4 text-error font-bold rounded-2xl hover:bg-error-container/20 transition-all font-headline uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            <span>{deleteMutation.isPending ? 'Removing...' : 'Remove Entry Permanently'}</span>
          </button>
        )}
      </motion.form>
    </div>
  )
}

export default EntryPage
