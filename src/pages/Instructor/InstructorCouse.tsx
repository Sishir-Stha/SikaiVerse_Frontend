import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { getCourseInfo, type CourseInfo } from '../../api/Instructor/instructorCourse'
import { BookOpen, Plus, Edit2, Eye, Trash2, Search } from 'lucide-react'

export default function InstructorCoursesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null)

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

  const handleViewCourse = (course: CourseInfo) => {
    setSelectedCourse(course)
  }

  const handleEditCourse = (course: CourseInfo) => {
    navigate(`/instructor/course/edit/${course.courseId}`)
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        // TODO: Add your delete API call here
        // await deleteCourse({ courseId })
        setCourses(courses.filter(c => c.courseId !== courseId))
        setFilteredCourses(filteredCourses.filter(c => c.courseId !== courseId))
      } catch (error) {
        console.error('Failed to delete course:', error)
      }
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <BookOpen size={32} />
                Manage Courses
              </h1>
              <p className="text-muted-foreground">View, edit, and manage your courses</p>
            </div>
            <Button onClick={() => navigate('/instructor/courses/create')} className="gap-2">
              <Plus size={20} />
              Create Course
            </Button>
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

          {/* Courses List */}
          {isLoading ? (
            <p className="text-muted-foreground">Loading courses...</p>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No courses yet</p>
                <Button onClick={() => navigate('/instructor/courses/create')}>
                  Create First Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredCourses.map(course => (
                <Card key={course.courseId} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <CardTitle>{course.courseTitle}</CardTitle>
                          <Badge variant="secondary" className="capitalize">{course.level}</Badge>
                          <Badge variant="outline" className="text-yellow-600">
                            ★ {course.rating.toFixed(1)}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {course.description ?? 'No description'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCourse(course)}
                          className="gap-2"
                        >
                          <Eye size={16} />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                          className="gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.courseId)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Instructor</p>
                        <p className="font-medium">{course.instructorName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Modules</p>
                        <p className="font-medium">{course.totalModules}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lessons</p>
                        <p className="font-medium">{course.totalLessons}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{formatDuration(course.totalDuration)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Course Detail Modal */}
          {selectedCourse && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{selectedCourse.courseTitle}</CardTitle>
                    <CardDescription>{selectedCourse.description ?? 'No description'}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCourse(null)}
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Instructor</p>
                      <p className="font-medium">{selectedCourse.instructorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="font-medium capitalize">{selectedCourse.level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-medium text-yellow-500">★ {selectedCourse.rating.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{formatDuration(selectedCourse.totalDuration)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Modules</p>
                      <p className="font-medium">{selectedCourse.totalModules}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lessons</p>
                      <p className="font-medium">{selectedCourse.totalLessons}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      onClick={() => {
                        handleEditCourse(selectedCourse)
                        setSelectedCourse(null)
                      }}
                      className="gap-2"
                    >
                      <Edit2 size={16} />
                      Edit Course
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/instructor/courses/${selectedCourse.courseId}`)}
                    >
                      View Full Details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCourse(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}