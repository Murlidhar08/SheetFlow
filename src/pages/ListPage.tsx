import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSheetData } from '../lib/google-sheets'
import { useSheetStore } from '../store/useSheetStore'
import { formatCurrency, cn } from '../lib/utils'
import { ArrowUpRight, ArrowDownRight, Search, Plus, Filter, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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

  const allRows = data?.rows || []
  
  // Calculate total profit for ALL entries
  const totalProfit = allRows.reduce((acc, row) => {
    const buy = parseFloat(row.values[settings.buyColumn]) || 0
    const repair = parseFloat(row.values[settings.repairColumn]) || 0
    const transport = parseFloat(row.values[settings.transportColumn]) || 0
    const sell = parseFloat(row.values[settings.sellColumn]) || 0
    return acc + (sell - (buy + repair + transport))
  }, 0)

  // Filter rows based on search query
  const filteredRows = allRows.filter(row => {
    const title = (row.values[settings.titleColumn] || '').toLowerCase()
    const description = (row.values[settings.descriptionColumn] || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return title.includes(query) || description.includes(query)
  })

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      {/* Hero Stats */}
      <section className="mb-12">
        <p className="text-on-surface-variant font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Portfolio Value</p>
        <div className="flex items-end justify-between gap-4">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-headline font-extrabold text-6xl tracking-tight text-on-surface"
          >
            {formatCurrency(totalProfit)}
          </motion.h1>
          <div className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-full font-bold",
            totalProfit >= 0 ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"
          )}>
            {totalProfit >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            <span>{totalProfit >= 0 ? 'Net Profit' : 'Net Loss'}</span>
          </div>
        </div>
      </section>

      {/* Modern Search Filter bar */}
      <div className="mb-10 relative group">
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className={cn(
                "w-5 h-5 transition-colors",
                searchQuery ? "text-primary" : "text-outline/50"
              )} />
            </div>
            <input 
              type="text" 
              placeholder="Search by title or notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-5 bg-surface-container-low border-0 rounded-[2rem] focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-headline font-bold text-lg placeholder:text-outline/40 placeholder:font-normal shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-5 flex items-center text-outline hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <Link 
            to="/entry" 
            className="hidden sm:flex items-center gap-2 px-6 py-5 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-bold whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> New Log
          </Link>
          
          {/* Small floating FAB for mobile */}
          <Link 
            to="/entry" 
            className="sm:hidden fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform"
          >
            <Plus className="w-8 h-8" />
          </Link>
        </div>
        
        {searchQuery && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 ml-6 text-xs font-bold text-primary flex items-center gap-2"
          >
            Showing {filteredRows.length} of {allRows.length} records
          </motion.p>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-low rounded-3xl animate-pulse" />
          ))
        ) : filteredRows.length === 0 ? (
          <div className="p-16 text-center bg-surface-container-low rounded-[3rem] border-2 border-dashed border-outline-variant/30">
            <p className="text-on-surface-variant font-headline font-bold text-xl mb-1">
              {searchQuery ? 'No matches found' : 'Your vault is empty'}
            </p>
            <p className="text-on-surface-low font-medium text-sm">
              {searchQuery ? `Try adjusting your search for "${searchQuery}"` : 'Start loging your assets to see them here.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRows.map((row) => {
              const buy = parseFloat(row.values[settings.buyColumn]) || 0
              const repair = parseFloat(row.values[settings.repairColumn]) || 0
              const transport = parseFloat(row.values[settings.transportColumn]) || 0
              const sell = parseFloat(row.values[settings.sellColumn]) || 0
              const profit = sell - (buy + repair + transport)

              return (
                <motion.div
                  key={row.rowIndex}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => navigate(`/entry/${row.rowIndex}`)}
                  className="group p-5 bg-surface-container-lowest hover:bg-white rounded-[2.2rem] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5 flex items-center gap-5 border border-transparent hover:border-outline-variant/20"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-6",
                    profit >= 0 ? "bg-secondary-container/30 text-secondary" : "bg-error-container/30 text-error"
                  )}>
                    {profit >= 0 ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
                  </div>

                  <div className="flex-grow overflow-hidden">
                    <h3 className="font-headline font-black text-xl text-on-surface group-hover:text-primary transition-colors truncate">
                      {row.values[settings.titleColumn] || 'Log Entry'}
                    </h3>
                    <p className="text-on-surface-variant font-medium text-xs truncate opacity-70">
                      {row.values[settings.descriptionColumn] || 'No notes attached to this record'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={cn(
                      "font-headline font-black text-xl tracking-tight leading-none mb-1",
                      profit >= 0 ? "text-secondary" : "text-error"
                    )}>
                      {formatCurrency(profit)}
                    </p>
                    <p className="text-[9px] font-bold text-outline opacity-40 uppercase tracking-widest">
                      ID-{row.rowIndex}
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
