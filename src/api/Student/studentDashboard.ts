export interface GetDashboardInfoRequest {
  userId: number
}

export interface CourseData {
  courseDescription: string
  courseId: number
  courseTitle: string
  progressPercentage: number
  totalModules: number
}

export interface GetDashboardInfoResponse {
  success: string
  data: {
    completed: number
    courseData: CourseData[]
    inProgress: number
    studyTime: number
    totalCourse: number
  }
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

export const getDashboardInfo = async (request: GetDashboardInfoRequest): Promise<GetDashboardInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/student/getDashboardInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard info')
  }

  return response.json()
}
