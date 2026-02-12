import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { getCourseInfo, type CourseInfo } from '../../api/Instructor/instructorCourse'
import { deleteCourse, isDeleteCourseSuccess } from '../../api/Shared/Privileged/PrivilegedCourse'
import { BookOpen, Plus, Edit2, Eye, Trash2, Search, AlertTriangle, Loader2 } from 'lucide-react'

export default function InstructorCoursesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null)

  // Delete state
  const [courseToDelete, setCourseToDelete] = useState<CourseInfo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  const handleDeleteClick = (course: CourseInfo) => {
    setCourseToDelete(course)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await deleteCourse({ courseId: courseToDelete.courseId })

      if (isDeleteCourseSuccess(response)) {
        setCourses(prev => prev.filter(c => c.courseId !== courseToDelete.courseId))
        setFilteredCourses(prev => prev.filter(c => c.courseId !== courseToDelete.courseId))

        if (selectedCourse?.courseId === courseToDelete.courseId) {
          setSelectedCourse(null)
        }

        setCourseToDelete(null)
      } else {
        setDeleteError(response.message || 'Failed to delete course.')
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
      setDeleteError('An unexpected error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setCourseToDelete(null)
    setDeleteError(null)
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
            <Button onClick={() => navigate('/courses/create')} className="gap-2">
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
                <Button onClick={() => navigate('/courses/create')}>
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
                          onClick={() => handleDeleteClick(course)}
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

          {/* Delete Confirmation Modal */}
          {courseToDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Delete Course</CardTitle>
                      <CardDescription>This action cannot be undone.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to permanently delete the course:
                    </p>
                    <p className="mt-2 font-semibold text-foreground">
                      "{courseToDelete.courseTitle}"
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      All modules, lessons, and student enrollments associated with this
                      course will be removed permanently.
                    </p>
                  </div>

                  {deleteError && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                      <p className="text-sm text-destructive">{deleteError}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelDelete}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Delete Course
                        </>
                      )}
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