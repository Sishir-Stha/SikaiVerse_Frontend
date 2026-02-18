// InstructorCourseEditPage.tsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useToast } from '../../hooks/use-toast'
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react'
import { ModulePanel } from '../../components/ModulePanel'
import { LessonPanel } from '../../components/LessonPanel'
import {
  getEditInfo,
  updateCourseInfo,
  isErrorResponse,
  isUpdateSuccess,
  type EditInfo
} from '../../api/Shared/Privileged/PrivilegedCourse'

// Local state types
interface LocalLesson {
  id: string
  title: string
  duration: number
  contentType?: string
}

interface LocalModule {
  id: string
  title: string
  description?: string
  lessons: LocalLesson[]
}

interface LocalCourse {
  id: number
  title: string
  description: string
  instructor: string
  level: string
  category: string
  modules: LocalModule[]
}

// Map API response to local types
const mapApiToLocalCourse = (apiData: EditInfo): LocalCourse => ({
  id: apiData.courseId,
  title: apiData.courseTitle,
  description: apiData.description || '',
  instructor: apiData.instructorName,
  level: apiData.level,
  category: apiData.category,
  modules: apiData.modules.map(module => ({
    id: String(module.moduleId),
    title: module.moduleTitle,
    lessons: module.lesson.map(lesson => ({
      id: String(lesson.lessonId),
      title: lesson.lessonTitle,
      duration: lesson.duration,
      contentType: 'video',
    })),
  })),
})

