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

// ==========================================
// ADD COURSE ENDPOINT
// ==========================================

export interface AddCourseRequest {
  title: string
  description: string
  instructorId: number
  category: string
  level: string
  duration: number
  image: string
  rating: number
  totalStudents: number
}

export interface AddCourseSuccessResponse {
  success: "true"
}

export interface AddCourseErrorResponse {
  success: "false"
  message: string
}

export type AddCourseResponse =
  | AddCourseSuccessResponse
  | AddCourseErrorResponse

export const isAddCourseSuccess = (
  response: AddCourseResponse
): response is AddCourseSuccessResponse => {
  return response.success === "true"
}

export const addCourse = async (
  request: AddCourseRequest
): Promise<AddCourseResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/privileged/add/Course`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to add course: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ==========================================
// ADD MODULE ENDPOINT
// ==========================================

export interface AddModuleRequest {
  courseId: number
  moduleTitle: string
  description: string
}

export interface AddModuleSuccessResponse {
  success: "true"
}

export interface AddModuleErrorResponse {
  success: "false"
  message: string
}

export type AddModuleResponse =
  | AddModuleSuccessResponse
  | AddModuleErrorResponse

export const isAddModuleSuccess = (
  response: AddModuleResponse
): response is AddModuleSuccessResponse => {
  return response.success === "true"
}

export const addModule = async (
  request: AddModuleRequest
): Promise<AddModuleResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/privileged/add/Module`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to add module: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ==========================================
// ADD LESSON ENDPOINT (MULTIPART FORM DATA)
// ==========================================

export interface AddLessonRequest {
  moduleId: number
  lessonTitle: string
  lessonContent: string
  description: string
  contentType?: string
  contentData?: string
  fileData?: File
  duration?: number
}

export interface AddLessonSuccessResponse {
  success: "true"
}

export interface AddLessonErrorResponse {
  success: "false"
  message: string
}

export type AddLessonResponse =
  | AddLessonSuccessResponse
  | AddLessonErrorResponse

export const isAddLessonSuccess = (
  response: AddLessonResponse
): response is AddLessonSuccessResponse => {
  return response.success === "true"
}

export const addLesson = async (
  request: AddLessonRequest
): Promise<AddLessonResponse> => {
  const formData = new FormData()

  formData.append('moduleId', String(request.moduleId))
  formData.append('lessonTitle', request.lessonTitle)
  formData.append('lessonContent', request.lessonContent)
  formData.append('description', request.description)
  formData.append('contentType', request.contentType ?? 'link')
  formData.append('contentData', request.contentData ?? '')
  formData.append('duration', String(request.duration ?? 0))

  if (request.fileData) {
    formData.append('fileData', request.fileData)
  }

  const response = await fetch(
    `${API_BASE_URL}/shared/privileged/add/Lesson`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to add lesson: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ==========================================
// DELETE COURSE ENDPOINT
// ==========================================

export interface DeleteCourseRequest {
  courseId: number
}

export interface DeleteCourseSuccessResponse {
  success: "true"
}

export interface DeleteCourseErrorResponse {
  success: "false"
  message: string
}

export type DeleteCourseResponse =
  | DeleteCourseSuccessResponse
  | DeleteCourseErrorResponse

export const isDeleteCourseSuccess = (
  response: DeleteCourseResponse
): response is DeleteCourseSuccessResponse => {
  return response.success === "true"
}

export const deleteCourse = async (
  request: DeleteCourseRequest
): Promise<DeleteCourseResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/shared/privileged/deleteCourse`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to delete course: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
