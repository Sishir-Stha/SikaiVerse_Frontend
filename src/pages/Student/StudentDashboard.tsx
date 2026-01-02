import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { useAuth } from '../../context/AuthContext'
import { getDashboardInfo, type GetDashboardInfoResponse } from '../../api/Student/student'
import { BookOpen, CheckCircle2, TrendingUp, Clock } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<GetDashboardInfoResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await getDashboardInfo({ userId: user!.id })
        setDashboardData(response.data)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        setError('Failed to load dashboard information')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  const formatStudyTime = (minutes: number) => {
    const hours = (minutes / 60).toFixed(1)
    return `${hours}h`
  }

  const stats = dashboardData ? [
   
    { label: 'Total Courses', value: dashboardData.totalCourse.toString(), subtitle: 'Enrolled courses', icon: BookOpen },
    { label: 'Completed', value: dashboardData.completed.toString(), subtitle: 'Courses finished', icon: CheckCircle2 },
    { label: 'In Progress', value: dashboardData.inProgress.toString(), subtitle: 'Currently learning', icon: TrendingUp },
    { label: 'Study Time', value: formatStudyTime(dashboardData.studyTime), subtitle: 'Total time spent', icon: Clock },
  ] : []

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, user! Continue your learning journey.</p>
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
              <p className="text-muted-foreground">Loading dashboard statistics...</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-1 gap-6">
          {/* My Courses */}
          <div>
            <Card className="card-enhanced animate-stagger-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} />
                  My Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading courses...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : !dashboardData || dashboardData.courseData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No enrolled courses yet</p>
                    <Link to="/courses">
                      <Button>Browse Courses</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {dashboardData.courseData.map((course, idx) => (
                      <div key={course.courseId} className={`pb-6 border-b border-border last:border-0 last:pb-0 animate-stagger-${(idx % 3) + 1} transition-all duration-300 hover:bg-muted/50 rounded-lg p-3`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{course.courseTitle}</h3>
                            <p className="text-sm text-muted-foreground">{course.courseDescription}</p>
                          </div>
                          <Badge variant="secondary">{Math.round(course.progressPercentage)}%</Badge>
                        </div>
                        <Progress value={course.progressPercentage} max={100} className="mb-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {course.totalModules} modules
                          </span>
                          <Link to={`/courses/${course.courseId}`}>
                            <Button variant="outline" size="sm">Continue</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
