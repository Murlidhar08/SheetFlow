import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSheetStore } from './store/useSheetStore'
import LoginPage from './pages/LoginPage'
import ListPage from './pages/ListPage'
import EntryPage from './pages/EntryPage'
import SettingsPage from './pages/SettingsPage'
import PrivacyPage from './pages/PrivacyPage'
import PolicyPage from './pages/PolicyPage'
import Layout from './components/layout/Layout'

const queryClient = new QueryClient()

function App() {
  const { accessToken } = useSheetStore()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
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
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

export default App
