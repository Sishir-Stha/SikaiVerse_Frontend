export interface GetAdminDashboardRequest {
  userId: number
}

export interface GetAdminDashboardResponse {
  success: string
  data: {
    totalCourse: number
    totalLesson: number
    totalModule: number
    totalStudents: number
  }
}
export interface GetUserListResponse {
  success: string
  data: {
    email: string
    fullName: string
    joinedDate: string
    role: string
    status: string
  }[]
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

export const getAdminDashboardInfo = async (): Promise<GetAdminDashboardResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/getDashboardInfo`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Admin dashboard info')
  }

  return response.json()
}

export const getUserList = async (): Promise<GetUserListResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/getUserList`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Admin dashboard info')
  }

  return response.json()
}

