export interface GetInstructorDashboardRequest {
  userId: number
}

export interface GetInstructorDashboardResponse {
  success: string
  data: {
    totalCourse: number
    totalLesson: number
    totalModule: number
    totalStudents: number
  }
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

export const getInstructorDashboardInfo = async (request: GetInstructorDashboardRequest): Promise<GetInstructorDashboardResponse> => {
  const response = await fetch(`${API_BASE_URL}/instructor/getDashboardInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch instructor dashboard info')
  }

  return response.json()
}
