import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  getEnrolledDetails,
  type EnrolledCourseDetails,
  type EnrolledModule,
} from '../../api/Student/studentCourse'
import { useToast } from '../../hooks/use-toast'
import TopBar from '../../components/TopBar'

import {
  ArrowLeft,
  Star,
  MessageCircle,
  Award,
  Share2,
  Clock,
  BookOpen,
  Users,
} from 'lucide-react'

export default function StudentCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { error } = useToast()

  const [courseDetails, setCourseDetails] = useState<EnrolledCourseDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return

      setIsLoading(true)

      try {
        const response = await getEnrolledDetails({
          courseId: parseInt(courseId),
        })

        if (response.success === 'true') {
          setCourseDetails(response.data)
        } else {
          error('Failed to load course details')
        }
      } catch (err) {
        console.error('Failed to load course:', err)
        error('Failed to load course details')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseData()
  }, [courseId])

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
            <Button onClick={() => navigate('/student/courses')}>Back to Courses</Button>
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
            onClick={() => navigate('/student/courses')}
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
                    .map((module: EnrolledModule) => (
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

                  {/* Progress Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Course Progress
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {courseDetails.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${courseDetails.completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {Math.round((courseDetails.completionPercentage / 100) * courseDetails.totalLessons)} of{' '}
                      {courseDetails.totalLessons} lessons completed
                    </p>
                  </div>

                  {/* Enrollment Status */}
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Enrollment Status</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      You are enrolled in this course. Access the learning materials through the dashboard.
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/student/course/${courseId}/learn`)}
                    >
                      Go to Course Learn
                    </Button>
                  </div>

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
                      onClick={() => navigate(`/student/course/${courseId}/discussions`)}
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
    </div>
  )
}
