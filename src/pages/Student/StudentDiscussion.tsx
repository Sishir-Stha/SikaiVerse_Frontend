import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/use-toast'
import {
  getDiscussion,
  type Discussion,
  type DiscussionReply,
} from '../../api/Student/studentDiscussion'
import {
  likeDiscussion,
  likeReply,
  addPostReply,
  addReply,
} from '../../api/Shared/all/discussion'
import { MessageCircle, Heart, Reply, Send, Loader2 } from 'lucide-react'

export default function DiscussionForumPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [posts, setPosts] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [isPostingNew, setIsPostingNew] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [likingPostIds, setLikingPostIds] = useState<Set<number>>(new Set())
  const [likingReplyIds, setLikingReplyIds] = useState<Set<number>>(new Set())

  const loadDiscussions = async () => {
    if (!courseId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getDiscussion({ courseId: Number(courseId) })

      if (response.success === 'true') {
        setPosts(response.data)
      } else {
        setError('Failed to load discussions.')
      }
    } catch (err) {
      console.error('Failed to load discussions:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to load discussions.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDiscussions()
  }, [courseId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'instructor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const handlePostQuestion = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !user || !courseId) return

    setIsPostingNew(true)

    try {
      const response = await addPostReply({
        courseId: Number(courseId),
        userId: user.id,
        title: newPostTitle,
        content: newPostContent,
      })

      if (response.success === 'true') {
        setNewPostTitle('')
        setNewPostContent('')
        success('Question posted successfully!')
        await loadDiscussions()
      } else {
        showError(response.message || 'Failed to post question.')
      }
    } catch (err) {
      console.error('Failed to post question:', err)
      showError(
        err instanceof Error ? err.message : 'Failed to post question.'
      )
    } finally {
      setIsPostingNew(false)
    }
  }

  const handleReply = async (postId: number) => {
    if (!replyContent.trim() || !user) return

    setIsReplying(true)

    try {
      const response = await addReply({
        postId,
        userId: user.id,
        content: replyContent,
      })

      if (response.success === 'true') {
        setReplyContent('')
        setReplyingTo(null)
        success('Reply posted successfully!')
        await loadDiscussions()
      } else {
        showError(response.message || 'Failed to post reply.')
      }
    } catch (err) {
      console.error('Failed to post reply:', err)
      showError(
        err instanceof Error ? err.message : 'Failed to post reply.'
      )
    } finally {
      setIsReplying(false)
    }
  }

  const handleLikePost = async (postId: number) => {
    if (likingPostIds.has(postId)) return

    setLikingPostIds((prev) => new Set(prev).add(postId))

    try {
      const response = await likeDiscussion({ postId })

      if (response.success === 'true') {
        setPosts((prev) =>
          prev.map((p) =>
            p.postId === postId ? { ...p, postLikes: p.postLikes + 1 } : p
          )
        )
      } else {
        showError(response.message || 'Failed to like post.')
      }
    } catch (err) {
      console.error('Failed to like post:', err)
      showError(
        err instanceof Error ? err.message : 'Failed to like post.'
      )
    } finally {
      setLikingPostIds((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }

  const handleLikeReply = async (replyId: number, postId: number) => {
    if (likingReplyIds.has(replyId)) return

    setLikingReplyIds((prev) => new Set(prev).add(replyId))

    try {
      const response = await likeReply({ replyId })

      if (response.success === 'true') {
        setPosts((prev) =>
          prev.map((p) =>
            p.postId === postId
              ? {
                  ...p,
                  repliesDataList: p.repliesDataList.map((r) =>
                    r.replyId === replyId
                      ? { ...r, replyLikes: r.replyLikes + 1 }
                      : r
                  ),
                }
              : p
          )
        )
      } else {
        showError(response.message || 'Failed to like reply.')
      }
    } catch (err) {
      console.error('Failed to like reply:', err)
      showError(
        err instanceof Error ? err.message : 'Failed to like reply.'
      )
    } finally {
      setLikingReplyIds((prev) => {
        const next = new Set(prev)
        next.delete(replyId)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={32} className="text-primary" />
            <h1 className="text-4xl font-bold">Discussion Forum</h1>
          </div>
          <p className="text-muted-foreground">
            Ask questions, share insights, and connect with fellow learners
          </p>
        </div>

        {/* New Post Form */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Start a Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Question title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                disabled={isPostingNew}
              />
              <textarea
                placeholder="Describe your question or topic..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                disabled={isPostingNew}
                className="w-full p-3 border border-border rounded-md bg-background text-foreground min-h-24 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
              <Button
                onClick={handlePostQuestion}
                disabled={
                  !newPostTitle.trim() || !newPostContent.trim() || isPostingNew
                }
                className="gap-2"
              >
                {isPostingNew ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {isPostingNew ? 'Posting...' : 'Post Question'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={40} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-center">
              Loading discussions...
            </p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={loadDiscussions}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle
                size={48}
                className="mx-auto mb-4 text-muted-foreground opacity-50"
              />
              <p className="text-muted-foreground">
                No discussions yet. Be the first to start one!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.postId}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {post.postUserFullname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {post.postUserFullname}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(post.postUserRole)}`}
                            >
                              {post.postUserRole}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(post.postCreatedAt)}
                            {post.postUpdatedAt !== post.postCreatedAt && (
                              <span className="ml-1">(edited)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">
                        {post.postTitle}
                      </CardTitle>
                    </div>
                    <button
                      onClick={() => handleLikePost(post.postId)}
                      disabled={likingPostIds.has(post.postId)}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {likingPostIds.has(post.postId) ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Heart size={18} />
                      )}
                      <span className="text-sm">{post.postLikes}</span>
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-foreground whitespace-pre-wrap">
                    {post.postContent}
                  </p>

                  {/* Replies */}
                  {post.repliesDataList && post.repliesDataList.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-border space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        {post.repliesDataList.length}{' '}
                        {post.repliesDataList.length === 1
                          ? 'Reply'
                          : 'Replies'}
                      </p>
                      {post.repliesDataList.map((reply: DiscussionReply) => (
                        <div key={reply.replyId} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-xs">
                              {reply.replyUserFullname
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {reply.replyUserFullname}
                              </p>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getRoleBadgeColor(reply.replyUserRole)}`}
                              >
                                {reply.replyUserRole}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(reply.replyCreatedAt)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between ml-8">
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {reply.replyContent}
                            </p>
                            <button
                              onClick={() =>
                                handleLikeReply(reply.replyId, post.postId)
                              }
                              disabled={likingReplyIds.has(reply.replyId)}
                              className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50 shrink-0 ml-2 cursor-pointer"
                            >
                              {likingReplyIds.has(reply.replyId) ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Heart size={14} />
                              )}
                              <span className="text-xs">
                                {reply.replyLikes}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {user && (
                    <>
                      {replyingTo === post.postId ? (
                        <div className="mt-4 space-y-2">
                          <textarea
                            placeholder="Write your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            disabled={isReplying}
                            className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm min-h-16 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReply(post.postId)}
                              disabled={!replyContent.trim() || isReplying}
                              className="gap-2"
                            >
                              {isReplying ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Send size={14} />
                              )}
                              {isReplying ? 'Posting...' : 'Reply'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isReplying}
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent('')
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
                          onClick={() => setReplyingTo(post.postId)}
                          className="gap-2"
                        >
                          <Reply size={16} />
                          Reply
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}