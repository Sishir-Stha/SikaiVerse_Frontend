import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { useToast } from '../../hooks/use-toast'
import { Loader2 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import {
  addCourse,
  isAddCourseSuccess,
  getInstructorList,
  isInstructorListSuccess,
  type Instructor,
} from '../../api/Shared/Privileged/PrivilegedCourse'

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructorId: z.coerce.number().min(1, 'Please select an instructor'),
  category: z.string().min(2, 'Category required'),
  level: z.string().min(1, 'Level is required'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 hour'),
  image: z.string().url('Must be a valid image URL'),
  rating: z.coerce.number().min(0).max(5).default(0),
  totalStudents: z.coerce.number().min(0).default(0),
})

type CourseFormData = z.infer<typeof courseSchema>

export default function CoursesCreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [instructorsLoading, setInstructorsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      rating: 0,
      totalStudents: 0,
    },
  })

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await getInstructorList()
        if (isInstructorListSuccess(response)) {
          setInstructors(response.data)
        } else {
          error(response.message || 'Failed to load instructors')
        }
      } catch {
        error('Failed to fetch instructor list')
      } finally {
        setInstructorsLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  const onSubmit = async (data: CourseFormData) => {
    setIsLoading(true)
    try {
      const response = await addCourse(data)
    if (isAddCourseSuccess(response)) {
        success('Course created successfully!')
        navigate(`/${user?.role}/courses`)
      } else {
        error(response.message || 'Failed to create course')
      }
    } catch {
      error('Failed to create course. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 p-6 md:p-12 overflow-auto flex justify-center">
        <div className="w-full max-w-6xl">

          {/* Page Header (Outside Card) */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground mt-2">
              Add a new course to the platform
            </p>
          </div>

          {/* Form Card */}
          <Card>
            <CardContent className="pt-8">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid lg:grid-cols-2 gap-10"
              >
                {/* LEFT COLUMN */}
                <div className="space-y-6">

                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Course Title
                    </label>
                    <Input {...register('title')} disabled={isLoading} />
                    {errors.title && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full h-32 rounded-md border px-3 py-2 text-sm"
                      {...register('description')}
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Instructor */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Instructor
                    </label>
                    <select
                      className="w-full h-10 rounded-md border px-3 text-sm"
                      {...register('instructorId')}
                      disabled={isLoading}
                    >
                      <option value="">Select instructor</option>
                      {instructors.map((inst) => (
                        <option key={inst.userId} value={inst.userId}>
                          {inst.fullName}
                        </option>
                      ))}
                    </select>
                    {errors.instructorId && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.instructorId.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Category
                    </label>
                    <Input {...register('category')} disabled={isLoading} />
                    {errors.category && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">

                  {/* Level */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Level
                    </label>
                    <select
                      className="w-full h-10 rounded-md border px-3 text-sm"
                      {...register('level')}
                      disabled={isLoading}
                    >
                      <option value="">Select level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    {errors.level && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.level.message}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Duration (hours)
                    </label>
                    <Input
                      type="number"
                      {...register('duration')}
                      disabled={isLoading}
                    />
                    {errors.duration && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>

                  {/* Image */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Image URL
                    </label>
                    <Input {...register('image')} disabled={isLoading} />
                    {errors.image && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.image.message}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Initial Rating
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      {...register('rating')}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Total Students */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Total Students
                    </label>
                    <Input
                      type="number"
                      min="0"
                      {...register('totalStudents')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="lg:col-span-2 pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                    disabled={isLoading || instructorsLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create Course'
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
