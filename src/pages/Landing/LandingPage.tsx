import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import TopBar from '../../components/TopBar'
import { getCourseList, type CourseItem } from '../../api/Landing/landing'
import {
  Star,
  ArrowRight,
  MessageCircle,
  Headphones,
  Brain,
  BookOpen,
  Loader2,
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [recommendedCourses, setRecommendedCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine dashboard path based on user role (same logic as TopBar)
  const getDashboardPath = () => {
    return user?.role === 'admin' 
      ? '/admin/dashboard' 
      : user?.role === 'instructor' 
        ? '/instructor/dashboard' 
        : '/student/dashboard'
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendedCourses()
    }
  }, [isAuthenticated])

  const fetchRecommendedCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      // Send empty request body to get all courses
      const response = await getCourseList({})
      // Only show first 3 courses
      setRecommendedCourses(response.data.slice(0, 3))
    } catch (err) {
      console.error('Failed to fetch recommended courses:', err)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    navigate(getDashboardPath())
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in-up">
            <Badge className="mb-4 animate-fade-in">
              {isAuthenticated ? `Welcome back${user?.username ? `, ${user.username.split(' ')[0]}` : ''}` : 'Welcome to Sikai Verse'}
            </Badge>

            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in-up">
              Learn Anything. Anytime.
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Master new skills with our comprehensive learning platform. From web development to design, we have courses for everyone.
            </p>

            <div className="flex gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Browse always available */}
              <Link to="/browse">
                <Button size="lg" variant="outline" className="gap-2 hover:scale-105 transition-transform">
                  <BookOpen size={20} />
                  Browse Courses
                </Button>
              </Link>

              {/* Auth-only quick actions */}
              {isAuthenticated ? (
                <Button 
                  size="lg" 
                  className="gap-2 hover:scale-105 transition-transform"
                  onClick={handleGoToDashboard}
                >
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Button>
              ) : (
                // Guest: keep a single clear CTA for sign up/login
                <Link to="/login">
                  <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all">
                    Get Started Now
                    <ArrowRight size={20} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended (only for logged-in users) */}
      {isAuthenticated && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Recommended for you</h3>
              <Link to="/browse">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={fetchRecommendedCourses}>
                  Try Again
                </Button>
              </div>
            ) : recommendedCourses.length > 0 ? (
              <div className="grid sm:grid-cols-3 gap-4">
                {recommendedCourses.map((course) => (
                  <Card key={course.courseId} className="card-enhanced overflow-hidden">
                    {course.image && (
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                        <Badge className="absolute top-2 right-2 text-xs">
                          {course.level}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{course.instructor}</span>
                        <span>•</span>
                        <span>{course.category}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3 line-clamp-2 text-sm">
                        {course.description}
                      </CardDescription>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({course.totalStudents.toLocaleString()} students)
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {course.duration} hrs
                        </span>
                      </div>
                      <Link to={`/course-details/${course.courseId}`}>
                        <Button size="sm" className="w-full">
                          View Course
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No recommendations available at the moment.</p>
                <Link to="/browse">
                  <Button variant="outline">Browse All Courses</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-card to-background border-y border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in-up">Why Choose Sikai Verse?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Expert Courses', desc: 'Learn from industry experts' },
              { icon: Brain, title: 'AI Recommendations', desc: 'Personalized course suggestions' },
              { icon: MessageCircle, title: 'Discussion Forum', desc: 'Connect and collaborate with peers' },
              { icon: Headphones, title: 'AI Chatbot Support', desc: '24/7 instant learning assistance' },
            ].map((feature, i) => (
              <Card key={i} className={`animate-stagger-${(i % 4) + 1} card-enhanced`}>
                <CardHeader>
                  <feature.icon className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50K+', label: 'Active Learners' },
              { number: '100+', label: 'Expert Courses' },
              { number: '95%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'Support Available' },
            ].map((stat, i) => (
              <div key={i} className={`animate-stagger-${(i % 4) + 1}`}>
                <p className="text-4xl font-bold text-primary mb-2">{stat.number}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in-up">What Our Learners Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah Chen',
                role: 'Web Developer',
                text: 'Sikai Verse helped me transition into tech. The courses are well-structured and the instructors are amazing!',
                rating: 5,
              },
              {
                name: 'Mike Johnson',
                role: 'Designer',
                text: "The design courses are comprehensive and practical. I've already applied what I learned in my projects.",
                rating: 5,
              },
              {
                name: 'Emma Wilson',
                role: 'Student',
                text: "Best learning platform I've used. The community support and course quality are unmatched.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className={`animate-stagger-${(i % 3) + 1} card-enhanced`}>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, j) => (
                        <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                      ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Only for guests */}
      {!isAuthenticated && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of learners already transforming their careers with Sikai Verse.
            </p>
            <Link to="/login">
              <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all">
                Get Started Now
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Learning</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Courses</a></li>
                <li><a href="#" className="hover:text-foreground">Paths</a></li>
                <li><a href="#" className="hover:text-foreground">Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Sikai Verse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}