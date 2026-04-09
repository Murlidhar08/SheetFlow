import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSheetStore } from './store/useSheetStore'
import Layout from './components/layout/Layout'

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ListPage = lazy(() => import('./pages/ListPage'))
const EntryPage = lazy(() => import('./pages/EntryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))

const queryClient = new QueryClient()

const LoadingFallback = () => (
  <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
)

function App() {
  const { accessToken } = useSheetStore()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={!accessToken ? <LoginPage /> : <Navigate to="/" />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/policy" element={<PolicyPage />} />

              <Route element={accessToken ? <Layout /> : <Navigate to="/login" />}>
                <Route path="/" element={<ListPage />} />
                <Route path="/entry" element={<EntryPage />} />
                <Route path="/entry/:index" element={<EntryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

export default App
