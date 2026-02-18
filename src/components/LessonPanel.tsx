import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X, Upload } from 'lucide-react'
import type { Lesson, LessonContentType } from '../types/index'

interface LessonPanelProps {
  lesson: Lesson | null
  isOpen: boolean
  onClose: () => void
  onSave: (lesson: Lesson) => void
  moduleId: string
}

export function LessonPanel({ lesson, isOpen, onClose, onSave, moduleId }: LessonPanelProps) {
  const isNew = !lesson
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(lesson?.title || '')
  const [contentType, setContentType] = useState<LessonContentType>(lesson?.contentType || 'message')
  const [content, setContent] = useState(lesson?.content || '')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState(lesson?.content || '')
  const [duration, setDuration] = useState(lesson?.duration.toString() || '30')
  const [order, setOrder] = useState(lesson?.order.toString() || '1')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setFileName(file.name)
      setContent(file.name) // Store file name as content reference
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setFileName('')
    setContent('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    if (!title.trim()) return

    // Determine content based on type
    let finalContent = content
    if ((contentType === 'document' || contentType === 'video' || contentType === 'photo') && uploadedFile) {
      // In a real app, upload file to backend and get URL
      finalContent = uploadedFile.name
    }

    const savedLesson: Lesson = {
      id: lesson?.id || Math.random().toString(36).substr(2, 9),
      moduleId,
      title,
      description: '',
      content: finalContent,
      contentType,
      duration: parseInt(duration) || 30,
      order: parseInt(order) || 1,
      status: lesson?.status || 'not_started',
    }

    onSave(savedLesson)
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
            {isNew ? 'Create Lesson' : 'Edit Lesson'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Content Type *</label>
            <select
              value={contentType}
              onChange={e => setContentType(e.target.value as LessonContentType)}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground mt-1"
            >
              <option value="message">Message/Text</option>
              <option value="document">Document (PDF, DOCX, PPTX)</option>
              <option value="video">Video (MP4 or Link)</option>
              <option value="photo">Photo</option>
              <option value="link">External Link</option>
            </select>
          </div>

          {/* Dynamic Content Input */}
          {contentType === 'message' && (
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Enter lesson content"
                className="w-full p-2 border border-border rounded-md bg-background text-foreground min-h-24 mt-1"
              />
            </div>
          )}

          {(contentType === 'document' || contentType === 'video' || contentType === 'photo') && (
            <div>
              <label className="text-sm font-medium">
                {contentType === 'document' && 'Upload Document'}
                {contentType === 'video' && 'Upload Video or Paste URL'}
                {contentType === 'photo' && 'Upload Photo'}
              </label>
              
              {/* File Upload Input */}
              <div className="mt-2 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    contentType === 'document'
                      ? '.pdf,.docx,.pptx'
                      : contentType === 'video'
                      ? 'video/*'
                      : 'image/*'
                  }
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
                    >
                      <X size={16} className="text-destructive" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    <span className="text-sm">Click to upload {contentType}</span>
                  </button>
                )}
              </div>

              {/* URL Option for Video */}
              {contentType === 'video' && (
                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground">Or paste URL</label>
                  <Input
                    type="text"
                    value={content && !uploadedFile ? content : ''}
                    onChange={e => !uploadedFile && setContent(e.target.value)}
                    placeholder="e.g., https://youtube.com/watch?v=..."
                    className="mt-1 text-sm"
                    disabled={!!uploadedFile}
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                {contentType === 'document' && 'Supported: PDF, DOCX, PPTX (Max 50MB)'}
                {contentType === 'video' && 'Supported: MP4, WebM (Max 500MB) or YouTube/Vimeo URL'}
                {contentType === 'photo' && 'Supported: JPG, PNG, WebP (Max 10MB)'}
              </p>
            </div>
          )}

          {contentType === 'link' && (
            <div>
              <label className="text-sm font-medium">URL *</label>
              <Input
                type="url"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="30"
                min="1"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Order</label>
              <Input
                type="number"
                value={order}
                onChange={e => setOrder(e.target.value)}
                placeholder="1"
                min="1"
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-border pt-4 flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1"
            >
              Save Lesson
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
