import { useState } from 'react'
import { useSheetStore } from '../store/useSheetStore'
import { ExternalLink, Database, LayoutGrid, Info, Columns, Edit3, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSheetData, updateHeaders, listSpreadsheets, getSheetNames } from '../lib/google-sheets'

const SettingsPage = () => {
  const { settings, updateSettings, accessToken } = useSheetStore()
  const queryClient = useQueryClient()
  const [editingHeader, setEditingHeader] = useState<{ index: number, value: string } | null>(null)

  // Fetch all spreadsheets for the user
  const { data: spreadsheets } = useQuery({
    queryKey: ['spreadsheets'],
    queryFn: () => listSpreadsheets(accessToken || ''),
    enabled: !!accessToken
  })

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
      title: 'Data Connection',
      icon: Database,
      fields: [
        { label: 'Spreadsheet ID', key: 'spreadsheetId', placeholder: 'Enter your Google Sheet ID' },
        {
          label: 'Select Sheet (Tab)',
          key: 'sheetName',
          type: 'select',
          options: (sheetNames || []).map(name => ({ value: name, label: name }))
        },
      ]
    },
    {
      id: 'mapping',
      title: 'Column Mapping',
      icon: LayoutGrid,
      fields: [
        {
          label: 'Title Column',
          key: 'titleColumn',
          type: 'select',
          options: (headers || []).map(name => ({ value: name, label: name }))
        },
        {
          label: 'Description Column',
          key: 'descriptionColumn',
          type: 'select',
          options: (headers || []).map(name => ({ value: name, label: name }))
        },
      ]
    },
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto pb-20">
      <div className="mb-10 text-center">
        <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-2 tracking-tight">System Configuration</h2>
        <p className="text-on-surface-variant font-medium">Connect your Google Sheet and map your columns for calculations.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex gap-4">
          <Info className="w-6 h-6 text-primary shrink-0" />
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Choose your spreadsheet and tab. SheetFlow will automatically detect your columns and use your mapping for profit calculations.
          </p>
        </div>

        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-low rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <section.icon className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-xl text-on-surface">{section.title}</h3>
            </div>

            <div className="space-y-6">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-outline/80 group-focus-within:text-primary transition-colors">
                      {field.label}
                    </label>
                    {field.key === 'spreadsheetId' && settings.spreadsheetId && (
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${settings.spreadsheetId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline transition-all"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {field.type === 'select' || (headers.length > 0 && field.id === 'mapping') ? (
                    <select
                      value={(settings as any)[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="w-full ledger-input font-headline font-bold text-lg py-2 appearance-none cursor-pointer"
                    >
                      <option value="">{field.type === 'select' ? 'Choose...' : 'Select Column...'}</option>
                      {field.type === 'select'
                        ? (field as any).options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                        : headers.map(h => <option key={h} value={h}>{h}</option>)
                      }
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Select a Spreadsheet first"
                      disabled={field.id === 'mapping' && headers.length === 0}
                      value={(settings as any)[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="w-full ledger-input font-headline font-bold text-lg py-2 disabled:opacity-30"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low rounded-[2.5rem] p-8 border border-outline-variant/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Columns className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface">Column Overview</h3>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {headers.map((header, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="group flex items-center justify-between p-4 bg-white/50 hover:bg-white rounded-2xl border border-transparent hover:border-outline-variant/20 transition-all shadow-sm"
                >
                  {editingHeader?.index === index ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        autoFocus
                        value={editingHeader.value}
                        onChange={(e) => setEditingHeader({ ...editingHeader, value: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameHeader()}
                        className="flex-1 bg-transparent border-b-2 border-primary outline-none font-bold py-1"
                      />
                      <button onClick={handleRenameHeader} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingHeader(null)} className="p-2 text-outline hover:bg-surface-container rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-headline font-bold text-on-surface">{header}</span>
                      <button
                        onClick={() => setEditingHeader({ index, value: header })}
                        className="p-2 text-primary hover:bg-primary/20 rounded-xl transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {headers.length === 0 && (
              <p className="text-center py-10 text-on-surface-variant font-medium text-sm">
                Select a spreadsheet to see and rename columns.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage
