import { motion } from 'framer-motion'
import { Gavel, ArrowLeft, BadgeCheck, Scale, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PolicyPage = () => {
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
            <Gavel className="w-10 h-10" />
          </div>
          <h1 className="font-headline font-black text-5xl sm:text-7xl tracking-tighter text-on-surface mb-4">Terms of Policy</h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl opacity-70">The foundational guidelines for using the SheetFlow platform.</p>
        </section>

        <div className="space-y-12 bg-surface-container-low p-8 sm:p-12 rounded-[3rem] border border-outline-variant/10 shadow-sm">
          <div className="flex gap-6">
            <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
              <BadgeCheck className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xl mb-2 text-on-surface">Eligibility</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">By using SheetFlow, you represent that you have a valid Google Account and the legal right to access and modify the spreadsheets you connect to our interface.</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xl mb-2 text-on-surface">Service Availability</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">SheetFlow is provided "as is" and relies on the Google Sheets API. While we strive for 100% uptime, availability is subject to Google's service limits and internal maintenance windows.</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xl mb-2 text-on-surface">Acceptable Use</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">Users must not use SheetFlow for any illegal activities, including unauthorized data extraction or attempting to bypass Google's API security measures.</p>
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

export default PolicyPage
