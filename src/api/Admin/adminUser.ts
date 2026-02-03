export interface GetUserListResponse {
  success: string
  data: {
    address: string
    email: string
    fullName: string
    joinedDate: string
    phoneNumber: string
    role: string
    status: string,
    userId: number
  }[]
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

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

