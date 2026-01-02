export type LessonContentType = 'document' | 'video' | 'link' | 'photo' | 'message'

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  content: string
  contentType: LessonContentType
  duration: number
  videoUrl?: string
  documentUrl?: string
  photoUrl?: string
  externalLink?: string
  order: number
  status: 'completed' | 'in_progress' | 'not_started'
}

export interface Module {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  students: number
  rating: number
  image: string
  modules: Module[]
  createdAt: string
}

export interface Progress {
  userId: string
  courseId: string
  completedLessons: string[]
  progress: number
  lastAccessed: string
}
