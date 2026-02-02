import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X, Plus, Trash2, Edit2 } from 'lucide-react'
import type { Module, Lesson, LessonContentType } from '../types/index'

interface ModulePanelProps {
  module: Module | null
  isOpen: boolean
  onClose: () => void
  onSave: (module: Module) => void
  courseId: string
}

export function ModulePanel({ module, isOpen, onClose, onSave, courseId }: ModulePanelProps) {
  const isNew = !module
  const [title, setTitle] = useState(module?.title || '')
  const [description, setDescription] = useState(module?.description || '')
  const [order, setOrder] = useState(module?.order.toString() || '1')
  const [lessons, setLessons] = useState<Lesson[]>(module?.lessons || [])
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContentType, setLessonContentType] = useState<LessonContentType>('message')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonUrl, setLessonUrl] = useState('')
  const [lessonDuration, setLessonDuration] = useState('30')

  const handleAddLesson = () => {
    if (!lessonTitle.trim()) return

    if (editingLessonId) {
      // Update existing lesson
      setLessons(lessons.map(l =>
        l.id === editingLessonId
          ? {
              ...l,
              title: lessonTitle,
              content: lessonContent || lessonUrl,
              contentType: lessonContentType,
              duration: parseInt(lessonDuration) || 30,
            }
          : l
      ))
    } else {
      // Create new lesson
      const newLesson: Lesson = {
        id: Math.random().toString(36).substr(2, 9),
        moduleId: module?.id || 'temp',
        title: lessonTitle,
        description: '',
        content: lessonContent || lessonUrl,
        contentType: lessonContentType,
        duration: parseInt(lessonDuration) || 30,
        order: lessons.length + 1,
        status: 'not_started',
      }
      setLessons([...lessons, newLesson])
    }

    setLessonTitle('')
    setLessonContent('')
    setLessonUrl('')
    setLessonDuration('30')
    setEditingLessonId(null)
    setShowLessonForm(false)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id)
    setLessonTitle(lesson.title)
    setLessonContent(lesson.content)
    setLessonUrl(lesson.content)
    setLessonContentType(lesson.contentType)
    setLessonDuration(lesson.duration.toString())
    setShowLessonForm(true)
  }

  const handleDeleteLesson = (lessonId: string) => {
    setLessons(lessons.filter(l => l.id !== lessonId))
  }

  const handleSave = () => {
    if (!title.trim()) return

    const savedModule: Module = {
      id: module?.id || Math.random().toString(36).substr(2, 9),
      courseId,
      title,
      description,
      order: parseInt(order) || 1,
      lessons,
    }

    onSave(savedModule)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-lg z-50 overflow-y-auto transition-transform">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isNew ? 'Create Module' : 'Edit Module'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Module Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Module Details</h3>

            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter module title"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter module description (optional)"
                className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm min-h-20 mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Order</label>
              <Input
                type="number"
                value={order}
                onChange={e => setOrder(e.target.value)}
                placeholder="Module order"
                min="1"
                className="mt-1"
              />
            </div>
          </div>

          {/* Lessons Section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Lessons ({lessons.length})</h3>
              {!showLessonForm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLessonForm(true)}
                  className="gap-1"
                >
                  <Plus size={16} />
                  Add
                </Button>
              )}
            </div>

            {/* Lessons List */}
            {lessons.length > 0 && (
              <div className="space-y-2 mb-4">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-3 bg-muted/50 rounded-lg border border-border flex items-start justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.contentType} • {lesson.duration}m
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditLesson(lesson)}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                      >
                        <Edit2 size={16} className="text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Lesson Form */}
            {showLessonForm && (
              <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-3">
                <h4 className="font-semibold text-sm">{editingLessonId ? 'Edit Lesson' : 'Add Lesson'}</h4>
                <div>
                  <label className="text-xs font-medium">Lesson Title *</label>
                  <Input
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    placeholder="Lesson title"
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">Content Type *</label>
                  <select
                    value={lessonContentType}
                    onChange={e => setLessonContentType(e.target.value as LessonContentType)}
                    className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm mt-1"
                  >
                    <option value="message">Message/Text</option>
                    <option value="document">Document (PDF, DOCX, PPTX)</option>
                    <option value="video">Video (MP4 or Link)</option>
                    <option value="photo">Photo</option>
                    <option value="link">External Link</option>
                  </select>
                </div>

                {/* Dynamic Content Input */}
                {lessonContentType === 'message' && (
                  <div>
                    <label className="text-xs font-medium">Content</label>
                    <textarea
                      value={lessonContent}
                      onChange={e => setLessonContent(e.target.value)}
                      placeholder="Enter lesson content"
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm min-h-16 mt-1"
                    />
                  </div>
                )}

                {(lessonContentType === 'document' || lessonContentType === 'video' || lessonContentType === 'photo') && (
                  <div>
                    <label className="text-xs font-medium">
                      {lessonContentType === 'document' && 'Upload Document'}
                      {lessonContentType === 'video' && 'Upload Video or Paste URL'}
                      {lessonContentType === 'photo' && 'Upload Photo'}
                    </label>
                    <Input
                      type="text"
                      value={lessonUrl}
                      onChange={e => setLessonUrl(e.target.value)}
                      placeholder={
                        lessonContentType === 'video'
                          ? 'e.g., https://youtube.com/watch?v=...'
                          : `Paste ${lessonContentType} URL or file path`
                      }
                      className="mt-1 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {lessonContentType === 'document' && 'Supported: PDF, DOCX, PPTX'}
                      {lessonContentType === 'video' && 'Supported: MP4, YouTube, Vimeo'}
                      {lessonContentType === 'photo' && 'Supported: JPG, PNG, WebP'}
                    </p>
                  </div>
                )}

                {lessonContentType === 'link' && (
                  <div>
                    <label className="text-xs font-medium">URL *</label>
                    <Input
                      type="url"
                      value={lessonUrl}
                      onChange={e => setLessonUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={lessonDuration}
                    onChange={e => setLessonDuration(e.target.value)}
                    placeholder="30"
                    min="1"
                    className="mt-1 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={handleAddLesson}
                    disabled={!lessonTitle.trim()}
                    className="flex-1"
                  >
                    {editingLessonId ? 'Update Lesson' : 'Add Lesson'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowLessonForm(false)
                      setLessonTitle('')
                      setLessonContent('')
                      setLessonUrl('')
                      setEditingLessonId(null)
                      setLessonDuration('30')
                      setLessonContentType('message')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-border pt-4 flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1"
            >
              Save Module
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
