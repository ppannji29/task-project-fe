"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Building, 
  Camera, 
  Save, 
  Edit,
  UserCircle,
  Briefcase,
  FileText,
  ChevronDown,
  Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/layout/DashboardLayout"

interface UserProfile {
  user_id: string
  name: string
  email: string
  phone: string
  role_id: number
  role: {
    role_id: number
    name: string
    description: string
  }
  department_id: number
  department: {
    department_id: number
    name: string
    code: string
    description: string
  }
  profile: {
    id: string
    address: string
    photo: string
    bio: string
    birthdate: string
    age: number
    gender: string
    created_at: string
    updated_at: string
  }
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false)
  const router = useRouter()
  const { success, error: toastError } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
    birthdate: "",
    gender: "Male"
  })

  // Gender options with icons
  const genderOptions = [
    { value: "Male", label: "Male", icon: "👨" },
    { value: "Female", label: "Female", icon: "👩" }
  ]

  // Fetch user profile
  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile()
    } else if (!authLoading && !user) {
      router.replace("/auth/login")
    }
  }, [user, authLoading, router])

  const fetchProfile = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await apiService.getCurrentUser()
      console.log("RESPONSE ME: ", response)
      const userData = response.data.data
      setProfile(userData)
      
      // Set form data
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        address: userData.profile?.address || "",
        bio: userData.profile?.bio || "",
        birthdate: userData.profile?.birthdate && userData.profile.birthdate !== "0001-01-01T00:00:00Z" 
          ? userData.profile.birthdate.split('T')[0] 
          : "",
        gender: userData.profile?.gender || "Male"
      })
      
      // Set photo preview
      if (userData.profile?.photo) {
        setPhotoPreview(userData.profile.photo)
      }
      
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to fetch profile"
      setError(message)
      toastError(`Failed to load profile: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle gender selection
  const handleGenderSelect = (gender: string) => {
    setFormData(prev => ({
      ...prev,
      gender: gender
    }))
    setGenderDropdownOpen(false)
  }

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastError("File too large! Please select an image smaller than 5MB")
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastError("Invalid file type! Please select an image file")
        return
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save profile
  const handleSaveProfile = async () => {
    setSaving(true)
    setError("")
    
    try {
      // Prepare data
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        profile: {
          address: formData.address,
          bio: formData.bio,
          birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : null,
          gender: formData.gender
        }
      }
      console.log("updateData: ", updateData)
      //   await apiService.updateProfile(updateData)
      
      // Handle photo upload if changed
      const photoInput = document.getElementById('photo-upload') as HTMLInputElement
      if (photoInput?.files?.[0]) {
        const formData = new FormData()
        formData.append('photo', photoInput.files[0])
        // await apiService.uploadProfilePhoto(formData)
        console.log("formData: ", formData)
      }
      
      success("Profile updated successfully!")
      setIsEditing(false)
      fetchProfile() // Refresh data
      
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Failed to update profile"
      setError(message)
      toastError(`Update failed: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  // Calculate age from birthdate
  const calculateAge = (birthdate: string) => {
    if (!birthdate || birthdate === "0001-01-01T00:00:00Z") return null
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "Not provided"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get current selected gender option
  const selectedGender = genderOptions.find(option => option.value === formData.gender) || genderOptions[0]

  // Loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error && !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Failed to load profile</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={fetchProfile} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) return null

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your personal information</p>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      fetchProfile() // Reset form
                    }}
                    variant="outline"
                    className="hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className={`
                      flex items-center space-x-2 transition-all duration-200 text-white font-medium
                      ${saving 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                      }
                    `}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-6">
          {/* Profile Photo & Basic Info */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Photo */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg ring-4 ring-white">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-20 w-20 text-blue-400" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg transform hover:scale-110">
                        <Camera className="h-4 w-4" />
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900 text-lg">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        profile.is_enabled 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          profile.is_enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`}></div>
                        {profile.is_enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Basic Info Form */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-gray-900 font-medium">{profile.name || "Not provided"}</p>
                        </div>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <p className="text-gray-900 font-medium flex-1">{profile.email}</p>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <p className="text-gray-900 font-medium">{profile.phone || "Not provided"}</p>
                        </div>
                      )}
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{selectedGender.icon}</span>
                              <span className="text-gray-900 font-medium">{selectedGender.label}</span>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                              genderDropdownOpen ? 'rotate-180' : ''
                            }`} />
                          </button>
                          
                          {genderDropdownOpen && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                              {genderOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => handleGenderSelect(option.value)}
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between group ${
                                    formData.gender === option.value ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className="text-lg group-hover:scale-110 transition-transform duration-150">
                                      {option.icon}
                                    </span>
                                    <span className={`font-medium ${
                                      formData.gender === option.value ? 'text-blue-700' : 'text-gray-900'
                                    }`}>
                                      {option.label}
                                    </span>
                                  </div>
                                  {formData.gender === option.value && (
                                    <Check className="h-4 w-4 text-blue-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">
                              {genderOptions.find(g => g.value === profile.profile?.gender)?.icon || '👤'}
                            </span>
                            <p className="text-gray-900 font-medium">
                              {profile.profile?.gender || "Not provided"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birth Date
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
                            max={new Date().toISOString().split('T')[0]}
                          />
                          <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">
                                {formatDate(profile.profile?.birthdate || "")}
                              </p>
                              {profile.profile?.birthdate && profile.profile.birthdate !== "0001-01-01T00:00:00Z" && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Age: {calculateAge(profile.profile.birthdate)} years old
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 resize-none"
                          placeholder="Enter your complete address"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <p className="text-gray-900 font-medium leading-relaxed">
                              {profile.profile?.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                Work Information
              </CardTitle>
              <CardDescription>Your role and department details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-green-900 font-semibold">{profile.role?.name}</p>
                          {profile.role?.description && (
                            <p className="text-sm text-green-700 mt-1">{profile.role.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-blue-900 font-semibold">{profile.department?.name}</p>
                          <p className="text-sm text-blue-700 mt-1">Code: {profile.department?.code}</p>
                          {profile.department?.description && (
                            <p className="text-sm text-blue-700">{profile.department.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Account Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                        profile.is_enabled 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          profile.is_enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`}></div>
                        {profile.is_enabled ? 'Active Account' : 'Inactive Account'}
                      </span>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-gray-900 font-medium">
                            {profile.created_at && profile.created_at !== "0001-01-01T00:00:00Z"
                              ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : "Not available"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {profile.created_at && profile.created_at !== "0001-01-01T00:00:00Z"
                              ? `${Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Section */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                About Me
              </CardTitle>
              <CardDescription>Tell others about yourself</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 resize-none"
                  placeholder="Write something about yourself..."
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[100px]">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {profile.profile?.bio || "No bio provided yet. Click 'Edit Profile' to add information about yourself."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle className="h-5 w-5 mr-2 text-indigo-600" />
                Account Information
              </CardTitle>
              <CardDescription>System-generated account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Created
                  </label>
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-blue-900 font-medium">
                          {profile.profile?.created_at 
                            ? new Date(profile.profile.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : "Not available"}
                        </p>
                        <p className="text-sm text-blue-700">
                          {profile.profile?.created_at 
                            ? new Date(profile.profile.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Updated
                  </label>
                  <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-green-900 font-medium">
                          {profile.profile?.updated_at 
                            ? new Date(profile.profile.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : "Not available"}
                        </p>
                        <p className="text-sm text-green-700">
                          {profile.profile?.updated_at 
                            ? new Date(profile.profile.updated_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 text-red-600">
                  <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="font-medium">Error</p>
                </div>
                <p className="text-red-700 mt-2 ml-7">{error}</p>
                <Button 
                  onClick={() => setError("")} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 ml-7 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {genderDropdownOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setGenderDropdownOpen(false)}
        />
      )}
    </DashboardLayout>
  )
}
