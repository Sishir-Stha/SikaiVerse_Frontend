import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { BookOpen, Search, Bell, User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function TopBar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
    navigate('/')
  }

  const handleDashboard = () => {
    setShowProfileMenu(false)
    const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor' : '/dashboard'
    navigate(dashboardPath)
  }

  const handleSettings = () => {
    setShowProfileMenu(false)
    navigate('/profile')
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Logo - Clickable Home Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <BookOpen className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold">Sikai Verse</span>
        </button>

        {/* Search Bar - Center */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-4 top-3 text-muted-foreground" size={20} />
          <Input
            placeholder="What do you want to learn?"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            className="pl-12 h-10 text-sm rounded-full"
          />
        </div>

        {/* Right Side - Notifications, Profile, Auth */}
        <div className="flex gap-4 items-center flex-shrink-0">
          {isAuthenticated && (
            <>
              {/* Notification Bell */}
              <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
                <Bell size={20} className="text-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <User size={18} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold">{user?.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleSettings}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      onClick={handleDashboard}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 text-red-600"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!isAuthenticated && (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Login
              </button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
