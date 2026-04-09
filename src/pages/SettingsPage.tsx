import { useState } from 'react'
import { useSheetStore } from '../store/useSheetStore'
import { ExternalLink, Database, LayoutGrid, Info, Columns, Edit3, Check, X, Calculator } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSheetData, updateHeaders, getSheetNames } from '../lib/google-sheets'

const SettingsPage = () => {
  const { settings, updateSettings, accessToken } = useSheetStore()
  const queryClient = useQueryClient()
  const [editingHeader, setEditingHeader] = useState<{ index: number, value: string } | null>(null)

  // Fetch sheet names for the selected spreadsheet
  const { data: sheetNames } = useQuery({
    queryKey: ['sheetNames', settings.spreadsheetId],
    queryFn: () => getSheetNames(settings.spreadsheetId, accessToken || ''),
    enabled: !!settings.spreadsheetId && !!accessToken
  })

  // Fetch headers for the selected sheet
  const { data: sheetData } = useQuery({
    queryKey: ['sheetHeaders', settings.spreadsheetId, settings.sheetName],
    queryFn: () => fetchSheetData(settings.spreadsheetId, settings.sheetName, accessToken || ''),
    enabled: !!settings.spreadsheetId && !!settings.sheetName && !!accessToken
  })

  const headers = sheetData?.headers || []

  const updateHeaderMutation = useMutation({
    mutationFn: (newHeaders: string[]) => updateHeaders(settings.spreadsheetId, settings.sheetName, newHeaders, accessToken || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheetHeaders'] })
      setEditingHeader(null)
    }
  })

  const updateField = (key: string, value: string) => {
    updateSettings({ [key]: value })
  }

  const handleRenameHeader = () => {
    if (!editingHeader || !editingHeader.value.trim()) return
    const newHeaders = [...headers]
    newHeaders[editingHeader.index] = editingHeader.value.trim()
    updateHeaderMutation.mutate(newHeaders)
  }

  const sections = [
    {
      id: 'connection',
      title: 'Data Core',
      icon: Database,
      fields: [
        {
          label: 'Spreadsheet ID',
          key: 'spreadsheetId',
          placeholder: 'Enter your Google Sheet ID'
        },
        {
          label: 'Target Tab (Sheet)',
          key: 'sheetName',
          type: 'select',
          options: (sheetNames || []).map(name => ({ value: name, label: name }))
        },
      ]
    },
    {
      id: 'mapping',
      title: 'Visual Mapping',
      icon: LayoutGrid,
      fields: [
        { label: 'Display Title', key: 'titleColumn', type: 'select', options: headers.map(h => ({ value: h, label: h })) },
        { label: 'Sub-text (Notes)', key: 'descriptionColumn', type: 'select', options: headers.map(h => ({ value: h, label: h })) },
      ]
    },
    {
      id: 'calculation',
      title: 'Financial Logic',
      icon: Calculator,
      fields: [
        { label: 'Purchase Value', key: 'buyColumn', type: 'select', options: headers.map(h => ({ value: h, label: h })) },
        { label: 'Secondary Sale', key: 'sellColumn', type: 'select', options: headers.map(h => ({ value: h, label: h })) },
        { label: 'Restoration Costs', key: 'repairColumn', type: 'select', options: headers.map(h => ({ value: h, label: h })) },
        { label: 'Logistics (Transport)', key: 'transportColumn', type: 'select', options: headers.map(h => ({ value: h, label: h })) },
        { label: 'Net Total Cost', key: 'totalCostColumn', type: 'select', options: headers.map(h => ({ value: h, label: h })) },
        { label: 'Final Profit/Yield', key: 'profitColumn', type: 'select', options: headers.map(h => ({ value: h, label: h })) },
      ]
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto pb-32">
      <div className="mb-12 text-center">
        <h2 className="font-headline font-black text-3xl sm:text-4xl text-on-surface mb-3 tracking-tighter uppercase">Cloud Configuration</h2>
        <p className="text-on-surface-variant font-medium text-sm sm:text-base opacity-70">Define the bridge between your log vault and the SheetFlow engine.</p>
      </div>

      <div className="space-y-8 sm:space-y-12">
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex gap-4">
          <Info className="w-6 h-6 text-primary shrink-0" />
          <p className="text-sm text-on-surface-variant leading-relaxed">
            <strong>Spreadsheet ID</strong> can be found in your Google Sheet URL:
            <code className="mx-1 bg-primary/10 text-primary px-1 rounded">/spreadsheets/d/[ID]/edit</code>.
          </p>
        </div>

        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-low rounded-[2.5rem] p-6 sm:p-10 border border-outline-variant/10 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 text-center sm:text-left border-b border-outline-variant/10 pb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline font-black text-xl sm:text-2xl text-on-surface uppercase tracking-tight">{section.title}</h3>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{section.id === 'connection' ? 'Environment setup' : 'Data structure mapping'}</p>
              </div>
            </div>

            <div className="grid gap-8 grid-cols-1">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-3 group">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-outline transition-colors group-focus-within:text-primary">
                      {field.label}
                    </label>
                    {field.key === 'spreadsheetId' && settings.spreadsheetId && (
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${settings.spreadsheetId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-black text-primary flex items-center gap-1.5 hover:underline transition-all active:scale-95"
                      >
                        Source <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {field.type === 'select' ? (
                    <select
                      value={(settings as any)[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="w-full bg-surface-container-lowest border-0 rounded-2xl py-4 sm:py-5 px-6 font-headline font-black text-lg sm:text-xl transition-all shadow-sm ring-1 ring-outline-variant/10 focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer"
                    >
                      <option value="">{headers.length === 0 && section.id !== 'connection' ? 'Awaiting Data...' : 'Choose Item...'}</option>
                      {(field as any).options?.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={(settings as any)[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={(field as any).placeholder}
                      className="w-full bg-surface-container-lowest border-0 rounded-2xl py-4 sm:py-5 px-6 font-headline font-black text-lg sm:text-xl transition-all shadow-sm ring-1 ring-outline-variant/10 focus:ring-4 focus:ring-primary/10 outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-container-low rounded-[2.5rem] p-6 sm:p-10 border border-outline-variant/10 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 text-center sm:text-left border-b border-outline-variant/10 pb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <Columns className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xl sm:text-2xl text-on-surface uppercase tracking-tight">Vault Headers</h3>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Metadata modification logic</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {headers.map((header, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="group flex items-center justify-between p-4 sm:p-5 bg-surface-container-lowest hover:bg-white rounded-2xl border border-outline-variant/10 transition-all shadow-sm"
                >
                  {editingHeader?.index === index ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        autoFocus
                        value={editingHeader.value}
                        onChange={(e) => setEditingHeader({ ...editingHeader, value: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameHeader()}
                        className="flex-1 bg-transparent border-b-2 border-primary outline-none font-black text-lg py-1 px-2"
                      />
                      <button onClick={handleRenameHeader} className="p-2 text-primary hover:bg-primary/20 rounded-xl transition-all">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setEditingHeader(null)} className="p-2 text-outline hover:bg-surface-container rounded-xl transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-headline font-black text-base sm:text-lg text-on-surface truncate pr-2">{header}</span>
                      <button
                        onClick={() => setEditingHeader({ index, value: header })}
                        className="p-3 bg-primary/5 text-primary hover:bg-primary/20 rounded-xl transition-all active:scale-90"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {headers.length === 0 && (
              <div className="col-span-full py-12 text-center bg-surface-container rounded-[2rem] border-2 border-dashed border-outline-variant/30">
                <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest opacity-50">Discovery Queue Empty</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage
