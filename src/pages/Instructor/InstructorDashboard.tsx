import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../context/AuthContext'
import { getInstructorDashboardInfo, type GetInstructorDashboardResponse } from '../../api/Instructor/instructorDashboard'
import { BookOpen, Users, Eye, BarChart3 } from 'lucide-react'

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<GetInstructorDashboardResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const loadDashboardData = async () => {
    try {
      const response = await getInstructorDashboardInfo({ userId: user!.id })
      setDashboardData(response.data)
    } catch (err) {
      console.error('Failed to load instructor dashboard data:', err)
      // Set default zeroed dashboard data instead of showing an error
      setDashboardData({
        totalCourse: 0,
        totalStudents: 0,
        totalModule: 0,
        totalLesson: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    loadDashboardData()
  }
}, [user])

  const stats = dashboardData ? [
    { label: 'Total Courses', value: dashboardData.totalCourse.toString(), subtitle: 'Courses created', icon: BookOpen },
    { label: 'Total Students', value: dashboardData.totalStudents.toString(), subtitle: 'Enrolled students', icon: Users },
    { label: 'Total Modules', value: dashboardData.totalModule.toString(), subtitle: 'Modules created', icon: Eye },
    { label: 'Total Lessons', value: dashboardData.totalLesson.toString(), subtitle: 'Lessons created', icon: BarChart3 },
  ] : []

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6 md:p-12 overflow-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your learning platform and courses</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className={`animate-stagger-${(i % 4) + 1} card-enhanced`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-4 text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : stats.length > 0 ? (
            stats.map((stat, i) => (
              <Card key={i} className={`animate-stagger-${(i % 4) + 1} card-enhanced`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    </div>
                    <stat.icon className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-4 text-center py-8">
              <p className="text-muted-foreground">No dashboard data available</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mb-12 card-enhanced animate-stagger-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚙️</span>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Create Course', icon: '➕', href: '/instructor/courses/create' },
                { title: 'Add Module', icon: '👁️', href: '/instructor/modules/create' },
                { title: 'Create Lesson', icon: '📖', href: '/instructor/lessons/create' },
              ].map((action, i) => (
                <Link key={i} to={action.href}>
                  <div className={`flex flex-col items-center justify-center p-6 rounded-lg border border-border hover:bg-muted transition-all duration-300 cursor-pointer animate-stagger-${(i % 3) + 1} hover:shadow-lg hover:scale-105`}>
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <p className="font-medium text-center">{action.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructor Workspace Info */}
        <Card className="card-enhanced animate-stagger-2">
          <CardHeader>
            <CardTitle>Instructor Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You have administrative access to manage all your courses, modules, and lessons.
              User Management is restricted to Platform Administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
