import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, ChevronDown, ChevronRight, CheckCircle2, Clock, BookOpen, Play } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ✅ import your API functions
import {
  getCourseSidebar,
  getLessonDetails,
  getEnrolledDetails,
  isEnrolled as checkIsEnrolled,
  setLessonInProgress,
  setLessonCompleted,
  type SidebarModule,
  type LessonDetails,
  type EnrolledCourseDetails,
} from '../../api/Student/studentCourse'

export default function CourseLearnPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user, token } = useAuth()

  const [sidebar, setSidebar] = useState<SidebarModule[]>([])
  const [courseInfo, setCourseInfo] = useState<EnrolledCourseDetails | null>(null)

  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null)
  const [currentLesson, setCurrentLesson] = useState<LessonDetails | null>(null)

  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const numericCourseId = useMemo(() => {
    const id = Number(courseId)
    return Number.isFinite(id) ? id : null
  }, [courseId])

  // Check authentication on mount (wait for auth context to be ready)
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    
    if (storedToken && storedUser && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry)
      if (Date.now() < expiryTime) {
        setAuthChecked(true)
        return
      }
    }
    setAuthChecked(true)
  }, [])

  // Flatten lessons for next/previous navigation
  const lessonOrder = useMemo(() => {
    const all: { moduleId: number; moduleTitle: string; lessonId: number; lessonTitle: string }[] = []
    for (const m of sidebar) {
      for (const l of m.lessons) {
        all.push({
          moduleId: m.moduleId,
          moduleTitle: m.moduleTitle,
          lessonId: l.lessonId,
          lessonTitle: l.lessonTitle,
        })
      }
    }
    return all
  }, [sidebar])

  const currentIndex = useMemo(() => {
    if (!currentLessonId) return -1
    return lessonOrder.findIndex(x => x.lessonId === currentLessonId)
  }, [lessonOrder, currentLessonId])

  const nextLessonId =
    currentIndex >= 0 && currentIndex < lessonOrder.length - 1
      ? lessonOrder[currentIndex + 1].lessonId
      : null

  const prevLessonId =
    currentIndex > 0 ? lessonOrder[currentIndex - 1].lessonId : null

  const toggleModuleExpansion = (moduleId: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) newExpanded.delete(moduleId)
    else newExpanded.add(moduleId)
    setExpandedModules(newExpanded)
  }

  // ✅ Updated loadLesson: checks enrollment FIRST and sets in progress
  const loadLesson = async (lessonId: number) => {
    if (!user?.id) {
      alert('User not found. Please login again.')
      navigate('/login')
      return
    }

    // ✅ 1) Check if enrolled using backend API
    const enrolledRes = await checkIsEnrolled({
      userId: user.id,
      lessonId,
    })

    if (enrolledRes.success !== 'true') {
      setCurrentLesson(null)
      setCurrentLessonId(null)

      alert(enrolledRes.message || 'Not Enrolled or Invalid')
      navigate('/courses')
      return
    }

    // ✅ 2) Load lesson details only if enrolled
    const res = await getLessonDetails({ lessonId })
    setCurrentLesson(res.data)
    setCurrentLessonId(lessonId)

    // ✅ 3) If lesson status is 'not_started', set it to 'in_progress'
    if (res.data.status === 'not_started') {
      try {
        await setLessonInProgress({
          userId: user.id,
          lessonId,
        })
        // Update local state to reflect the change
        setCurrentLesson(prev => (prev ? { ...prev, status: 'in_progress' } : prev))
      } catch (err) {
        console.error('Failed to set lesson in progress:', err)
      }
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      if (!numericCourseId || !authChecked) return

      try {
        setIsLoading(true)

        // 1) Course header info
        const enrolledRes = await getEnrolledDetails({ courseId: numericCourseId })
        setCourseInfo(enrolledRes.data)

        // 2) Sidebar modules/lessons
        const sidebarRes = await getCourseSidebar({ courseId: numericCourseId })
        setSidebar(sidebarRes.data || [])

        // 3) Expand first module by default
        if (sidebarRes.data?.length) {
          setExpandedModules(new Set([sidebarRes.data[0].moduleId]))
        }

        // 4) Auto-load first lesson (will check enrollment too)
        const firstLessonId = sidebarRes.data?.[0]?.lessons?.[0]?.lessonId ?? null

        if (firstLessonId) {
          await loadLesson(firstLessonId)
        } else {
          setCurrentLesson(null)
          setCurrentLessonId(null)
        }
      } catch (err) {
        console.error('Failed to load course learn page:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAll()
  }, [numericCourseId, authChecked])

  const handleLessonClick = async (lessonId: number, moduleId: number) => {
    if (!expandedModules.has(moduleId)) {
      setExpandedModules(prev => new Set([...prev, moduleId]))
    }
    await loadLesson(lessonId)
  }

  // Helper function to refresh sidebar
  const refreshSidebar = async () => {
    if (numericCourseId) {
      try {
        const sidebarRes = await getCourseSidebar({ courseId: numericCourseId })
        setSidebar(sidebarRes.data || [])
      } catch (err) {
        console.error('Failed to refresh sidebar:', err)
      }
    }
  }

  // UI only
  const handleMarkComplete = async () => {
    if (!currentLesson || !user?.id || !currentLessonId) return
    
    try {
      // Call API to set lesson as completed
      await setLessonCompleted({
        userId: user.id,
        lessonId: currentLessonId,
      })
      // Update local state to reflect the change
      setCurrentLesson(prev => (prev ? { ...prev, status: 'completed' } : prev))
      
      // Refresh sidebar to get updated lesson statuses
      await refreshSidebar()
    } catch (err) {
      console.error('Failed to mark lesson complete:', err)
      alert('Failed to mark lesson as complete')
    }
  }

  // Check if user has token in localStorage (for new tab scenario)
  const hasToken = typeof window !== 'undefined' && (token || localStorage.getItem('token'))

  if (!authChecked || (!isAuthenticated && !hasToken)) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You must be logged in to access this course</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    )
  }

  if (!numericCourseId) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Invalid course id</p>
          <Button onClick={() => navigate('/student/courses')}>Back to Courses</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => navigate(`/student/course/${numericCourseId}`)}
            className="flex items-center gap-2 text-primary hover:underline mb-2"
          >
            <ArrowLeft size={16} />
            Back to Course
          </button>

          <h2 className="font-semibold text-lg truncate">
            {courseInfo?.courseTitle ?? 'Course'}
          </h2>

          {courseInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              {courseInfo.totalModules} modules • {courseInfo.totalLessons} lessons
            </p>
          )}
        </div>

        {/* Modules and Lessons */}
        <div className="flex-1 overflow-y-auto">
          {sidebar.map((module) => (
            <div key={module.moduleId} className="border-b border-border">
              <button
                onClick={() => toggleModuleExpansion(module.moduleId)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={16} className="text-muted-foreground" />
                    <span className="font-medium truncate">{module.moduleTitle}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{module.lessons.length} lessons</p>
                </div>

                {expandedModules.has(module.moduleId) ? (
                  <ChevronDown size={16} className="text-muted-foreground" />
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground" />
                )}
              </button>

              {expandedModules.has(module.moduleId) && (
                <div className="bg-muted/30">
                  {module.lessons.map((lesson, index) => (
                    <button
                      key={lesson.lessonId}
                      onClick={() => {
                        // Only allow interaction if lesson is not completed
                        if (lesson.status !== 'completed') {
                          handleLessonClick(lesson.lessonId, module.moduleId)
                        }
                      }}
                      disabled={lesson.status === 'completed'}
                      className={`w-full p-3 pl-8 text-left hover:bg-muted transition-colors ${
                        currentLessonId === lesson.lessonId
                          ? 'bg-primary/10 border-r-2 border-primary'
                          : ''
                      } ${lesson.status === 'completed' ? 'opacity-75 cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs">
                          {lesson.status === 'completed' ? (
                            <span className="text-green-600">✓</span>
                          ) : currentLessonId === lesson.lessonId ? (
                            <span className="text-blue-600">⚡</span>
                          ) : (
                            <span className="text-muted-foreground">{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${
                              currentLessonId === lesson.lessonId ? 'font-medium' : ''
                            }`}
                          >
                            {lesson.lessonTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.duration} min
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentLesson ? (
          <>
            {/* Lesson Header */}
            <div className="p-6 border-b border-border">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{currentLesson.lessonTitle}</h1>
                    <p className="text-muted-foreground text-lg">{currentLesson.description}</p>
                  </div>

                  <Badge className={currentLesson.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}>
                    {currentLesson.status === 'completed'
                      ? 'Completed'
                      : currentLesson.status === 'in_progress'
                      ? 'In Progress'
                      : 'Not Started'}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{currentLesson.duration} minutes</span>
                  </div>

                  {currentLesson.contentType?.toLowerCase() === 'video' && (
                    <div className="flex items-center gap-2">
                      <span>📹 Video available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                {/* Video Player */}
                {(currentLesson.contentType?.toLowerCase() === 'video' || currentLesson.contentType?.toLowerCase() === 'link') && currentLesson.lessonData && (
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        {currentLesson.lessonData.includes('youtube.com') || currentLesson.lessonData.includes('youtu.be') ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${currentLesson.lessonData.split('v=')[1]?.split('&')[0] || ''}`}
                            title={currentLesson.lessonTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : currentLesson.lessonData.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            width="100%"
                            height="100%"
                            controls
                            className="w-full h-full"
                          >
                            <source src={currentLesson.lessonData} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <iframe
                            width="100%"
                            height="100%"
                            src={currentLesson.lessonData}
                            title={currentLesson.lessonTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        <a
                          href={currentLesson.lessonData}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Play size={14} />
                          Open in new tab
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Lesson Content - Rendered as Markdown */}
                {currentLesson.lessonContent && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Lesson Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({...props}) => <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />,
                            h2: ({...props}) => <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />,
                            h3: ({...props}) => <h3 className="text-xl font-bold mb-2 mt-4" {...props} />,
                            p: ({...props}) => <p className="mb-3 text-foreground" {...props} />,
                            ul: ({...props}) => <ul className="list-disc list-inside mb-3 text-foreground" {...props} />,
                            li: ({...props}) => <li className="mb-1" {...props} />,
                            code: ({...props}) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono" {...props} />,
                            pre: ({...props}) => <pre className="bg-muted p-4 rounded mb-3 overflow-x-auto" {...props} />,
                          }}
                        >
                          {currentLesson.lessonContent}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mark Complete Button */}
                {currentLesson.status !== 'completed' && (
                  <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold mb-1">Lesson Complete?</h3>
                          <p className="text-sm text-muted-foreground">
                            Mark this lesson as completed to track your progress
                          </p>
                        </div>
                        <Button onClick={handleMarkComplete} className="gap-2">
                          <CheckCircle2 size={18} />
                          Mark Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  {prevLessonId ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const prev = lessonOrder.find(x => x.lessonId === prevLessonId)
                        if (prev) handleLessonClick(prev.lessonId, prev.moduleId)
                      }}
                      className="gap-2"
                    >
                      <ChevronRight size={18} className="rotate-180" />
                      Previous
                    </Button>
                  ) : (
                    <div />
                  )}

                  {nextLessonId ? (
                    <Button
                      onClick={async () => {
                        // Mark current lesson as completed before moving to next
                        if (currentLesson?.status !== 'completed' && user?.id && currentLessonId) {
                          try {
                            await setLessonCompleted({
                              userId: user.id,
                              lessonId: currentLessonId,
                            })
                            // Refresh sidebar after completing
                            await refreshSidebar()
                          } catch (err) {
                            console.error('Failed to mark lesson complete:', err)
                          }
                        }
                        
                        const next = lessonOrder.find(x => x.lessonId === nextLessonId)
                        if (next) handleLessonClick(next.lessonId, next.moduleId)
                      }}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight size={18} />
                    </Button>
                  ) : (
                    <Button onClick={() => navigate(`/student/course/${numericCourseId}`)} variant="outline">
                      Back to Course
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No lessons available</p>
              <Button onClick={() => navigate(`/student/course/${numericCourseId}`)}>
                Back to Course
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
