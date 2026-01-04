import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { getCourseList } from '../../api/Landing/landing'
import { useChatbot } from '../../context/ChatbotContext'
import TopBar from '../../components/TopBar'
import type { CourseItem } from '../../api/Landing/landing'
import {
  Users,
  Star,
  HelpCircle,
  ArrowUpRight,
  ArrowRight,
  X,
  SlidersHorizontal,
  GraduationCap,
  SearchX,
} from 'lucide-react'

// Level options - these are fixed
const LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function BrowseCoursesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { openChatbot } = useChatbot()

  // Store filtered courses from API
  const [courses, setCourses] = useState<CourseItem[]>([])
  
  // Store all courses count for display
  const [totalCoursesCount, setTotalCoursesCount] = useState<number>(0)
  
  // Dynamic categories extracted from initial API response
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([
    { value: '', label: 'All Categories' }
  ])
  
  // Track if categories have been loaded
  const categoriesLoaded = useRef(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  
  const [isLoading, setIsLoading] = useState(true)
  const [bannerVisible, setBannerVisible] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories once on initial mount
  useEffect(() => {
    const loadCategories = async () => {
      if (categoriesLoaded.current) return
      
      try {
        // Fetch all courses to extract categories
        const response = await getCourseList({
          courseId: 0,
          title: '',
          category: '',
          level: '',
          rating: 0,
        })

        // Store total count
        if (response.data && response.data.length > 0) {
          setTotalCoursesCount(response.data.length)

          // Extract unique categories from the response
          const uniqueCategories = [...new Set(response.data.map(course => course.category))]
            .filter(Boolean)
            .sort()
          
          const categoryOptions = [
            { value: '', label: 'All Categories' },
            ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
          ]
          setCategories(categoryOptions)
        }
        
        categoriesLoaded.current = true
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    loadCategories()
  }, [])

  // Fetch courses when filters change - Backend filtering
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Call API with filter parameters
        const response = await getCourseList({
          courseId: 0,
          title: searchTerm || '',
          category: selectedCategory || '',
          level: selectedLevel || '',
          rating: selectedRating || 0,
        })

        // Check if response has data
        if (response.data && Array.isArray(response.data)) {
          setCourses(response.data)
          
          // Update total count on initial load (when no filters)
          if (!searchTerm && !selectedCategory && !selectedLevel && selectedRating === 0) {
            setTotalCoursesCount(response.data.length)
          }
        } else {
          // No data returned
          setCourses([])
        }
      } catch (error) {
        console.error('Failed to load courses:', error)
        // Handle 422 or any other error - show empty state
        setCourses([])
        setError('No courses match your filter criteria')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [searchTerm, selectedCategory, selectedLevel, selectedRating])

  const handleCloseBanner = () => {
    setBannerVisible(false)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedRating(0)
    setSelectedCategory('')
    setSelectedLevel('')
    setError(null)
  }

  const handleCourseClick = (courseId: number) => {
    navigate(`/course-details/${courseId}`)
  }

  const hasActiveFilters = searchTerm || selectedRating > 0 || selectedCategory !== '' || selectedLevel !== ''

  // Generate stars display for the slider
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  // Get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="pb-8">
          <h1 className="text-5xl font-bold">Explore Categories</h1>
        </div>

        {/* Recommendation Banner */}
        {bannerVisible && (
          <div className="mb-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 flex items-center gap-4 border border-blue-200 dark:border-blue-800 relative">
            <div className="flex-shrink-0">
              <HelpCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-gray-100">
                Need help? Tell me a little about yourself so I can make the best recommendations.
              </p>
            </div>
            <button
              onClick={openChatbot}
              className="flex-shrink-0 text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Set your goal
              <ArrowUpRight size={16} />
            </button>
            <button
              onClick={handleCloseBanner}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close banner"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Courses Grid */}
        <div className="mb-12">
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-5 flex gap-8">
            {/* Sidebar Filters */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={20} />
                    <h3 className="font-semibold text-lg">Filters</h3>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Search Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Search
                  </h4>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Category Filter */}
                <div className="mb-8">
                  <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Category
                  </h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Level Filter */}
                <div className="mb-8">
                  <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <GraduationCap size={16} />
                    Level
                  </h4>
                  <div className="space-y-1">
                    {LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setSelectedLevel(level.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedLevel === level.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Rating Filter - Slider */}
                <div className="mb-8">
                  <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Minimum Rating
                  </h4>

                  {/* Current Rating Display */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {renderStars(selectedRating)}
                      <span className="text-sm font-medium">
                        {selectedRating > 0 ? `${selectedRating}+` : 'Any'}
                      </span>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-white
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:w-5
                        [&::-moz-range-thumb]:h-5
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-primary
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:border-2
                        [&::-moz-range-thumb]:border-white
                        [&::-moz-range-thumb]:shadow-md"
                    />

                    {/* Slider Labels */}
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Any</span>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                  disabled={!hasActiveFilters}
                >
                  <X size={16} className="mr-2" />
                  Clear All Filters
                </Button>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                      Active Filters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setSearchTerm('')}
                        >
                          "{searchTerm}"
                          <X size={12} />
                        </Badge>
                      )}
                      {selectedCategory && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setSelectedCategory('')}
                        >
                          {selectedCategory}
                          <X size={12} />
                        </Badge>
                      )}
                      {selectedLevel && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setSelectedLevel('')}
                        >
                          {LEVELS.find((l) => l.value === selectedLevel)?.label}
                          <X size={12} />
                        </Badge>
                      )}
                      {selectedRating > 0 && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setSelectedRating(0)}
                        >
                          {selectedRating}+ Stars
                          <X size={12} />
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Results Count */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    {isLoading ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        Showing{' '}
                        <span className="font-semibold text-foreground">
                          {courses.length}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-foreground">
                          {totalCoursesCount}
                        </span>{' '}
                        courses
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Cards */}
            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading courses...</p>
                </div>
              ) : courses.length === 0 || error ? (
                /* Empty State - No Courses Found */
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                      <SearchX size={40} className="text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Courses Found
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {error || "We couldn't find any courses matching your current filters. Try adjusting your search criteria."}
                  </p>
                  
                  {/* Show active filters if any */}
                  {hasActiveFilters && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-3">Active filters:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {searchTerm && (
                          <Badge variant="outline">Search: "{searchTerm}"</Badge>
                        )}
                        {selectedCategory && (
                          <Badge variant="outline">Category: {selectedCategory}</Badge>
                        )}
                        {selectedLevel && (
                          <Badge variant="outline">
                            Level: {LEVELS.find((l) => l.value === selectedLevel)?.label}
                          </Badge>
                        )}
                        {selectedRating > 0 && (
                          <Badge variant="outline">Rating: {selectedRating}+ Stars</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={clearFilters}>
                      <X size={16} className="mr-2" />
                      Clear All Filters
                    </Button>
                    <Button onClick={() => navigate('/')}>
                      Browse All Courses
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    /* Changed from <button> to <div> to avoid nesting buttons */
                    <div
                      key={course.courseId}
                      onClick={() => handleCourseClick(course.courseId)}
                      className="text-left cursor-pointer group"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleCourseClick(course.courseId)
                        }
                      }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] flex flex-col border border-gray-200 dark:border-gray-700 h-full">
                        {/* Course Image */}
                        <div className="aspect-video bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Level Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge
                              className={`capitalize ${getLevelBadgeColor(course.level)}`}
                            >
                              {course.level}
                            </Badge>
                          </div>
                          {/* Free Trial Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-white text-gray-900 hover:bg-gray-100">
                              Free Trial
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="flex-1 flex flex-col p-4">
                          {/* Category Badge */}
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                          </div>

                          {/* Provider Info */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {course.instructor.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {course.instructor}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 text-base group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                            {course.description}
                          </p>

                          {/* Rating and Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-1">
                              <Star
                                size={16}
                                className="text-yellow-500 fill-yellow-500"
                              />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {course.rating}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={16} />
                              <span>{course.totalStudents.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{course.duration}h</span>
                            </div>
                          </div>

                          {/* CTA - Using Link instead of nested Button */}
                          <div
                            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            Explore
                            <ArrowRight size={16} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-card border-t border-border py-16 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Sign up today and get access to all our courses. Learn at your own
            pace, anytime, anywhere.
          </p>
          <Link to="/login">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}