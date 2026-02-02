// ../../api/Shared/Privileged/PrivilegedCourse.ts

const API_BASE_URL = 'http://localhost:8440/api/v1'

// ==========================================
// GET EDIT INFO ENDPOINT
// ==========================================

export interface GetEditInfoRequest {
  courseId: number
}

export interface LessonInfo {
  lessonId: number
  lessonTitle: string
  duration: number
}

export interface ModuleInfo {
  moduleId: number
  moduleTitle: string
  noOfLessons: number
  lesson: LessonInfo[]
}

export interface EditInfo {
  courseId: number
  courseTitle: string
  description: string
  instructorName: string
  level: string
  category: string
  modules: ModuleInfo[]
}

export interface ErrorResponse {
  success: "false"
  message: string
}

export type GetEditInfoResponse = EditInfo | ErrorResponse

export const isErrorResponse = (
  response: GetEditInfoResponse
): response is ErrorResponse => {
  return 'success' in response && response.success === "false"
}

export const getEditInfo = async (
  request: GetEditInfoRequest
): Promise<GetEditInfoResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/privileged/getEditInfo`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch edit info: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ==========================================
// UPDATE COURSE INFO ENDPOINT
// ==========================================

export interface UpdateCourseInfoRequest {
  courseId: number
  userId: number
  courseTitle?: string
  description?: string
  level?: string
  category?: string
}

export interface UpdateCourseInfoSuccessResponse {
  success: "true"
}

export interface UpdateCourseInfoErrorResponse {
  success: "false"
  message: string
}

export type UpdateCourseInfoResponse =
  | UpdateCourseInfoSuccessResponse
  | UpdateCourseInfoErrorResponse

export const isUpdateSuccess = (
  response: UpdateCourseInfoResponse
): response is UpdateCourseInfoSuccessResponse => {
  return response.success === "true"
}

export const updateCourseInfo = async (
  request: UpdateCourseInfoRequest
): Promise<UpdateCourseInfoResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/privileged/update/CourseInfo`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to update course info: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ==========================================
// GET INSTRUCTOR LIST ENDPOINT
// ==========================================

export interface Instructor {
  userId: number
  fullName: string
}

export interface GetInstructorListSuccessResponse {
  success: "true"
  data: Instructor[]
}

export interface GetInstructorListErrorResponse {
  success: "false"
  message: string
}

export type GetInstructorListResponse =
  | GetInstructorListSuccessResponse
  | GetInstructorListErrorResponse

export const isInstructorListSuccess = (
  response: GetInstructorListResponse
): response is GetInstructorListSuccessResponse => {
  return response.success === "true"
}

export const getInstructorList = async (): Promise<GetInstructorListResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/privileged/getInstructorList`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch instructor list: ${response.status} ${response.statusText}`)
  }

  return response.json()
}