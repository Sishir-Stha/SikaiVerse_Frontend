import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../context/AuthContext'
import { Loader2 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import {
  addLesson,
  isAddLessonSuccess,
  getEditInfo,
  isErrorResponse,
  type ModuleInfo,
} from '../../api/Shared/Privileged/PrivilegedCourse'
import {
  getCourseInfo as getInstructorCourseInfo,
  type CourseInfo,
} from '../../api/Instructor/instructorCourse'
import {
  getCourseInfo as getAdminCourseInfo,
} from '../../api/Admin/adminCourse'

const lessonSchema = z
  .object({
    courseId: z.coerce.number().min(1, 'Please select a course'),
    moduleId: z.coerce.number().min(1, 'Please select a module'),
    lessonTitle: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    lessonContent: z.string().min(10, 'Content must be at least 10 characters'),
    contentType: z.enum(['link', 'video', 'document', 'text']).default('link'),
    contentData: z.string().optional(),
    duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  })
  .refine(
    (data) => {
      if (data.contentType === 'link') {
        return data.contentData && data.contentData.trim().length > 0
      }
      return true
    },
    {
      message: 'URL is required for link content type',
      path: ['contentData'],
    }
  )

type LessonFormData = z.infer<typeof lessonSchema>

export default function LessonsCreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [isLoadingModules, setIsLoadingModules] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const isAdmin = user?.role === 'admin'

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      courseId: 0,
      moduleId: 0,
      lessonTitle: '',
      description: '',
      lessonContent: '',
      contentType: 'link',
      contentData: '',
      duration: 0,
    },
  })

  const selectedCourseId = watch('courseId')
  const selectedContentType = watch('contentType')

  // Fetch courses on mount
  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return
      setIsLoadingCourses(true)
      try {
        const response = isAdmin
          ? await getAdminCourseInfo({ userId: user.id })
          : await getInstructorCourseInfo({ userId: user.id })

        if (response.success === 'true') {
          setCourses(response.data)
        }
      } catch (err) {
        console.error('Failed to load courses:', err)
        error('Failed to load courses.')
      } finally {
        setIsLoadingCourses(false)
      }
    }

    loadCourses()
  }, [user, isAdmin])

  // Fetch modules when course changes
  useEffect(() => {
    const loadModules = async () => {
      if (!selectedCourseId || selectedCourseId === 0) {
        setModules([])
        return
      }

      setIsLoadingModules(true)
      setValue('moduleId', 0)

      try {
        const response = await getEditInfo({ courseId: selectedCourseId })
        if (!isErrorResponse(response)) {
          setModules(response.modules)
        } else {
          error(response.message || 'Failed to load modules')
          setModules([])
        }
      } catch (err) {
        console.error('Failed to load modules:', err)
        error('Failed to load modules.')
        setModules([])
      } finally {
        setIsLoadingModules(false)
      }
    }

    loadModules()
  }, [selectedCourseId])

  // Clear irrelevant fields when content type changes
  useEffect(() => {
    if (selectedContentType !== 'link') {
      setValue('contentData', '')
    }
    if (selectedContentType === 'text' || selectedContentType === 'link') {
      setSelectedFile(null)
    }
  }, [selectedContentType, setValue])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const onSubmit = async (data: LessonFormData) => {
    setIsLoading(true)
    try {
      const response = await addLesson({
        moduleId: data.moduleId,
        lessonTitle: data.lessonTitle,
        lessonContent: data.lessonContent,
        description: data.description,
        contentType: data.contentType,
        contentData: data.contentType === 'link' ? data.contentData : undefined,
        duration: data.duration,
        fileData:
          selectedContentType === 'video' || selectedContentType === 'document'
            ? selectedFile ?? undefined
            : undefined,
      })

      if (isAddLessonSuccess(response)) {
        success('Lesson created successfully!')
        navigate('/admin')
      } else {
        error(response.message || 'Failed to create lesson')
      }
    } catch {
      error('Failed to create lesson. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 p-6 md:p-12 overflow-auto">
        <div className="w-full max-w-3xl">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Create New Lesson</h1>
            <p className="text-muted-foreground mt-2">
              Add a new lesson to an existing module
            </p>
          </div>

          {/* Form Card */}
          <Card>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Course Selection Dropdown */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Course
                  </label>
                  {isLoadingCourses ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading courses...
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      No courses found.{' '}
                      <button
                        type="button"
                        className="text-blue-600 underline hover:text-blue-700"
                        onClick={() => navigate('/courses/create')}
                      >
                        Create a course first
                      </button>
                    </div>
                  ) : (
                    <Controller
                      name="courseId"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isLoading}
                        >
                          <option value={0} disabled>
                            Select a course...
                          </option>
                          {courses.map((course) => (
                            <option key={course.courseId} value={course.courseId}>
                              {course.courseTitle}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  )}
                  {errors.courseId && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.courseId.message}
                    </p>
                  )}
                </div>

                {/* Module Selection Dropdown */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Module
                  </label>
                  {isLoadingModules ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading modules...
                    </div>
                  ) : selectedCourseId === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      Please select a course first
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      No modules found.{' '}
                      <button
                        type="button"
                        className="text-blue-600 underline hover:text-blue-700"
                        onClick={() => navigate('/modules/create')}
                      >
                        Create a module first
                      </button>
                    </div>
                  ) : (
                    <Controller
                      name="moduleId"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isLoading}
                        >
                          <option value={0} disabled>
                            Select a module...
                          </option>
                          {modules.map((mod) => (
                            <option key={mod.moduleId} value={mod.moduleId}>
                              {mod.moduleTitle}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  )}
                  {errors.moduleId && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.moduleId.message}
                    </p>
                  )}
                </div>

                {/* Lesson Title */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Lesson Title
                  </label>
                  <Input
                    placeholder="e.g., What is React?"
                    {...register('lessonTitle')}
                    disabled={isLoading}
                  />
                  {errors.lessonTitle && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.lessonTitle.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the lesson..."
                    className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('description')}
                    disabled={isLoading}
                  />
                  {errors.description && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Content Type — moved ABOVE conditional fields */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Content Type
                  </label>
                  <Controller
                    name="contentType"
                    control={control}
                    render={({ field }) => (
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                      >
                        <option value="link">Link</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="text">Text</option>
                      </select>
                    )}
                  />
                  <p className="text-muted-foreground text-xs mt-1">
                    {selectedContentType === 'link' && 'Provide a URL below'}
                    {selectedContentType === 'text' && 'Enter your content in the Lesson Content field above'}
                    {selectedContentType === 'video' && 'Upload a video file below'}
                    {selectedContentType === 'document' && 'Upload a document file below'}
                  </p>
                  {errors.contentType && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.contentType.message}
                    </p>
                  )}
                </div>

                {/* Lesson Content — always visible */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Lesson Content
                  </label>
                  <textarea
                    placeholder={
                      selectedContentType === 'text'
                        ? 'Write your full lesson content here...'
                        : 'Brief lesson content or summary...'
                    }
                    className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('lessonContent')}
                    disabled={isLoading}
                  />
                  {errors.lessonContent && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.lessonContent.message}
                    </p>
                  )}
                </div>

                {/* Content Data — ONLY for link */}
                {selectedContentType === 'link' && (
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      URL
                    </label>
                    <Input
                      placeholder="e.g., https://example.com/resource"
                      {...register('contentData')}
                      disabled={isLoading}
                    />
                    {errors.contentData && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.contentData.message}
                      </p>
                    )}
                  </div>
                )}

                {/* File Upload — ONLY for video or document */}
                {(selectedContentType === 'video' ||
                  selectedContentType === 'document') && (
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      {selectedContentType === 'video'
                        ? 'Upload Video'
                        : 'Upload Document'}
                    </label>
                    <Input
                      type="file"
                      accept={
                        selectedContentType === 'video'
                          ? 'video/*'
                          : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'
                      }
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                    {selectedFile && (
                      <p className="text-muted-foreground text-sm mt-1">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 15"
                    {...register('duration')}
                    disabled={isLoading}
                  />
                  {errors.duration && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.duration.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                    disabled={
                      isLoading ||
                      isLoadingCourses ||
                      isLoadingModules ||
                      courses.length === 0 ||
                      modules.length === 0
                    }
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create Lesson'
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
} 