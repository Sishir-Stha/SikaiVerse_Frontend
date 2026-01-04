// api/Landing/landing.ts
export interface GetCourseListRequest {
  courseId?: number
  level?: string
  category?: string
  title?: string
  rating?: number
}

export interface CourseItem {
  courseId: number
  description: string
  duration: number
  image: string
  instructor: string
  category: string
  level: string
  rating: number
  title: string
  totalStudents: number
}

export interface GetCourseListResponse {
  success: string
  data: CourseItem[]
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

export const getCourseList = async (
  params: GetCourseListRequest
): Promise<GetCourseListResponse> => {
  const response = await fetch(`${API_BASE_URL}/course/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  // Handle 422 - No courses match criteria
  if (response.status === 422) {
    // Return empty data array instead of throwing error
    return {
      success: 'true',
      data: []
    }
  }

  if (!response.ok) {
    throw new Error('Failed to fetch course list')
  }

  return response.json()
}