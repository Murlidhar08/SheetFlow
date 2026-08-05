import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, BarChart3, ClipboardList, Filter, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchSheetData } from '../lib/google-sheets'
import { cn, formatCurrency } from '../lib/utils'
import { useSheetStore } from '../store/useSheetStore'

const ListPage = () => {
  const { settings, accessToken } = useSheetStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['sheetData', settings.spreadsheetId, settings.sheetName],
    queryFn: () => fetchSheetData(settings.spreadsheetId, settings.sheetName, accessToken || ''),
    enabled: !!settings.spreadsheetId && !!accessToken
  })

  if (!settings.spreadsheetId) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 text-primary shadow-inner">
          <BarChart3 className="w-10 h-10" />
        </div>
        <h2 className="font-headline font-extrabold text-3xl text-on-surface mb-3 tracking-tight">Setup Required</h2>
        <p className="text-on-surface-variant max-w-xs mb-10 font-medium leading-relaxed">Connect your Google Spreadsheet to begin tracking your financial logs.</p>
        <Link to="/settings" className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-headline font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
          Go to Configuration
        </Link>
      </div>
    )
  }

  const allRows = data?.rows || []

  const filteredRows = allRows.filter(row => {
    const title = (row.values[settings.titleColumn] || '').toLowerCase()
    const description = (row.values[settings.descriptionColumn] || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return title.includes(query) || description.includes(query)
  })

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto pb-32">

      {/* Responsive Search bar */}
      <div className="mb-8 sm:mb-12 relative">
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          <div className="relative grow">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className={cn(
                "w-5 h-5 transition-colors",
                searchQuery ? "text-primary" : "text-outline/40"
              )} />
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-5 sm:py-6 bg-surface-container-low border-0 rounded-4xl focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-headline font-bold text-lg sm:text-xl placeholder:text-outline/30 placeholder:font-normal shadow-sm group-hover:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-6 flex items-center text-outline hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 ml-6 text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.2em]"
            >
              Filtering {filteredRows.length} of {allRows.length} total entries
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Assets Grid/List */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-28 sm:h-32 bg-surface-container-low rounded-[2.5rem] animate-pulse" />
          ))
        ) : filteredRows.length === 0 ? (
          <div className="col-span-full p-16 sm:p-24 text-center bg-surface-container-low rounded-[3rem] border-2 border-dashed border-outline-variant/30">
            <Filter className="w-16 h-16 text-outline/20 mx-auto mb-6" />
            <p className="text-on-surface font-headline font-black text-2xl mb-2">
              {searchQuery ? 'No Results Found' : 'Vault Empty'}
            </p>
            <p className="text-on-surface-variant font-medium text-sm max-w-xs mx-auto opacity-70 leading-relaxed">
              {searchQuery ? 'Try matching keywords or row IDs' : 'Your asset collection is currently empty.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRows.map((row) => {
              const buy = parseFloat(row.values[settings.buyColumn]) || 0
              const repair = parseFloat(row.values[settings.repairColumn]) || 0
              const transport = parseFloat(row.values[settings.transportColumn]) || 0
              const sellText = row.values[settings.sellColumn]
              const sell = parseFloat(sellText) || 0
              const isInStock = !sellText || sell === 0
              const itemProfit = isInStock ? 0 : (sell - (buy + repair + transport))

              return (
                <motion.div
                  key={row.rowIndex}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => navigate(`/entry/${row.rowIndex}`)}
                  className="group px-4 md:px-6 py-3 md:py-4 bg-surface-container-lowest hover:bg-white rounded-[2.5rem] transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl border border-transparent hover:border-outline-variant/20 flex items-center gap-5"
                >
                  <div className={cn(
                    "w-12 md:w-16 h-12 md:h-16 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-700 group-hover:rounded-3xl group-hover:rotate-15",
                    isInStock
                      ? "bg-primary-container/10 text-primary"
                      : (itemProfit >= 0 ? "bg-secondary-container/10 text-secondary" : "bg-error-container/10 text-error")
                  )}>
                    {isInStock ? (
                      <ClipboardList className="w-7 md:w-10 h-7 md:h-10" />
                    ) : itemProfit >= 0 ? (
                      <ArrowUpRight className="w-7 md:w-10 h-7 md:h-10" />
                    ) : (
                      <ArrowDownRight className="w-7 md:w-10 h-7 md:h-10" />
                    )}
                  </div>

                  <div className="grow min-w-0">
                    <h3 className="font-headline font-black text-xl text-on-surface group-hover:text-primary transition-colors truncate mb-1">
                      {row.values[settings.titleColumn] || 'Log Item'}
                    </h3>
                    <div className="flex items-center gap-3">
                      <p className="text-on-surface-variant font-bold text-xs truncate max-w-full opacity-60">
                        {row.values[settings.descriptionColumn] || 'Archived record'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={cn(
                      "font-headline font-black text-xl sm:text-2xl tracking-tighter leading-none mb-1",
                      isInStock ? "text-primary" : (itemProfit >= 0 ? "text-secondary" : "text-error")
                    )}>
                      {isInStock ? formatCurrency(buy) : formatCurrency(itemProfit)}
                    </p>
                    <p className="text-[9px] font-black text-outline uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">
                      {isInStock ? 'Inventory' : 'Profit'}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default ListPage
