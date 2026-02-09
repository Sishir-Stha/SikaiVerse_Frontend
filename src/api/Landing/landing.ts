// api/Landing/landing.ts
export interface GetCourseListRequest {
  courseId?: number
  level?: string
  category?: string
  title?: string
  rating?: number
}

export interface CourseItem {
  courseId: number
  description: string
  duration: number
  image: string
  instructor: string
  category: string
  level: string
  rating: number
  title: string
  totalStudents: number
}


export interface GetCourseDetailsRequest {
  courseId: number
}

export interface CourseModule {
  moduleId: number
  moduleOrderNo: number
  moduleTitle: string
  noOfLesson: number
}

export interface CourseDetails {
  category: string
  courseId: number
  courseTitle: string
  description: string
  image: string
  instructorName: string
  level: string
  modules: CourseModule[]
  rating: number
  totalDuration: number
  totalLessons: number
  totalModules: number
  totalStudents: number
}

export interface GetCourseDetailsResponse {
  success: string
  data: CourseDetails
}

export interface IsEnrolledRequest {
  userId: number
  courseId: number
}

export interface IsEnrolledResponse {
  success: 'true' | 'false'
  message?: string
}


export interface GetCourseListResponse {
  success: string
  data: CourseItem[]
}

export interface EnrollCourseRequest {
  userId: number
  courseId: number
}

export interface EnrollCourseResponse {
  success: 'true' | 'false'
  message?: string
}


const API_BASE_URL = 'http://localhost:8440/api/v1'

export const getCourseList = async (
  params: GetCourseListRequest
): Promise<GetCourseListResponse> => {
  const response = await fetch(`${API_BASE_URL}/course/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  // Handle 422 - No courses match criteria
  if (response.status === 422) {
    // Return empty data array instead of throwing error
    return {
      success: 'true',
      data: []
    }
  }

  if (!response.ok) {
    throw new Error('Failed to fetch course list')
  }

  return response.json()
}

export const getCourseDetails = async (
  request: GetCourseDetailsRequest
): Promise<GetCourseDetailsResponse> => {
  const url = `${API_BASE_URL}/course/details`
  const body = JSON.stringify(request)
  
  console.log('=== COURSE DETAILS REQUEST ===')
  console.log('URL:', url)
  console.log('Body:', body)
  console.log('Request Object:', request)
  console.log('Course ID:', request.courseId)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    })

    console.log('Response Status:', response.status)
    console.log('Response OK:', response.ok)
    
    // Handle 422 - Course not found
    if (response.status === 422) {
      const errorBody = await response.text()
      console.error('422 Error Response:', errorBody)
      throw new Error('Course not found')
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response Error:', response.status, errorText)
      throw new Error(`Failed to fetch course details: ${response.status}`)
    }

    const data = await response.json()
    console.log('=== SUCCESS: Course Data ===', data)
    return data
  } catch (error) {
    console.error('=== FETCH ERROR ===', error)
    throw error
  }
}

export const enrollCourse = async (
  request: EnrollCourseRequest
): Promise<EnrollCourseResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/course/enroll`,
    {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
    },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to enroll course')
  }

  const result: EnrollCourseResponse = await response.json()

  if (result.success === 'false') {
    throw new Error(result.message || 'Enroll course failed')
  }

  return result
}


export const isCourseEnrolled = async (
  request: IsEnrolledRequest
): Promise<IsEnrolledResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/course/isEnrolled`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to check enrollment status')
  }

  const result: IsEnrolledResponse = await response.json()

  return result
}
