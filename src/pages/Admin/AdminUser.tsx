import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { getUserList } from '../../api/Admin/adminUser'
import { Users, ArrowUpDown, Plus } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import UserEditPanel from '@/components/UserEditPanel'

// Define User interface matching the mapped API response
interface User {
  id: string
  name: string
  email: string
  role: 'Student' | 'Admin' | 'Instructor'
  status: 'Active' | 'Inactive'
  createdAt: string
  phoneNumber?: string
  address?: string
}

type SortField = 'name' | 'email' | 'role' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export default function AdminUser() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await getUserList()

        // Map the API response to our User interface
        const mappedUsers: User[] = response.data.map(u => ({
          id: u.email, // Using email as ID since API doesn't provide separate ID
          name: u.fullName,
          email: u.email,
          role: u.role as 'Student' | 'Admin',
          status: u.status as 'Active' | 'Inactive',
          createdAt: u.joinedDate,
          phoneNumber: u.phoneNumber,
          address: u.address,
        }))

        setUsers(mappedUsers)
      } catch (err) {
        console.error('Failed to load users:', err)
        setError('Failed to load users. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditPanelOpen(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setEditPanelOpen(true)
  }

  const handleSaveUser = async (formData: any) => {
    setIsSaving(true)
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))

      if (selectedUser?.id) {
        // Update existing user
        setUsers(users.map(u =>
          u.id === selectedUser.id
            ? { ...formData, id: selectedUser.id, createdAt: selectedUser.createdAt }
            : u
        ))
      } else {
        // Add new user
        const newUser: User = {
          ...formData,
          id: formData.email || Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        setUsers([...users, newUser])
      }

      setEditPanelOpen(false)
      setSelectedUser(null)
    } catch (err) {
      console.error('Failed to save user:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setIsSaving(true)
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (err) {
      console.error('Failed to delete user:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    let aVal: any = a[sortField]
    let bVal: any = b[sortField]

    if (sortField === 'createdAt') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
    >
      {label}
      {sortField === field && <ArrowUpDown size={14} />}
    </button>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-6 md:p-12 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Users size={32} />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage platform users and their roles</p>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>{users.length} total users</CardDescription>
              </div>
              <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus size={18} className="mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 py-3">
                    <div className="h-8 w-8 bg-muted rounded-full" />
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-4 bg-muted rounded w-48" />
                    <div className="h-4 bg-muted rounded w-20" />
                    <div className="h-4 bg-muted rounded w-16" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">
                        <SortHeader field="name" label="Name" />
                      </th>
                      <th className="text-left py-3 px-4">
                        <SortHeader field="email" label="Email" />
                      </th>
                          <th className="text-left py-3 px-4">Phone No</th>
                      <th className="text-left py-3 px-4">
                        <SortHeader field="role" label="Role" />
                      </th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-center py-3 px-4">
                        <SortHeader field="createdAt" label="Joined" />
                      </th>
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map(user => (
                      <tr
                        key={user.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">{user.phoneNumber || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              user.status === 'Active'
                                ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              className="transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Panel */}
        <UserEditPanel
          isOpen={editPanelOpen}
          user={selectedUser}
          isLoading={isSaving}
          onClose={() => {
            setEditPanelOpen(false)
            setSelectedUser(null)
          }}
          onSave={handleSaveUser}
        />

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete User"
          description="This action cannot be undone. The user will be permanently deleted."
          itemName={userToDelete?.name}
          onConfirm={confirmDeleteUser}
          onCancel={() => {
            setDeleteDialogOpen(false)
            setUserToDelete(null)
          }}
          isLoading={isSaving}
        />
      </div>
    </div>
  )
}