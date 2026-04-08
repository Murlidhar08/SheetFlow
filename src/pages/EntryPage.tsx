import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSheetData, addSheetRow, updateSheetRow, deleteSheetRow } from '../lib/google-sheets'
import { useSheetStore } from '../store/useSheetStore'
import { ChevronLeft, Save, Trash2, Loader2, TrendingUp, TrendingDown, ClipboardList } from 'lucide-react'
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

  useEffect(() => {
    const buy = parseFloat(formData[settings.buyColumn]) || 0
    const repair = parseFloat(formData[settings.repairColumn]) || 0
    const transport = parseFloat(formData[settings.transportColumn]) || 0
    const sell = parseFloat(formData[settings.sellColumn]) || 0

    const totalCost = (buy + repair + transport).toString()
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
    if (window.confirm('Delete this record permanently? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-primary">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-headline font-bold uppercase tracking-widest text-[10px]">Loading Vault...</p>
      </div>
    )
  }

  const headers = data?.headers || []
  const profit = parseFloat(formData[settings.profitColumn]) || 0

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <button
          onClick={() => navigate('/')}
          className="p-3 bg-surface-container hover:bg-surface-container-high rounded-2xl text-on-surface-variant transition-all active:scale-90"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-headline font-black text-2xl sm:text-3xl text-on-surface tracking-tight leading-none mb-1">
            {rowIndex ? 'Update Vault' : 'Secure Entry'}
          </h2>
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{rowIndex ? `Editing Row #${rowIndex}` : 'New Transaction'}</span>
        </div>
        <div className="w-12 h-12 flex items-center justify-center text-primary/30">
          <ClipboardList className="w-6 h-6" />
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleSubmit}
        className="space-y-6 sm:space-y-10"
      >
        {/* Dynamic Profit Card - Responsive sizing */}
        <div className={cn(
          "p-8 sm:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transition-all duration-700",
          profit >= 0 ? "bg-primary shadow-primary/25" : "bg-error shadow-error/25"
        )}>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70 text-center sm:text-left">Yield Assessment</p>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 overflow-hidden">
              <h3 className="font-headline font-black text-4xl sm:text-5xl md:text-6xl tracking-tighter leading-none break-all text-center sm:text-left">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(profit)}
              </h3>
              <div className="flex items-center gap-2 pb-1">
                {profit >= 0 ? <TrendingUp className="w-8 h-8 opacity-80" /> : <TrendingDown className="w-8 h-8 opacity-80" />}
              </div>
            </div>
            <p className="mt-8 text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] border-t border-white/10 pt-4 text-center sm:text-left">
              Net Profit calculated after all operational costs
            </p>
          </div>
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-black/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="bg-surface-container-low/50 rounded-[3rem] p-6 sm:p-10 space-y-8 border border-outline-variant/10 shadow-inner">
          {headers.map((header) => {
            const isAuto = [settings.profitColumn, settings.totalCostColumn].includes(header)
            const isNumeric = [settings.buyColumn, settings.sellColumn, settings.repairColumn, settings.transportColumn, settings.totalCostColumn, settings.profitColumn].includes(header)

            return (
              <div key={header} className="space-y-3 group">
                <div className="flex items-center justify-between px-1">
                  <label
                    className={cn(
                      "text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors",
                      isNumeric ? (isAuto ? "text-secondary" : "text-primary") : "text-outline"
                    )}
                  >
                    {header}
                  </label>
                  {isAuto && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-[4px] text-[8px] font-black tracking-widest uppercase">Computed</span>}
                </div>
                <input
                  type={isNumeric ? 'number' : 'text'}
                  readOnly={isAuto}
                  value={formData[header] || ''}
                  autoComplete="off"
                  onChange={(e) => setFormData({ ...formData, [header]: e.target.value })}
                  className={cn(
                    "w-full bg-surface-container-lowest border-0 rounded-2xl py-4 sm:py-5 px-6 font-headline font-black text-xl sm:text-2xl transition-all shadow-sm ring-1 ring-outline-variant/10 focus:ring-4 focus:ring-primary/10",
                    isAuto && "bg-surface-container opacity-60 cursor-not-allowed ring-0 shadow-none border-t border-b border-dashed border-outline-variant/30"
                  )}
                  placeholder={isAuto ? 'SYSTEM GENERATED' : `Enter ${header}`}
                />
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={mutation.isPending || deleteMutation.isPending}
            className="w-full flex items-center justify-center gap-4 py-6 bg-on-surface text-white font-headline font-black rounded-[2.5rem] hover:bg-primary active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50 text-lg tracking-tighter"
          >
            {mutation.isPending ? <Loader2 className="w-7 h-7 animate-spin" /> : <Save className="w-7 h-7" />}
            <span>{rowIndex ? 'Sync Records' : 'Add Entry'}</span>
          </button>

          {rowIndex && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending || mutation.isPending}
              className="w-full flex items-center justify-center gap-3 py-5 text-error font-headline font-black rounded-3xl hover:bg-error-container/20 active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-30"
            >
              {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              <span>{deleteMutation.isPending ? 'Wiping record...' : 'Wipe From Vault'}</span>
            </button>
          )}
        </div>
      </motion.form>
    </div>
  )
}

export default EntryPage
