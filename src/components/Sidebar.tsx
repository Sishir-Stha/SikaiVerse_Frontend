import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/button'
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  User, 
  MessageCircle, 
  PlusCircle 
} from 'lucide-react'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Role flags
  const isStudent = user?.role === 'student'
  const isAdmin = user?.role === 'admin'
  const isInstructor = user?.role === 'instructor'

  // Active link detection (includes subpaths)
  const isActive = (path: string) => location.pathname.startsWith(path)

  // Dashboard path based on role
  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard'
    if (isInstructor) return '/instructor/dashboard'
    if (isStudent) return '/student/dashboard'
    return '/dashboard'
  }

  // Navigation items
  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: getDashboardPath(),
    },
    {
      label: 'Courses',
      icon: BookOpen,
      path: isAdmin
        ? '/admin/courses'
        : isInstructor
        ? '/instructor/courses'
        : isStudent
        ? '/student/courses'
        : '/courses',
    },
    ...(isAdmin
      ? [{ label: 'Discussions', icon: MessageCircle, path: '/admin/discussions' }]
      : isInstructor
      ? [{ label: 'Discussions', icon: MessageCircle, path: '/instructor/discussions' }]
      : []),
    ...(isAdmin ? [{ label: 'Users', icon: Users, path: '/admin/users' }] : []),
    {
      label: isAdmin ? 'Settings' : 'Profile',
      icon: User,
  path: isAdmin
        ? '/admin/profile'
        : isInstructor
        ? '/instructor/profile'
        : isStudent
        ? '/student/profile'
        : '/profile',
    },
  ]

  // Management section for Admins/Instructors
  const managementItems =
    isAdmin || isInstructor
      ? [
          {
            label: 'Create Course',
            icon: PlusCircle,
            path: isAdmin ? '/admin/courses/create' : '/instructor/courses/create',
          },
          {
            label: 'Create Module',
            icon: PlusCircle,
            path: isAdmin ? '/admin/modules/create' : '/instructor/modules/create',
          },
          {
            label: 'Create Lesson',
            icon: PlusCircle,
            path: isAdmin ? '/admin/lessons/create' : '/instructor/lessons/create',
          },
        ]
      : []

  // Generate initials safely
  const getInitials = (name = '') =>
    name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '??'

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <button
          onClick={() => navigate(getDashboardPath())}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Go to Dashboard"
        >
          <BookOpen className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">Sikai Verse</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
          Navigation
        </h3>

        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
            aria-label={item.label}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Management Section */}
        {managementItems.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4 mt-6">
              Management
            </h3>
            {managementItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                aria-label={item.label}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-6 border-t border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {user?.username ? getInitials(user.username) : <User size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.username || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {user?.role || 'N/A'}
            </p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="w-full gap-2" aria-label="Logout">
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </aside>
  )
}
