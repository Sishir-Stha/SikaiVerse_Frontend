// Request interface
export interface GetCourseInfoRequest {
  userId: number
}

// Course info structure
export interface CourseInfo {
  courseId: number
  courseTitle: string
  description: string | null
  instructorName: string
  level: string
  rating: number
  totalDuration: number // in minutes, maybe
  totalLessons: number
  totalModules: number
}

// Response interface
export interface GetCourseInfoResponse {
  success: string
  data: CourseInfo[]
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

// API call
export const getCourseInfo = async (
  request: GetCourseInfoRequest
): Promise<GetCourseInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/instructor/getCourseInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch course info')
  }

  return response.json()
}
