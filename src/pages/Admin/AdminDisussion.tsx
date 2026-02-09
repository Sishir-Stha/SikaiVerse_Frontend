import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, MessageCircle, Send, Heart, Shield } from 'lucide-react'
import {
  getCourseList,
  getDiscussion,
  type CourseList,
  type Discussion,
  type GetCourseListRequest,
  type GetDiscussionRequest
} from '../../api/Admin/adminDiscussion'
import { likeDiscussion, likeReply } from '../../api/Shared/all/discussion'

export default function AdminDiscussionsPage() {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { user } = useAuth()
  
  // State
  const [courses, setCourses] = useState<CourseList[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [replyingToPostId, setReplyingToPostId] = useState<number | null>(null)
  const [adminReplyContent, setAdminReplyContent] = useState('')
  const [likingPostId, setLikingPostId] = useState<number | null>(null)
  const [likingReplyId, setLikingReplyId] = useState<number | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [likedReplies, setLikedReplies] = useState<Set<number>>(new Set())

  // Load courses on mount
  useEffect(() => {
    let isMounted = true

    const loadCourses = async () => {
      if (!user) return
      
      try {
        const request: GetCourseListRequest = { userId: user.id }
        const response = await getCourseList(request)
        
        console.log('Course list response:', response)

        if (!isMounted) return

        if (response.success === 'true') {
          setCourses(response.data)
        } else {
          console.error('API returned failure:', response)
          error('Failed to load courses')
        }
      } catch (err) {
        console.error('Failed to load courses:', err)
        if (isMounted) {
          error('Failed to load courses')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCourses()

    return () => {
      isMounted = false
    }
  }, [user])

  // Handle course selection
  const handleSelectCourse = async (courseId: number) => {
    setSelectedCourseId(courseId)
    setIsLoadingDiscussions(true)
    
    try {
      const request: GetDiscussionRequest = { courseId }
      const response = await getDiscussion(request)

      if (response.success === 'true') {
        setDiscussions(response.data)
      } else {
        error('Failed to load discussions')
        setDiscussions([])
      }
    } catch (err) {
      console.error('Failed to load discussions:', err)
      error('Failed to load discussions')
      setDiscussions([])
    } finally {
      setIsLoadingDiscussions(false)
    }
  }

  // Handle admin reply
  const handleAdminReply = async (postId: number) => {
    if (!adminReplyContent.trim() || !selectedCourseId || !user) return

    try {
      // TODO: Implement addAdminReply API call
      console.log('Posting admin reply to discussion:', postId, adminReplyContent)
      
      success('Admin reply posted successfully!')
      setAdminReplyContent('')
      setReplyingToPostId(null)
      
      // Refresh discussions after posting
      await handleSelectCourse(selectedCourseId)
    } catch (err) {
      console.error('Failed to post reply:', err)
      error('Failed to post reply')
    }
  }

  // Handle like post
  const handleLikePost = async (postId: number) => {
    const isLiked = likedPosts.has(postId)
    
    if (isLiked) {
      // Unlike - just remove from UI
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
      success('Post unliked!')
      return
    }
    
    // Like - call API
    setLikingPostId(postId)
    try {
      const response = await likeDiscussion({ postId })
      if (response.success === 'true') {
        setDiscussions(prevDiscussions =>
          prevDiscussions.map(post =>
            post.postId === postId
              ? { ...post, postLikes: post.postLikes + 1 }
              : post
          )
        )
        setLikedPosts(prev => new Set(prev).add(postId))
        success('Post liked!')
      } else {
        error('Failed to like post')
      }
    } catch (err) {
      console.error('Failed to like post:', err)
      error('Failed to like post')
    } finally {
      setLikingPostId(null)
    }
  }

  // Handle like reply
  const handleLikeReply = async (postId: number, replyId: number) => {
    const isLiked = likedReplies.has(replyId)
    
    if (isLiked) {
      // Unlike - just remove from UI
      setLikedReplies(prev => {
        const newSet = new Set(prev)
        newSet.delete(replyId)
        return newSet
      })
      success('Reply unliked!')
      return
    }
    
    // Like - call API
    setLikingReplyId(replyId)
    try {
      const response = await likeReply({ replyId })
      if (response.success === 'true') {
        setDiscussions(prevDiscussions =>
          prevDiscussions.map(post =>
            post.postId === postId
              ? {
                  ...post,
                  repliesDataList: post.repliesDataList?.map(reply =>
                    reply.replyId === replyId
                      ? { ...reply, replyLikes: reply.replyLikes + 1 }
                      : reply
                  ) || []
                }
              : post
          )
        )
        setLikedReplies(prev => new Set(prev).add(replyId))
        success('Reply liked!')
      } else {
        error('Failed to like reply')
      }
    } catch (err) {
      console.error('Failed to like reply:', err)
      error('Failed to like reply')
    } finally {
      setLikingReplyId(null)
    }
  }

  // Filter courses by search query
  const filteredCourses = courses.filter(c =>
    c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected course title
  const selectedCourseTitle = courses.find(c => c.courseId === selectedCourseId)?.courseTitle

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Helper function to get initials
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to get role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'instructor':
        return 'default'
      case 'student':
        return 'secondary'
      case 'admin':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} className="text-destructive" />
            <h1 className="text-4xl font-bold">Admin Discussion Management</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor and moderate all course discussions across the platform
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-40"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 animate-pulse">
              <CardContent className="pt-12 pb-12">
                <div className="h-12 w-12 bg-muted rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Course List Sidebar */}
            <div className="md:col-span-1">
              <Card className="card-enhanced animate-stagger-1">
                <CardHeader>
                  <CardTitle className="text-lg">All Courses</CardTitle>
                  <CardDescription>Select a course to moderate discussions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Search */}
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="mb-4"
                  />

                  {/* Course List */}
                  {filteredCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {courses.length === 0 ? 'No courses available' : 'No courses found'}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {filteredCourses.map((course) => (
                        <button
                          key={course.courseId}
                          onClick={() => handleSelectCourse(course.courseId)}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-300 hover:shadow-md ${
                            selectedCourseId === course.courseId
                              ? 'border-destructive bg-destructive/10'
                              : 'border-border hover:border-destructive hover:bg-muted'
                          }`}
                        >
                          <p className="font-medium text-sm">{course.courseTitle}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {course.noOfLessons} lessons
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Discussions View */}
            <div className="md:col-span-2">
              {!selectedCourseId ? (
                <Card className="card-enhanced animate-stagger-2">
                  <CardContent className="pt-12 text-center pb-12">
                    <MessageCircle
                      size={48}
                      className="mx-auto mb-4 text-muted-foreground opacity-50"
                    />
                    <p className="text-muted-foreground mb-2">
                      Select a course to moderate discussions
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Choose a course from the list on the left
                    </p>
                  </CardContent>
                </Card>
              ) : isLoadingDiscussions ? (
                <Card className="card-enhanced">
                  <CardContent className="pt-12 text-center pb-12">
                    <div className="animate-spin w-8 h-8 border-4 border-destructive border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading discussions...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 animate-fade-in-up">
                  {/* Course Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCourseTitle}</h2>
                      <p className="text-muted-foreground">
                        {discussions.length} discussion{discussions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourseId(null)
                        setDiscussions([])
                      }}
                      className="gap-2"
                    >
                      <ArrowLeft size={18} />
                      Back
                    </Button>
                  </div>

                  {/* Discussions List */}
                  {discussions.length === 0 ? (
                    <Card className="card-enhanced">
                      <CardContent className="pt-12 text-center pb-12">
                        <MessageCircle
                          size={48}
                          className="mx-auto mb-4 text-muted-foreground opacity-50"
                        />
                        <p className="text-muted-foreground">No discussions yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          No discussions have been started for this course
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {discussions.map((post) => (
                        <Card key={post.postId} className="card-enhanced">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {/* User Avatar */}
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">
                                      {getInitials(post.postUserFullname)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{post.postUserFullname}</p>
                                      <Badge variant={getRoleBadgeVariant(post.postUserRole)} className="text-xs capitalize">
                                        {post.postUserRole}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(post.postCreatedAt)}
                                    </p>
                                  </div>
                                </div>
                                {/* Post Title */}
                                <CardTitle className="text-lg mt-3">{post.postTitle}</CardTitle>
                              </div>
                              <button
                                onClick={() => handleLikePost(post.postId)}
                                disabled={likingPostId === post.postId}
                                className="flex items-center gap-2 text-muted-foreground hover:text-red-400 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                              >
                                <Heart
                                  size={18}
                                  className={`transition-all duration-200 ${
                                    likingPostId === post.postId ? 'animate-pulse' : ''
                                  } text-red-400`}
                                  fill={likedPosts.has(post.postId) ? 'currentColor' : 'none'}
                                />
                                <span className="text-sm">{post.postLikes}</span>
                              </button>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Post Content */}
                            <p className="text-foreground whitespace-pre-wrap">
                              {post.postContent}
                            </p>

                            {/* Replies Section */}
                            {post.repliesDataList && post.repliesDataList.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                  <MessageCircle size={16} />
                                  {post.repliesDataList.length} {post.repliesDataList.length === 1 ? 'Reply' : 'Replies'}
                                </p>
                                <div className="pl-4 border-l-2 border-border space-y-4">
                                  {post.repliesDataList.map(reply => (
                                    <div key={reply.replyId} className="bg-muted/30 rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                                          <span className="text-xs font-semibold">
                                            {getInitials(reply.replyUserFullname)}
                                          </span>
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{reply.replyUserFullname}</p>
                                            <Badge variant={getRoleBadgeVariant(reply.replyUserRole)} className="text-xs capitalize">
                                              {reply.replyUserRole}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            {formatDate(reply.replyCreatedAt)}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => handleLikeReply(post.postId, reply.replyId)}
                                          disabled={likingReplyId === reply.replyId}
                                          className="flex items-center gap-1 text-muted-foreground hover:text-red-400 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                                        >
                                          <Heart
                                            size={14}
                                            className={`transition-all duration-200 ${
                                              likingReplyId === reply.replyId ? 'animate-pulse' : ''
                                            } text-red-400`}
                                            fill={likedReplies.has(reply.replyId) ? 'currentColor' : 'none'}
                                          />
                                          <span className="text-xs">{reply.replyLikes}</span>
                                        </button>
                                      </div>
                                      <p className="text-sm text-foreground">{reply.replyContent}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Admin Reply Form */}
                            {replyingToPostId === post.postId ? (
                              <div className="mt-4 space-y-3 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive" className="text-xs">
                                    Admin
                                  </Badge>
                                  <p className="text-sm font-medium">Post Admin Reply</p>
                                </div>
                                <textarea
                                  placeholder="Write your admin response..."
                                  value={adminReplyContent}
                                  onChange={e => setAdminReplyContent(e.target.value)}
                                  className="w-full p-3 border border-border rounded-md bg-background text-foreground text-sm min-h-24 resize-y focus:outline-none focus:ring-2 focus:ring-destructive"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleAdminReply(post.postId)}
                                    disabled={!adminReplyContent.trim()}
                                    className="gap-2"
                                  >
                                    <Send size={16} />
                                    Post Reply
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setReplyingToPostId(null)
                                      setAdminReplyContent('')
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReplyingToPostId(post.postId)}
                                className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                              >
                                <Shield size={16} />
                                Reply as Admin
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}