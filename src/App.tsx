import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import { AuthProvider, useAuth } from './context/AuthContext'


function AppLayout() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // Handle redirect if user lands on generic '/' but is logged in
  if (isAuthenticated && location.pathname === '/') {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    if (user?.role === 'instructor') return <Navigate to="/instructor" replace />
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
        </Routes>
        <Toaster />
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  )
}

export default App