export default function InstructorCourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [course, setCourse] = useState<LocalCourse | null>(null)
  const [originalCourse, setOriginalCourse] = useState<LocalCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Get userId from auth context or localStorage
  const userId = Number(localStorage.getItem('userId')) || 1

  // Panel states
  const [modulePanel, setModulePanel] = useState<{
    isOpen: boolean
    module: LocalModule | null
  }>({
    isOpen: false,
    module: null,
  })

  const [lessonPanel, setLessonPanel] = useState<{
    isOpen: boolean
    lesson: LocalLesson | null
    moduleId: string | null
  }>({
    isOpen: false,
    lesson: null,
    moduleId: null,
  })

  // Load course data
  useEffect(() => {
    let isMounted = true

    const loadCourse = async () => {
      if (!courseId) return

      setIsLoading(true)
      try {
        const response = await getEditInfo({ courseId: Number(courseId) })

        if (!isMounted) return

        if (isErrorResponse(response)) {
          error(response.message || 'Failed to load course')
          navigate('/instructor/courses')
          return
        }

        const localCourse = mapApiToLocalCourse(response)
        setCourse(localCourse)
        setOriginalCourse(localCourse)

        // Auto-expand first module
        if (response.modules.length > 0) {
          setExpandedModules(new Set([String(response.modules[0].moduleId)]))
        }
      } catch (err) {
        console.error('Failed to load course:', err)
        if (isMounted) {
          error('Failed to load course. Please check if the server is running.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCourse()

    return () => {
      isMounted = false
    }
  }, [courseId])

  // Check if there are unsaved changes
  const hasChanges = (): boolean => {
    if (!course || !originalCourse) return false
    return (
      course.title !== originalCourse.title ||
      course.description !== originalCourse.description ||
      course.level !== originalCourse.level ||
      course.category !== originalCourse.category
    )
  }

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(moduleId)) {
        newExpanded.delete(moduleId)
      } else {
        newExpanded.add(moduleId)
      }
      return newExpanded
    })
  }

  // Module handlers
  const handleOpenModulePanel = (module?: LocalModule) => {
    setModulePanel({
      isOpen: true,
      module: module || null,
    })
  }

  const handleCloseModulePanel = () => {
    setModulePanel({ isOpen: false, module: null })
  }

  const handleSaveModule = (module: LocalModule) => {
    if (!course) return

    const existingIndex = course.modules.findIndex(m => m.id === module.id)
    let updatedModules: LocalModule[]

    if (existingIndex >= 0) {
      updatedModules = course.modules.map((m, idx) =>
        idx === existingIndex ? module : m
      )
      success('Module updated successfully')
    } else {
      updatedModules = [...course.modules, module]
      success('Module created successfully')
    }

    setCourse({ ...course, modules: updatedModules })
    handleCloseModulePanel()
  }

  const handleDeleteModule = (moduleId: string) => {
    if (!course) return

    if (!confirm('Are you sure you want to delete this module and all its lessons?')) {
      return
    }

    setCourse({
      ...course,
      modules: course.modules.filter(m => m.id !== moduleId),
    })

    success('Module deleted successfully')
  }

  // Lesson handlers
  const handleOpenLessonPanel = (lesson?: LocalLesson, moduleId?: string) => {
    setLessonPanel({
      isOpen: true,
      lesson: lesson || null,
      moduleId: moduleId || null,
    })
  }

  const handleCloseLessonPanel = () => {
    setLessonPanel({ isOpen: false, lesson: null, moduleId: null })
  }

  const handleSaveLesson = (lesson: LocalLesson) => {
    if (!course || !lessonPanel.moduleId) return

    const moduleIndex = course.modules.findIndex(m => m.id === lessonPanel.moduleId)
    if (moduleIndex < 0) return

    const module = course.modules[moduleIndex]
    const lessonIndex = module.lessons.findIndex(l => l.id === lesson.id)

    let updatedModules: LocalModule[]

    if (lessonIndex >= 0) {
      const updatedLessons = module.lessons.map((l, idx) =>
        idx === lessonIndex ? lesson : l
      )
      updatedModules = course.modules.map((m, idx) =>
        idx === moduleIndex ? { ...m, lessons: updatedLessons } : m
      )
      success('Lesson updated successfully')
    } else {
      const updatedLessons = [...module.lessons, lesson]
      updatedModules = course.modules.map((m, idx) =>
        idx === moduleIndex ? { ...m, lessons: updatedLessons } : m
      )
      success('Lesson created successfully')
    }

    setCourse({ ...course, modules: updatedModules })
    handleCloseLessonPanel()
  }

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (!course) return

    if (!confirm('Are you sure you want to delete this lesson?')) {
      return
    }

    const updatedModules = course.modules.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
        : m
    )

    setCourse({ ...course, modules: updatedModules })
    success('Lesson deleted successfully')
  }

  // Save course info
  const handleSaveCourse = async () => {
    if (!course) return

    setIsSaving(true)
    try {
      const response = await updateCourseInfo({
        courseId: course.id,
        userId: userId,
        courseTitle: course.title !== originalCourse?.title ? course.title : '',
        description: course.description !== originalCourse?.description ? course.description : '',
        level: course.level !== originalCourse?.level ? course.level : '',
        category: course.category !== originalCourse?.category ? course.category : '',
      })

      if (isUpdateSuccess(response)) {
        success('Course updated successfully')
        setOriginalCourse(course)
      } else {
        error(response.message || 'Failed to update course')
      }
    } catch (err) {
      console.error('Failed to save course:', err)
      error('Failed to save course')
    } finally {
      setIsSaving(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!course) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <Button onClick={() => navigate('/instructor/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* ============ UPDATED HEADER SECTION ============ */}
        <div className="mb-8">
          {/* Back button - positioned to the left, above the title */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/instructor/courses')}
            className="gap-2 -ml-3 mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} />
            Back to Courses
          </Button>

          {/* Title row - aligned with card content */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
              <p className="text-muted-foreground mt-1">{course.title}</p>
            </div>

            {/* Unsaved changes indicator */}
            {hasChanges() && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Unsaved changes
              </div>
            )}
          </div>
        </div>
        {/* ============ END UPDATED HEADER ============ */}

        {/* Course Information Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Update your course details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={course.title}
                onChange={e => setCourse({ ...course, title: e.target.value })}
                placeholder="Course title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={course.description}
                onChange={e => setCourse({ ...course, description: e.target.value })}
                placeholder="Course description"
                className="w-full p-2 border border-border rounded-md bg-background text-foreground min-h-24 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Instructor</label>
                <Input value={course.instructor} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">
                  Instructor cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={course.category}
                  onChange={e => setCourse({ ...course, category: e.target.value })}
                  placeholder="Category"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Level</label>
                <select
                  value={course.level.toLowerCase()}
                  onChange={e => setCourse({ ...course, level: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground h-10"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules & Lessons Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Modules & Lessons</CardTitle>
              <CardDescription>
                Manage your course structure ({course.modules.length} modules)
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenModulePanel()} className="gap-2">
              <Plus size={18} />
              Add Module
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {course.modules.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No modules yet</p>
                <Button
                  onClick={() => handleOpenModulePanel()}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus size={18} />
                  Create First Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <div
                    key={module.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    {/* Module Header */}
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      {/* Clickable area for expand/collapse */}
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => toggleModuleExpand(module.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleModuleExpand(module.id)
                          }
                        }}
                      >
                        {expandedModules.has(module.id) ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                        <div>
                          <p className="font-semibold">
                            Module {moduleIndex + 1}: {module.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {module.lessons.length} lesson
                            {module.lessons.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModulePanel(module)}
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>

                    {/* Module Content (Lessons) */}
                    {expandedModules.has(module.id) && (
                      <div className="border-t border-border p-4 bg-muted/20 space-y-4">
                        {module.description && (
                          <div className="p-3 bg-background rounded-lg border border-border">
                            <p className="text-sm text-muted-foreground">
                              {module.description}
                            </p>
                          </div>
                        )}

                        {module.lessons.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground mb-3">
                              No lessons yet
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenLessonPanel(undefined, module.id)}
                              className="gap-1"
                            >
                              <Plus size={16} />
                              Add Lesson
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium">
                                    Lesson {lessonIndex + 1}: {lesson.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {lesson.contentType || 'video'} • {lesson.duration} min
                                  </p>
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenLessonPanel(lesson, module.id)}
                                  >
                                    <Edit2 size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border-t border-border pt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenLessonPanel(undefined, module.id)}
                            className="w-full gap-2"
                          >
                            <Plus size={16} />
                            Add Lesson to This Module
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleSaveCourse}
            size="lg"
            className="flex-1 gap-2"
            disabled={isSaving || !hasChanges()}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </Button>
          <Button
            onClick={() => navigate('/instructor/courses')}
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Module Panel */}
      <ModulePanel
        module={modulePanel.module as any}
        isOpen={modulePanel.isOpen}
        onClose={handleCloseModulePanel}
        onSave={handleSaveModule as any}
        courseId={String(course.id)}
      />

      {/* Lesson Panel */}
      <LessonPanel
        lesson={lessonPanel.lesson as any}
        isOpen={lessonPanel.isOpen}
        onClose={handleCloseLessonPanel}
        onSave={handleSaveLesson as any}
        moduleId={lessonPanel.moduleId || ''}
      />
    </div>
  )
}