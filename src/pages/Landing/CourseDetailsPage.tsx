import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { getCourseDetails, enrollCourse } from '../../api/Landing/landing'
import type { CourseDetails, CourseModule } from '../../api/Landing/landing'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/use-toast'
import TopBar from '../../components/TopBar'
import EnrollmentConfirmDialog from '../../components/EnrollmentConfirmDialog'
import {
  ArrowLeft,
  Star,
  MessageCircle,
  Award,
  Share2,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
} from 'lucide-react'

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { error, success } = useToast()

  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false)

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) {
        console.warn('No courseId in URL params')
        return
      }

      const parsedCourseId = parseInt(courseId)
      console.log('=== LOADING COURSE DETAILS ===')
      console.log('Raw courseId from URL:', courseId)
      console.log('Parsed courseId:', parsedCourseId)
      console.log('isNaN:', isNaN(parsedCourseId))

      setIsLoading(true)

      try {
        console.log('Calling getCourseDetails with:', { courseId: parsedCourseId })
        const response = await getCourseDetails({
          courseId: parsedCourseId,
        })

        console.log('getCourseDetails Response:', response)

        if (response.success === 'true') {
          setCourseDetails(response.data)
          setIsEnrolled(false)
        } else {
          console.error('Response success is not true:', response.success)
          error('Failed to load course details')
        }
      } catch (err) {
        console.error('=== LOAD COURSE ERROR ===')
        console.error('Full error:', err)
        console.error('Error message:', err instanceof Error ? err.message : String(err))
        error('Failed to load course details')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseData()
  }, [courseId])

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login')
      return
    }

    // Check if user role is student
    if (user?.role !== 'student') {
      error('Only students can enroll in courses')
      return
    }

    // Show confirmation dialog if authenticated and is student
    setShowEnrollConfirm(true)
  }

  const handleConfirmEnroll = async () => {
    if (!user || !courseId) return

    try {
      setIsEnrolling(true)
      await enrollCourse({
        userId: user.id,
        courseId: parseInt(courseId),
      })

      setEnrollmentSuccess(true)
      success('Successfully enrolled in the course!')
      setShowEnrollConfirm(false)
      
      // After successful enrollment, redirect to course learn page after a brief delay
      setTimeout(() => {
        navigate(`/student/course/${courseId}/learn`)
      }, 1500)
    } catch (err) {
      console.error('Enrollment failed:', err)
      error('Failed to enroll in the course. Please try again.')
    } finally {
      setIsEnrolling(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </div>
    )
  }

  // Course not found state
  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Course not found</p>
            <Button onClick={() => navigate('/browse')}>Back to Courses</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center gap-2 text-primary hover:underline mb-6 transition-all duration-200 hover:gap-3"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Provider Info */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {courseDetails.instructorName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {courseDetails.instructorName}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {courseDetails.courseTitle}
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {courseDetails.description}
              </p>

              {/* Info Chips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Level</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {courseDetails.level}
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <BookOpen size={14} className="text-gray-600 dark:text-gray-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Modules</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {courseDetails.totalModules}
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <BookOpen size={14} className="text-gray-600 dark:text-gray-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Lessons</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {courseDetails.totalLessons}
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock size={14} className="text-gray-600 dark:text-gray-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {courseDetails.totalDuration}h
                  </p>
                </div>
              </div>

              {/* Syllabus Section */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Syllabus
                </h2>
                <div className="space-y-3">
                  {courseDetails.modules
                    .sort((a, b) => a.moduleOrderNo - b.moduleOrderNo)
                    .map((module: CourseModule) => (
                      <div
                        key={module.moduleId}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              Module {module.moduleOrderNo}: {module.moduleTitle}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {module.noOfLesson} lessons
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>

              {/* Certificate Section */}
              <section className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <Award size={32} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Earn a shareable certificate
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Complete the course and earn a certificate that you can share with employers and on your professional network.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 space-y-6">
                  {/* Course Image */}
                  <div className="aspect-video bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg overflow-hidden">
                    <img
                      src={courseDetails.image}
                      alt={courseDetails.courseTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x225?text=Course+Image'
                      }}
                    />
                  </div>

                  {/* Enrollment Status */}
                  {enrollmentSuccess ? (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            Enrollment Successful!
                          </h3>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            You have successfully enrolled. Redirecting you to the course...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : isEnrolled ? (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Already Enrolled
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        You are enrolled in this course. Access the learning materials through the dashboard.
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/student/course/${courseId}/learn`)}
                      >
                        Go to Course
                      </Button>
                    </div>
                  ) : isAuthenticated && user?.role !== 'student' ? (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Enrollment Not Available
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Only students can enroll in courses. Your current role is <strong>{user?.role}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        Ready to Learn?
                      </h3>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                        {isAuthenticated 
                          ? 'Enroll in this course to start learning and access all course materials.'
                          : 'Sign up or log in to enroll in this course and start learning.'}
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={handleEnrollClick}
                        disabled={isEnrolling}
                      >
                        {isEnrolling ? 'Enrolling...' : isAuthenticated ? 'Enroll Now' : 'Sign In to Enroll'}
                      </Button>
                    </div>
                  )}

                  {/* Course Stats */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Course Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Students</p>
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-gray-600 dark:text-gray-400" />
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {courseDetails.totalStudents.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {courseDetails.rating}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Category</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {courseDetails.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {courseDetails.level}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Language</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">English</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Instructor</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {courseDetails.instructorName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {courseDetails.instructorName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Expert Instructor</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Resources */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                    <h3 className="font-bold text-gray-900 dark:text-white">Course Resources</h3>
                    <button className="w-full text-left text-sm text-blue-600 hover:underline flex items-center gap-2">
                      <Share2 size={16} />
                      Share this course
                    </button>
                    <button
                      onClick={() => navigate(`/student/course/${courseId}/forum`)}
                      className="w-full text-left text-sm text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Discussion Forum
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Confirmation Dialog */}
      <EnrollmentConfirmDialog
        isOpen={showEnrollConfirm}
        title="Confirm Enrollment"
        description="Once you enroll in this course, you will have access to all course materials, lessons, and resources."
        courseName={courseDetails?.courseTitle}
        onConfirm={handleConfirmEnroll}
        onCancel={() => setShowEnrollConfirm(false)}
        isLoading={isEnrolling}
      />
    </div>
  )
}
