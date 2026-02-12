import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  addModule,
  isAddModuleSuccess,
} from '../../api/Shared/Privileged/PrivilegedCourse'

const moduleSchema = z.object({
  courseId: z.coerce.number().min(1, 'Course ID is required'),
  moduleTitle: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

type ModuleFormData = z.infer<typeof moduleSchema>

export default function ModulesCreate() {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
  })

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

                {/* Course ID */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Course ID
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    {...register('courseId')}
                    disabled={isLoading}
                  />
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

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                    disabled={isLoading}
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