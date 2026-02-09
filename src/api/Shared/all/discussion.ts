export interface LikeDiscussionRequest {
  postId: number
}

export interface LikeDiscussionResponse {
  success: 'true' | 'false'
  message?: string
}

export interface LikeReplyRequest {
  replyId: number
}

export interface LikeReplyResponse {
  success: 'true' | 'false'
  message?: string
}

export interface AddPostReplyRequest {
  courseId: number
  userId: number
  title: string
  content: string
}

export interface AddPostReplyResponse {
  success: 'true' | 'false'
  message?: string
}

export interface AddReplyRequest {
  postId: number
  userId: number
  content: string
}

export interface AddReplyResponse {
  success: 'true' | 'false'
  message?: string
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

export const likeDiscussion = async (
  request: LikeDiscussionRequest
): Promise<LikeDiscussionResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/all/likeDiscussion`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to like discussion')
  }

  const result: LikeDiscussionResponse = await response.json()

  return result
}

export const likeReply = async (
  request: LikeReplyRequest
): Promise<LikeReplyResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/all/likeReply`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to like reply')
  }

  const result: LikeReplyResponse = await response.json()

  return result
}


export const addPostReply = async (
  request: AddPostReplyRequest
): Promise<AddPostReplyResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/all/addPostReply`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to add post reply')
  }

  const result: AddPostReplyResponse = await response.json()
  return result
}

export const addReply = async (
  request: AddReplyRequest
): Promise<AddReplyResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/all/addReply`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to add reply')
  }

  const result: AddReplyResponse = await response.json()
  return result
}