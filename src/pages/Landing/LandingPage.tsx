import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import TopBar from '../../components/TopBar'
import {
  Star,
  ArrowRight,
  MessageCircle,
  Headphones,
  Brain,
  BookOpen,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in-up">
            <Badge className="mb-4 animate-fade-in">Welcome to Sikai Verse</Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in-up">
              Learn Anything. Anytime.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Master new skills with our comprehensive learning platform. From web development to design, we have courses for everyone.
            </p>
            <div className="flex gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/login">
                <Button size="lg" className="hover:scale-105 transition-transform">Start Learning</Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="gap-2 hover:scale-105 transition-transform">
                  <BookOpen size={20} />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                text: 'The design courses are comprehensive and practical. I\'ve already applied what I learned in my projects.',
                rating: 5,
              },
              {
                name: 'Emma Wilson',
                role: 'Student',
                text: 'Best learning platform I\'ve used. The community support and course quality are unmatched.',
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

      {/* CTA Section */}
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
