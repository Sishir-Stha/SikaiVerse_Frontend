export interface GetCourseInfoRequest {
  userId: number
}

export interface GetEnrolledDetailsRequest {
  courseId: number
}

export interface EnrolledModule {
  moduleId: number
  moduleOrderNo: number
  moduleTitle: string
  noOfLesson: number
}

export interface EnrolledCourseDetails {
  category: string
  completionPercentage: number
  courseId: number
  courseTitle: string
  description: string
  image: string
  instructorName: string
  level: string
  modules: EnrolledModule[]
  rating: number
  totalDuration: number
  totalLessons: number
  totalModules: number
  totalStudents: number
}

export interface GetEnrolledDetailsResponse {
  success: string
  data: EnrolledCourseDetails
}
export interface CourseInfo {
  courseId: number
  courseTitle: string
  description: string | null
  instructorName: string
  level: string
  rating: number
  totalDuration: number 
  totalLessons: number
  totalModules: number
}

export interface GetCourseInfoResponse {
  success: string
  data: CourseInfo[]
}

export interface SidebarLesson {
  lessonId: number
  lessonTitle: string
  duration: number
  status: 'not_started' | 'in_progress' | 'completed'
}

export interface SidebarModule {
  moduleId: number
  moduleTitle: string
  lessons: SidebarLesson[]
}

export interface GetSidebarRequest {
  courseId: number
}

export interface GetSidebarResponse {
  success: string
  data: SidebarModule[]
}

export interface LessonDetails {
  lessonTitle: string
  description: string
  duration: number
  contentType: string   
  lessonContent: string
  lessonData: string
  status: string        
}

export interface GetLessonDetailsRequest {
  lessonId: number
}

export interface GetLessonDetailsResponse {
  success: string
  data: LessonDetails
}

export interface LessonProgressRequest {
  userId: number
  lessonId: number
}

export interface LessonProgressResponse {
  success: string
  message?: string
}


const API_BASE_URL = 'http://localhost:8440/api/v1'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

export const getCourseInfo = async (
  request: GetCourseInfoRequest
): Promise<GetCourseInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/student/getCourseInfoList`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch course info')
  }

  return response.json()
}

export const getEnrolledDetails = async (
  request: GetEnrolledDetailsRequest
): Promise<GetEnrolledDetailsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/student/getEnrolledDetails`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch enrolled course details')
  }

  return response.json()
}

export const getCourseSidebar = async (
  request: GetSidebarRequest
): Promise<GetSidebarResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/course/getSideBar`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch course sidebar')
  }

  return response.json()
}

export const getLessonDetails = async (
  request: GetLessonDetailsRequest
): Promise<GetLessonDetailsResponse> => {
  const response = await fetch(
        `${API_BASE_URL}/course/getLessonDetails`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch lesson details')
  }

  return response.json()
}

export const isEnrolled = async (
  request:LessonProgressRequest
): Promise<LessonProgressResponse> => {
  const response = await fetch(`${API_BASE_URL}/student/isEnrolled`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to check enrollment status')
  }

  return response.json()
}

export const setLessonInProgress = async (
  request: LessonProgressRequest
): Promise<LessonProgressResponse> => {
  const response = await fetch(`${API_BASE_URL}/course/setInProgress`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to set lesson in progress')
  }

  return response.json()
}


export const setLessonCompleted = async (
  request: LessonProgressRequest
): Promise<LessonProgressResponse> => {
  const response = await fetch(`${API_BASE_URL}/course/setCompleted`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to set lesson completed')
  }

  return response.json()
}