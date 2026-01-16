import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { useToast } from '../../hooks/use-toast'
import { Edit2, Eye, EyeOff } from 'lucide-react'
import { getProfileInfo, updateProfileInfo } from '../../api/Shared/all/Profile'
import Sidebar from '../../components/Sidebar'

export default function InstructorProfilePage() {
  const { user, resetPassword } = useAuth()
  const { success, error } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    newPassword: '',
    confirmPassword: '',
  })

  /* 🔄 Fetch profile info */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const res = await getProfileInfo({ userId: user.id })

        if (res.success === 'true') {
          const profile = res.data
          setFormData({
            name: profile.fullName || '',
            email: profile.email || '',
            phone: profile.phoneNumber || '',
            address: profile.address || '',
            newPassword: '',
            confirmPassword: '',
          })
        }
      } catch {
        error('Failed to load profile information')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  /* 💾 Save profile */
  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email) {
      error('Name and email are required')
      return
    }

    if (!user?.id) {
      error('User not found')
      return
    }

    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword.length < 8) {
        error('Password must be at least 8 characters')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        error('Passwords do not match')
        return
      }
    }

    try {
      /* 🔹 Update profile info API */
      const res = await updateProfileInfo({
        userId: user.id,
        fullName: formData.name,
        email: formData.email,
        role: '',         // always empty
        status: '',       // always empty
        phoneNumber: formData.phone,
        address: formData.address,
      })

      if (res.success !== 'true') {
        throw new Error()
      }

      /* 🔹 Optional password update */
      if (formData.newPassword) {
        await resetPassword(formData.newPassword)
        success('Profile & password updated successfully')
      } else {
        success('Profile updated successfully')
      }

      setIsEditing(false)
    } catch {
      error('Failed to update profile')
    }
  }

  if (loading) {
    return <div className="p-10">Loading profile...</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Account Details</h1>
            <p className="text-muted-foreground">Your profile information</p>
          </div>

          {/* Profile Card */}
          <Card className="w-full bg-background relative p-6 md:p-8 border border-border rounded-lg">
            {!isEditing && (
              <button
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={20} />
              </button>
            )}

            <CardContent className="space-y-6 w-full mt-[-20px]">
              {/* DISPLAY MODE */}
              {!isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                  <InfoItem label="Full Name" value={formData.name} />
                  <InfoItem label="Email" value={formData.email} />
                  <InfoItem label="Phone Number" value={formData.phone || 'Not provided'} />
                  <InfoItem label="Address" value={formData.address || 'Not provided'} />
                  <InfoItem label="Role" value={user?.role || ''} />
                </div>
              )}

              {/* EDIT MODE */}
              {isEditing && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
                    <InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} />
                    <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    <InputField label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    <InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                  </div>

                  {/* PASSWORD */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold">🔒 Change Password</h3>

                    <PasswordInput
                      label="New Password"
                      name="newPassword"
                      value={formData.newPassword}
                      show={showPassword}
                      setShow={setShowPassword}
                      onChange={handleInputChange}
                    />

                    <PasswordInput
                      label="Confirm Password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      show={showConfirmPassword}
                      setShow={setShowConfirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="sticky bottom-0 bg-background pt-4 flex gap-2">
                    <Button className="flex-1" onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

/* ---------- SMALL COMPONENTS ---------- */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function InputField(props: any) {
  return (
    <div>
      <label className="text-sm font-medium">{props.label}</label>
      <Input {...props} className="mt-1" />
    </div>
  )
}

function PasswordInput({ label, name, value, show, setShow, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        <Input
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}
