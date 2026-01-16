export interface GetProfileInfoRequest {
  userId: number
}

export interface ProfileInfo {
  address: string
  email: string
  fullName: string
  phoneNumber: string
  role: string
}

export interface GetProfileInfoResponse {
  success: string
  data: ProfileInfo
}


export interface UpdateProfileInfoRequest {
  userId: number
  fullName: string
  email: string
  role: string
  status: string
  phoneNumber: string
  address: string
}

export interface UpdateProfileInfoResponse {
  success: string
  message?: string
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

export const getProfileInfo = async (
  request: GetProfileInfoRequest
): Promise<GetProfileInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/shared/all/getProfileInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch profile info')
  }

  return response.json()
}


export const updateProfileInfo = async (
  request: UpdateProfileInfoRequest
): Promise<UpdateProfileInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/shared/all/updateProfileInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to update profile info')
  }

  return response.json()
}