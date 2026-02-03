import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import StudentDashboard from './pages/Student/StudentDashboard'
import StudentCourses from './pages/Student/StudentCourse'
import StudentProfile from './pages/Student/StudentProfile'
import StudentCourseDetails from './pages/Student/StudentCourseDetails'
import StudentLearnPage from './pages/Student/StudentLearnPage'
import InstructorDashboard from './pages/Instructor/InstructorDashboard'
import InstructorCourses from './pages/Instructor/InstructorCouse'
import InstructorCourseEditPage from './pages/Instructor/InstructorCourseEditPage'
import InstructorProfile from './pages/Instructor/InstructorProfile'
import InstructorDiscussion from './pages/Instructor/InstructorDiscussion'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminCourses from './pages/Admin/AdminCourses'
import AdminProfile from './pages/Admin/AdminProfile'
import AdminDiscussion from './pages/Admin/AdminDisussion'
import AdminUser from './pages/Admin/AdminUser' 
import AdminCourseEditPage from './pages/Admin/AdminCourseEdit'
import BrowseCoursesPage from './pages/Landing/BrowseCoursesPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import Chatbot from './components/Chatbot'


const showChatbot = location.pathname === '/' || location.pathname === '/browse'
function AppLayout() {
  const { isAuthenticated, user } = useAuth()
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowseCoursesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path='/student/dashboard' element={isAuthenticated && user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" replace />} />
          <Route path='/student/courses' element={isAuthenticated && user?.role === 'student' ? <StudentCourses /> : <Navigate to="/login" replace />} />
          <Route path='/student/profile' element={isAuthenticated && user?.role === 'student' ? <StudentProfile /> : <Navigate to="/login" replace />} />
          <Route path='/student/course/:courseId' element={isAuthenticated && user?.role === 'student' ? <StudentCourseDetails /> : <Navigate to="/login" replace />} />
          <Route path='/student/course/:courseId/learn' element={isAuthenticated && user?.role === 'student' ? <StudentLearnPage /> : <Navigate to="/login" replace />} />
          <Route path='/admin/dashboard' element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} />
          <Route path='/admin/courses' element={isAuthenticated && user?.role === 'admin' ? <AdminCourses /> : <Navigate to="/login" replace />} />   
          <Route path='/admin/profile' element={isAuthenticated && user?.role === 'admin' ? <AdminProfile /> : <Navigate to="/login" replace />} />   
          <Route path='/admin/course/edit/:courseId' element={isAuthenticated && user?.role === 'admin' ? <AdminCourseEditPage /> : <Navigate to="/login" replace />} />
          <Route path='/admin/users' element={isAuthenticated && user?.role === 'admin' ? <AdminUser /> : <Navigate to="/login" replace />} />
          <Route path='/admin/discussions' element={isAuthenticated && user?.role === 'admin' ? <AdminDiscussion /> : <Navigate to="/login" replace />} />
          <Route path='/instructor/dashboard' element={isAuthenticated && user?.role === 'instructor' ? <InstructorDashboard /> : <Navigate to="/login" replace />} />
          <Route path='/instructor/courses' element={isAuthenticated && user?.role === 'instructor' ? <InstructorCourses /> : <Navigate to="/login" replace />} />
          <Route path='/instructor/course/edit/:courseId' element={isAuthenticated && user?.role === 'instructor' ? <InstructorCourseEditPage /> : <Navigate to="/login" replace />} /> 
          <Route path='/instructor/profile' element={isAuthenticated && user?.role === 'instructor' ? <InstructorProfile /> : <Navigate to="/login" replace />} />
          <Route path='/instructor/discussions' element={isAuthenticated && user?.role === 'instructor' ? <InstructorDiscussion /> : <Navigate to="/login" replace />} />
          
        </Routes>
          {showChatbot && <Chatbot />}
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
