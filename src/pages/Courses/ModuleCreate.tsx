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
  addModule,
  isAddModuleSuccess,
} from '../../api/Shared/Privileged/PrivilegedCourse'
import {
  getCourseInfo as getInstructorCourseInfo,
  type CourseInfo,
} from '../../api/Instructor/instructorCourse'
import {
  getCourseInfo as getAdminCourseInfo,
} from '../../api/Admin/adminCourse'

const moduleSchema = z.object({
  courseId: z.coerce.number().min(1, 'Please select a course'),
  moduleTitle: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

type ModuleFormData = z.infer<typeof moduleSchema>

export default function ModulesCreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)

  const isAdmin = user?.role === 'admin'

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      courseId: 0,
      moduleTitle: '',
      description: '',
    },
  })

  // Fetch courses on mount — pick API based on role
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

  const onSubmit = async (data: ModuleFormData) => {
    setIsLoading(true)
    try {
      const response = await addModule({
        courseId: data.courseId,
        moduleTitle: data.moduleTitle,
        description: data.description,
      })

      if (isAddModuleSuccess(response)) {
        success('Module created successfully!')
        navigate('/admin')
      } else {
        error(response.message || 'Failed to create module')
      }
    } catch {
      error('Failed to create module. Please try again.')
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
            <h1 className="text-4xl font-bold">Create New Module</h1>
            <p className="text-muted-foreground mt-2">
              Add a new module to an existing course
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

                {/* Module Title */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Module Title
                  </label>
                  <Input
                    placeholder="e.g., Getting Started with React"
                    {...register('moduleTitle')}
                    disabled={isLoading}
                  />
                  {errors.moduleTitle && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.moduleTitle.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the module content..."
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

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                    disabled={isLoading || isLoadingCourses || courses.length === 0}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create Module'
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