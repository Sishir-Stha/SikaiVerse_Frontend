import { Star } from 'lucide-react'
import { Badge } from './ui/badge'

export interface Course {
  name: string
  description?: string
  level?: string
  rating?: number
  category?: string
  instructor?: string
  duration?: string
}

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="space-y-2">
        <h3 className="font-bold text-base text-slate-900 leading-tight line-clamp-2">
          {course.name}
        </h3>

        <div className="flex flex-wrap gap-2">
          {course.level && (
            <Badge variant="secondary" className="text-[11px] font-medium uppercase tracking-wide">
              {course.level}
            </Badge>
          )}
          {course.category && (
            <Badge variant="outline" className="text-[11px] font-medium uppercase tracking-wide">
              {course.category}
            </Badge>
          )}
        </div>

        {course.rating !== undefined && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(course.rating!)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                  }
                />
              ))}
            </div>
            <span>{course.rating.toFixed(1)}/5</span>
          </div>
        )}

        {course.description && (
          <p className="text-sm text-slate-600 line-clamp-3">
            {course.description}
          </p>
        )}

        <div className="text-xs text-slate-500 flex flex-wrap gap-2">
          {course.instructor && <span>By {course.instructor}</span>}
          {course.duration && <span>{course.duration}</span>}
        </div>
      </div>
    </div>
  )
}
