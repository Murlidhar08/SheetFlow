import { motion } from 'framer-motion'
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PrivacyPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-mesh p-6 sm:p-12 lg:p-20">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-12 flex items-center gap-2 text-primary font-headline font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>

        <section className="mb-16">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="font-headline font-black text-5xl sm:text-7xl tracking-tighter text-on-surface mb-4">Privacy Promise</h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl opacity-70">How SheetFlow handles your data with absolute transparency.</p>
        </section>

        <div className="space-y-12 bg-surface-container-low p-8 sm:p-12 rounded-[3rem] border border-outline-variant/10 shadow-sm">
          <div className="flex gap-6">
            <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xl mb-2 text-on-surface">Data Sovereignty</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">SheetFlow does not store your spreadsheet data on our servers. Your financial records reside exclusively within your Google Drive. We only act as a secure bridge between your browser and the Google Sheets API.</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xl mb-2 text-on-surface">Limited Access</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">We only request the specific OAuth scopes required to manage your spreadsheets. We do not access your contacts, personal emails, or other sensitive Google account information.</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xl mb-2 text-on-surface">No Tracking</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">We do not use tracking cookies or third-party analytics that monitor your individual usage patterns. Your privacy is protected by default.</p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-outline-variant/10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-outline">Last Updated: April 2026</p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
