import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import StudentDashboard from './pages/Student/StudentDashboard'
import InstructorDashboard from './pages/Instructor/InstructorDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import { AuthProvider, useAuth } from './context/AuthContext'


function AppLayout() {
  const { isAuthenticated, user } = useAuth()
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path='/student/dashboard' element={isAuthenticated && user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" replace />} />
          <Route path='/admin/dashboard' element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} />
          <Route path='/instructor/dashboard' element={isAuthenticated && user?.role === 'instructor' ? <InstructorDashboard /> : <Navigate to="/login" replace />} />
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
