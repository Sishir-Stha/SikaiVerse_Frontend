

export interface GetCourseListRequest {
  userId: number
}

export interface GetDiscussionRequest {
  courseId: number
}

export interface CourseList {
  courseId: number
  courseTitle: string
  noOfLessons: number
}

export interface DiscussionReply {
  replyId: number
  replyContent: string
  replyCreatedAt: string
  replyUpdatedAt: string
  replyLikes: number
  replyUserFullname: string
  replyUserId: number
  replyUserRole: string
}

export interface Discussion {
  postId: number
  postTitle: string
  postContent: string
  postCreatedAt: string
  postUpdatedAt: string
  postLikes: number
  postUserFullname: string
  postUserId: number
  postUserRole: string
  repliesDataList: DiscussionReply[]
}

export interface GetCourseListResponse {
  success: 'true' | 'false'
  data: CourseList[]
}

export interface GetDiscussionResponse {
  success: 'true' | 'false'
  data: Discussion[]
}


const API_BASE_URL = 'http://localhost:8440/api/v1'



const handleError = async (response: Response): Promise<never> => {
  const errorBody = await response.json().catch(() => null)

  throw new Error(
    errorBody?.message ||
    errorBody?.error ||
    `Request failed with status ${response.status}`
  )
}


export const getCourseList = async (
  request: GetCourseListRequest
): Promise<GetCourseListResponse> => {
  const response = await fetch(`${API_BASE_URL}/instructor/getCourseList`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    await handleError(response)
  }

  return await response.json()
}

export const getDiscussion = async (
  request: GetDiscussionRequest
): Promise<GetDiscussionResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/all/getDiscussion`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    await handleError(response)
  }

  return await response.json()
}