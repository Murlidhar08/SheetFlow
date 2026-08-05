import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  ClipboardList,
  DollarSign,
  PackageCheck,
  Percent,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Wrench
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchSheetData } from '../lib/google-sheets'
import { cn, formatCurrency } from '../lib/utils'
import { useSheetStore } from '../store/useSheetStore'

const DashboardPage = () => {
  const { settings, accessToken } = useSheetStore()
  const navigate = useNavigate()

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

  // Comprehensive analytics calculation
  const metrics = allRows.reduce(
    (acc, row) => {
      const buy = parseFloat(row.values[settings.buyColumn]) || 0
      const repair = parseFloat(row.values[settings.repairColumn]) || 0
      const transport = parseFloat(row.values[settings.transportColumn]) || 0
      const totalCost = buy + repair + transport

      const sellText = row.values[settings.sellColumn]
      const sell = parseFloat(sellText) || 0
      const isInStock = !sellText || sell === 0
      const itemProfit = isInStock ? 0 : sell - totalCost

      acc.totalItems += 1
      acc.totalCostAll += totalCost
      acc.totalRepairs += repair
      acc.totalTransport += transport

      if (isInStock) {
        acc.inStockCount += 1
        acc.inStockSpend += totalCost
        if (!acc.highestCostInventory || totalCost > acc.highestCostInventoryCost) {
          acc.highestCostInventory = row
          acc.highestCostInventoryCost = totalCost
        }
      } else {
        acc.soldCount += 1
        acc.totalProfit += itemProfit
        acc.totalRevenue += sell
        acc.soldCostTotal += totalCost

        if (!acc.topProfitItem || itemProfit > acc.topProfitItemProfit) {
          acc.topProfitItem = row
          acc.topProfitItemProfit = itemProfit
        }
      }

      return acc
    },
    {
      totalItems: 0,
      totalProfit: 0,
      inStockCount: 0,
      inStockSpend: 0,
      soldCount: 0,
      totalRevenue: 0,
      totalCostAll: 0,
      soldCostTotal: 0,
      totalRepairs: 0,
      totalTransport: 0,
      topProfitItem: null as any,
      topProfitItemProfit: 0,
      highestCostInventory: null as any,
      highestCostInventoryCost: 0
    }
  )

  const avgProfitPerSale = metrics.soldCount > 0 ? metrics.totalProfit / metrics.soldCount : 0
  const roi = metrics.soldCostTotal > 0 ? (metrics.totalProfit / metrics.soldCostTotal) * 100 : 0
  const sellThroughRate = metrics.totalItems > 0 ? Math.round((metrics.soldCount / metrics.totalItems) * 100) : 0

  const recentRows = [...allRows].reverse().slice(0, 5)

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-surface-container-low rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-surface-container-low rounded-[2.5rem]" />
          <div className="space-y-6">
            <div className="h-28 bg-surface-container-low rounded-4xl" />
            <div className="h-28 bg-surface-container-low rounded-4xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto pb-32 space-y-10 sm:space-y-14">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Vault Overview</span>
          </div>
          <h1 className="font-headline font-black text-3xl sm:text-4xl text-on-surface tracking-tight">
            Portfolio Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/entry"
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-headline font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs tracking-wide"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Transaction</span>
          </Link>
          <Link
            to="/list"
            className="flex items-center gap-2 px-5 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline font-bold rounded-2xl transition-all text-xs tracking-wide border border-outline-variant/10"
          >
            <ClipboardList className="w-4 h-4 text-primary" />
            <span>View All Logs</span>
          </Link>
        </div>
      </div>

      {/* Hero Stats Section (Matching design reference) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Profit Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "md:col-span-2 p-8 sm:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group transition-all duration-700",
              metrics.totalProfit >= 0 ? "bg-primary shadow-primary/30" : "bg-error shadow-error/30"
            )}
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">
                Portfolio Net Worth
              </p>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                <h2 className="font-headline font-black text-5xl sm:text-6xl md:text-7xl tracking-tighter leading-none break-all">
                  {formatCurrency(metrics.totalProfit)}
                </h2>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit backdrop-blur-md">
                  {metrics.totalProfit >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-secondary-container" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{metrics.totalProfit >= 0 ? 'Realized Profit' : 'Net Loss'}</span>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700 transform group-hover:scale-110">
              <BarChart3 className="w-36 h-36" />
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6">
            {/* Active Inventory Count */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-surface-container-high rounded-4xl border border-outline-variant/10 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors group"
            >
              <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">
                Active Inventory
              </p>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-headline font-black text-4xl text-on-surface">{metrics.inStockCount}</h3>
                  <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">
                    Units In stock
                  </p>
                </div>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <ClipboardList className="w-7 h-7" />
                </div>
              </div>
            </motion.div>

            {/* Inventory Capital */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-surface-container-high rounded-4xl border border-outline-variant/10 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors group"
            >
              <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">
                Capital In Stock
              </p>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-headline font-black text-3xl text-on-surface truncate">
                    {formatCurrency(metrics.inStockSpend)}
                  </h3>
                  <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">
                    Total Investment
                  </p>
                </div>
                <div className="w-14 h-14 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl flex items-center justify-center text-on-surface/40 shadow-sm group-hover:text-primary transition-colors">
                  <BarChart3 className="w-7 h-7" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Extra Financial & Operational Details Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-black text-xl text-on-surface uppercase tracking-tight">
            Financial & Performance Analytics
          </h2>
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
            {metrics.totalItems} Total Records Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10 space-y-3 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-outline uppercase tracking-widest">Total Sales Revenue</span>
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="font-headline font-black text-2xl text-on-surface">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <p className="text-[10px] font-bold text-on-surface-variant/60">From {metrics.soldCount} completed sales</p>
          </div>

          {/* Average Profit per Sale */}
          <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10 space-y-3 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-outline uppercase tracking-widest">Avg Profit / Sale</span>
              <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="font-headline font-black text-2xl text-on-surface">
              {formatCurrency(avgProfitPerSale)}
            </p>
            <p className="text-[10px] font-bold text-on-surface-variant/60">Net margin per completed order</p>
          </div>

          {/* Overall ROI % */}
          <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10 space-y-3 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-outline uppercase tracking-widest">Realized ROI</span>
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <p className="font-headline font-black text-2xl text-on-surface">
              {roi.toFixed(1)}%
            </p>
            <p className="text-[10px] font-bold text-on-surface-variant/60">Return on cost of sold goods</p>
          </div>

          {/* Sell-Through Rate */}
          <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10 space-y-3 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-outline uppercase tracking-widest">Sell-Through Rate</span>
              <div className="p-2.5 bg-surface-container-high text-on-surface rounded-xl">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="font-headline font-black text-2xl text-on-surface">
              {sellThroughRate}%
            </p>
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${sellThroughRate}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Operational Expenses & Key Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses Breakdown */}
        <div className="p-8 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <div>
              <h3 className="font-headline font-black text-lg text-on-surface uppercase tracking-tight">Operational Costs</h3>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Expense distribution</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-headline font-black text-sm text-on-surface">Total Repair Expenses</p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Maintenance & Upgrades</p>
                </div>
              </div>
              <span className="font-headline font-black text-base text-on-surface">
                {formatCurrency(metrics.totalRepairs)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-headline font-black text-sm text-on-surface">Total Transport Costs</p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Logistics & Shipping</p>
                </div>
              </div>
              <span className="font-headline font-black text-base text-on-surface">
                {formatCurrency(metrics.totalTransport)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-surface-container-high text-on-surface/70 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-headline font-black text-sm text-on-surface">Capital Invested Across All Items</p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Combined Procurement Cost</p>
                </div>
              </div>
              <span className="font-headline font-black text-base text-on-surface">
                {formatCurrency(metrics.totalCostAll)}
              </span>
            </div>
          </div>
        </div>

        {/* Highlights & Top Performers */}
        <div className="p-8 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <div>
              <h3 className="font-headline font-black text-lg text-on-surface uppercase tracking-tight">Key Highlights</h3>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Top items & assets</p>
            </div>
            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4 grow justify-center flex flex-col">
            {metrics.topProfitItem ? (
              <div
                onClick={() => navigate(`/entry/${metrics.topProfitItem.rowIndex}`)}
                className="p-4 bg-surface-container-lowest hover:bg-white rounded-2xl border border-outline-variant/10 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Highest Profit Sale</span>
                  <h4 className="font-headline font-black text-base text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-[260px]">
                    {metrics.topProfitItem.values[settings.titleColumn] || 'Log Item'}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-headline font-black text-base text-secondary block">
                    +{formatCurrency(metrics.topProfitItemProfit)}
                  </span>
                  <span className="text-[9px] font-bold text-outline">Profit</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-surface-container-lowest rounded-2xl text-center text-xs font-bold text-outline">
                No completed sales recorded yet
              </div>
            )}

            {metrics.highestCostInventory ? (
              <div
                onClick={() => navigate(`/entry/${metrics.highestCostInventory.rowIndex}`)}
                className="p-4 bg-surface-container-lowest hover:bg-white rounded-2xl border border-outline-variant/10 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Highest Value In Stock</span>
                  <h4 className="font-headline font-black text-base text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-[260px]">
                    {metrics.highestCostInventory.values[settings.titleColumn] || 'Log Item'}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-headline font-black text-base text-primary block">
                    {formatCurrency(metrics.highestCostInventoryCost)}
                  </span>
                  <span className="text-[9px] font-bold text-outline">Investment</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-surface-container-lowest rounded-2xl text-center text-xs font-bold text-outline">
                No active inventory items
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-black text-xl text-on-surface uppercase tracking-tight">Recent Activity</h3>
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Latest transactions added to vault</p>
          </div>
          <Link
            to="/list"
            className="text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
          >
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentRows.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-low rounded-3xl border border-outline-variant/10 text-on-surface-variant font-medium text-sm">
              No entries found. Click <Link to="/entry" className="text-primary font-bold hover:underline">New Transaction</Link> to create your first log.
            </div>
          ) : (
            recentRows.map((row) => {
              const buy = parseFloat(row.values[settings.buyColumn]) || 0
              const repair = parseFloat(row.values[settings.repairColumn]) || 0
              const transport = parseFloat(row.values[settings.transportColumn]) || 0
              const sellText = row.values[settings.sellColumn]
              const sell = parseFloat(sellText) || 0
              const isInStock = !sellText || sell === 0
              const itemProfit = isInStock ? 0 : sell - (buy + repair + transport)

              return (
                <div
                  key={row.rowIndex}
                  onClick={() => navigate(`/entry/${row.rowIndex}`)}
                  className="p-5 bg-surface-container-lowest hover:bg-white rounded-3xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl border border-transparent hover:border-outline-variant/20 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-headline font-black text-sm",
                      isInStock ? "bg-primary/10 text-primary" : (itemProfit >= 0 ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error")
                    )}>
                      #{row.rowIndex}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-headline font-black text-lg text-on-surface group-hover:text-primary transition-colors truncate">
                        {row.values[settings.titleColumn] || 'Log Item'}
                      </h4>
                      <p className="text-xs text-on-surface-variant/60 truncate font-medium">
                        {row.values[settings.descriptionColumn] || 'No notes'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-4">
                    <div>
                      <p className={cn(
                        "font-headline font-black text-lg tracking-tight",
                        isInStock ? "text-primary" : (itemProfit >= 0 ? "text-secondary" : "text-error")
                      )}>
                        {isInStock ? formatCurrency(buy) : formatCurrency(itemProfit)}
                      </p>
                      <span className="text-[9px] font-black text-outline uppercase tracking-widest">
                        {isInStock ? 'In Stock' : (itemProfit >= 0 ? 'Profit' : 'Loss')}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-outline/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
