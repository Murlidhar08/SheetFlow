import { useGoogleLogin } from '@react-oauth/google'
import { useSheetStore } from '../store/useSheetStore'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Sparkles } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'

const LoginPage = () => {
  const { setUser, setAccessToken } = useSheetStore()
  const navigate = useNavigate()

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token)

      // Fetch user profile
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      })

      setUser({
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture
      })

      navigate('/')
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
  })

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6 sm:p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1100px] grid md:grid-cols-2 gap-0 overflow-hidden bg-surface-container-lowest rounded-[2.5rem] shadow-[0_32px_96px_-16px_rgba(11,28,48,0.12)] border border-white/40"
      >
        {/* Left Side: Aesthetic/Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-surface-container-low relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <LayoutDashboard className="text-white w-6 h-6" />
              </div>
              <span className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">SheetFlow</span>
            </div>

            <h1 className="font-headline font-bold text-5xl leading-tight text-on-surface mb-6">
              The Sanctuary of <span className="text-primary">Financial Clarity</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-sm font-medium leading-relaxed">
              Elevate your bookkeeping into an editorial narrative of profit and growth.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm inline-block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">Cloud-Powered Data</p>
                  <p className="text-on-surface-variant text-sm font-medium">Real-time sync with Google Sheets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Abstract decorative element */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side: Login Interaction */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-20 bg-surface-container-lowest">
          <div className="md:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <span className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">SheetFlow</span>
          </div>

          <div className="max-w-sm w-full mx-auto">
            <h2 className="font-headline font-bold text-3xl text-on-surface mb-2 tracking-tight">Welcome</h2>
            <p className="text-on-surface-variant font-medium mb-12 leading-relaxed">Simple, Flexible, and Cloud-Powered Profit Tracking for the modern achiever.</p>

            <button
              onClick={() => login()}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-2xl transition-all duration-300 group border border-outline-variant/10 hover:border-outline-variant/30 active:scale-95 shadow-sm"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-label text-lg">Sign in with Google</span>
            </button>

            <div className="mt-12 pt-12 border-t border-outline-variant/10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline/60 mb-4">Professional Analytics Suite</p>
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => navigate('/privacy')} className="text-[10px] cursor-pointer font-bold text-outline hover:text-primary uppercase tracking-widest transition-colors">Privacy</button>
                <button onClick={() => navigate('/policy')} className="text-[10px] cursor-pointer font-bold text-outline hover:text-primary uppercase tracking-widest transition-colors">Policy</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
