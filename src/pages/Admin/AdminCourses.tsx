import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { getCourseInfo, type CourseInfo } from '../../api/Admin/adminCourse' 

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        const response = await getCourseInfo({ userId: user.id })
        if (response.success === 'true') {
          setCourses(response.data)
          setFilteredCourses(response.data)
        }
      } catch (error) {
        console.error('Failed to load courses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [user])

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    )
    setFilteredCourses(filtered)
  }, [searchTerm, courses])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground">
              Explore your enrolled courses and continue learning
            </p>
          </div>

          {/* Search */}
          <div className="mb-8 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found</p>
              <Link to="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <Card key={course.courseId} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
                    <img
                      src={`https://via.placeholder.com/400x200?text=${encodeURIComponent(course.courseTitle)}`}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600">Enrolled</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{course.courseTitle}</CardTitle>
                        <CardDescription>{course.instructorName}</CardDescription>
                      </div>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description ?? 'No description'}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{course.totalLessons} lessons</span>
                        <span className="text-yellow-500">★ {course.rating}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}m • {course.totalModules} modules
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/courses/${course.courseId}`} className="flex-1">
                          <Button className="w-full">Continue</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
