import { useQuery } from '@tanstack/react-query'
import { fetchSheetData } from '../lib/google-sheets'
import { useSheetStore } from '../store/useSheetStore'
import { formatCurrency, cn } from '../lib/utils'
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Search, Plus, Filter } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const ListPage = () => {
  const { settings, accessToken } = useSheetStore()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['sheetData', settings.spreadsheetId, settings.sheetName],
    queryFn: () => fetchSheetData(settings.spreadsheetId, settings.sheetName, accessToken || ''),
    enabled: !!settings.spreadsheetId && !!accessToken
  })

  if (!settings.spreadsheetId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <div className="w-20 h-20 bg-surface-container-high rounded-3xl flex items-center justify-center mb-6 text-on-surface-variant">
          <Filter className="w-10 h-10" />
        </div>
        <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Setup Required</h2>
        <p className="text-on-surface-variant max-w-xs mb-8">Please configure your Google Spreadsheet ID in settings to begin tracking.</p>
        <Link to="/settings" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          Go to Settings
        </Link>
      </div>
    )
  }

  const rows = data?.rows || []
  
  // Calculate total profit
  const totalProfit = rows.reduce((acc, row) => {
    const buy = parseFloat(row.values[settings.buyColumn]) || 0
    const repair = parseFloat(row.values[settings.repairColumn]) || 0
    const transport = parseFloat(row.values[settings.transportColumn]) || 0
    const sell = parseFloat(row.values[settings.sellColumn]) || 0
    return acc + (sell - (buy + repair + transport))
  }, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Hero Stats */}
      <section className="mb-12">
        <p className="text-on-surface-variant font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Financial Performance</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-headline font-extrabold text-6xl tracking-tight text-on-surface">
            {formatCurrency(totalProfit)}
          </h1>
          <div className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-full font-bold",
            totalProfit >= 0 ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"
          )}>
            {totalProfit >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            <span>Net Growth</span>
          </div>
        </div>
      </section>

      {/* Search & Actions */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-grow relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search entries..." 
            className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-0 group-focus-within:bg-surface-container relative z-10 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface font-medium"
          />
        </div>
        <Link to="/entry" className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-low rounded-3xl animate-pulse" />
          ))
        ) : rows.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low rounded-[2.5rem] border-2 border-dashed border-outline-variant/30">
            <p className="text-on-surface-variant font-medium text-lg">No entries found in this sheet.</p>
          </div>
        ) : (
          rows.map((row) => {
            const buy = parseFloat(row.values[settings.buyColumn]) || 0
            const repair = parseFloat(row.values[settings.repairColumn]) || 0
            const transport = parseFloat(row.values[settings.transportColumn]) || 0
            const sell = parseFloat(row.values[settings.sellColumn]) || 0
            const profit = sell - (buy + repair + transport)

            return (
              <motion.div
                key={row.rowIndex}
                onClick={() => navigate(`/entry/${row.rowIndex}`)}
                className="group p-5 bg-surface-container-lowest hover:bg-surface-container-high rounded-[2rem] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5 flex items-center gap-5 border border-transparent hover:border-primary/10"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-12",
                  profit >= 0 ? "bg-secondary-container/30 text-secondary" : "bg-error-container/30 text-error"
                )}>
                  {profit >= 0 ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
                </div>

                <div className="flex-grow overflow-hidden">
                  <h3 className="font-headline font-bold text-xl text-on-surface group-hover:text-primary transition-colors truncate">
                    {row.values[settings.titleColumn] || 'Untitled Item'}
                  </h3>
                  <p className="text-on-surface-variant font-medium text-sm truncate">
                    {row.values[settings.descriptionColumn] || 'No description provided'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className={cn(
                    "font-headline font-black text-xl",
                    profit >= 0 ? "text-secondary" : "text-error"
                  )}>
                    {formatCurrency(profit)}
                  </p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">
                    Row #{row.rowIndex}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ListPage
