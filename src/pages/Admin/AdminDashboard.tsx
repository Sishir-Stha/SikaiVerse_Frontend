import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../context/AuthContext'
import {
  getAdminDashboardInfo,
  getUserList,
  type GetAdminDashboardResponse,
} from '../../api/Admin/adminDashboard'
import { Plus, BookOpen, Users, Eye, BarChart3 } from 'lucide-react'
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog'
import UserEditPanel from '../../components/UserEditPanel'

interface User {
  id: string
  name: string
  email: string
  role: 'Student' | 'Admin'
  status: 'Active' | 'Inactive'
}

export default function AdminDashboard() {
  const { user } = useAuth()

  // Dashboard stats
  const [dashboardData, setDashboardData] =
    useState<GetAdminDashboardResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Users
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

  // UI states
  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Load dashboard stats
  useEffect(() => {
  const loadDashboardData = async () => {
    try {
      const response = await getAdminDashboardInfo()
      setDashboardData(response.data)
    } catch (err) {
      console.error('Failed to load admin dashboard:', err)
      // Use default zeroed data instead of showing an error
      setDashboardData({
        totalCourse: 0,
        totalStudents: 0,
        totalModule: 0,
        totalLesson: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    loadDashboardData()
  }
}, [user])


  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getUserList()

        const mappedUsers: User[] = response.data.map(u => ({
          id: u.email,
          name: u.fullName,
          email: u.email,
          role: u.role as 'Student' | 'Admin',
          status: u.status as 'Active' | 'Inactive',
        }))

        setUsers(mappedUsers)
      } catch (err) {
        console.error(err)
        setUsersError('Failed to load users')
      } finally {
        setUsersLoading(false)
      }
    }

    loadUsers()
  }, [])

  const stats = dashboardData
    ? [
        {
          label: 'Total Courses',
          value: dashboardData.totalCourse.toString(),
          subtitle: 'Courses created',
          icon: BookOpen,
        },
        {
          label: 'Total Students',
          value: dashboardData.totalStudents.toString(),
          subtitle: 'Enrolled students',
          icon: Users,
        },
        {
          label: 'Total Modules',
          value: dashboardData.totalModule.toString(),
          subtitle: 'Modules created',
          icon: Eye,
        },
        {
          label: 'Total Lessons',
          value: dashboardData.totalLesson.toString(),
          subtitle: 'Lessons created',
          icon: BarChart3,
        },
      ]
    : []

  // User actions
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditPanelOpen(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setEditPanelOpen(true)
  }

  const handleSaveUser = async (formData: any) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (selectedUser?.id) {
        setUsers(users.map(u => (u.id === selectedUser.id ? { ...formData, id: selectedUser.id } : u)))
      } else {
        setUsers([...users, { ...formData, id: Date.now().toString() }])
      }

      setEditPanelOpen(false)
      setSelectedUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6 md:p-12 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your learning platform and courses
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-2" />
                  <div className="h-8 bg-muted rounded w-16 mb-2" />
                  <div className="h-3 bg-muted rounded w-24" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <p className="col-span-4 text-center text-red-500">{error}</p>
          ) : (
            stats.map((stat, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.subtitle}
                      </p>
                    </div>
                    <stat.icon className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>⚙️ Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Create Course', icon: '➕', href: '/Admin/courses/create' },
                { title: 'Add Module', icon: '👁️', href: '/Admin/modules/create' },
                { title: 'Create Lesson', icon: '📖', href: '/Admin/lessons/create' },
              ].map((action, i) => (
                <Link key={i} to={action.href}>
                  <div className="flex flex-col items-center justify-center p-6 rounded-lg border hover:bg-muted transition">
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <p className="font-medium">{action.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="card-enhanced animate-stagger-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                User Management
              </CardTitle>
              <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus size={18} className="mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`border-b border-border hover:bg-muted/50 transition-all duration-300 animate-stagger-${(idx % 3) + 1}`}
                    >
                      <td className="py-2">{user.name}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">{user.role}</td>
                      <td className="py-2 px-4">{user.status}</td>
                      <td className="py-3 px-4 flex gap-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Panel */}
        <UserEditPanel
          isOpen={editPanelOpen}
          user={selectedUser}
          isLoading={isLoading}
          onClose={() => setEditPanelOpen(false)}
          onSave={handleSaveUser}
        />

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete User"
          description="This action cannot be undone. The user will be permanently deleted."
          itemName={userToDelete?.name}
          onConfirm={confirmDeleteUser}
          onCancel={() => setDeleteDialogOpen(false)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
