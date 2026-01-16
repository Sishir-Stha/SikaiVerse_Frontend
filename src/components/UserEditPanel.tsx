import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X } from 'lucide-react'

interface User {
  id?: string
  name: string
  email: string
  role: 'Student' | 'Admin' | 'student' | 'admin'
  status: 'Active' | 'Inactive' | 'active' | 'inactive'
}

interface UserEditPanelProps {
  isOpen: boolean
  user?: User | null
  isLoading?: boolean
  onClose: () => void
  onSave: (user: User) => void
}

const EMPTY_USER: User = {
  name: '',
  email: '',
  role: 'student',
  status: 'active',
}

export default function UserEditPanel({
  isOpen,
  user,
  isLoading = false,
  onClose,
  onSave,
}: UserEditPanelProps) {
  const [formData, setFormData] = useState<User>(EMPTY_USER)

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        role: user.role.toLowerCase() as User['role'],
        status: user.status.toLowerCase() as User['status'],
      })
    } else {
      setFormData(EMPTY_USER)
    }
  }, [user, isOpen])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md z-50 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {user?.id ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} disabled={isLoading}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save User'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
