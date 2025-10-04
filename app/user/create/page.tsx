"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/services/api"
import { Button } from "@/components/ui/button"
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
  ChevronDown,
  Check,
  FileText,
  Briefcase,
  UserCircle,
} from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Role {
  role_id: number
  name: string
}
interface Department {
  department_id: number
  name: string
  code: string
}

export default function CreateUserPage() {
  const router = useRouter()
//   const { success, error: toastError } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [success, setSuccess] = useState('')
  const [error, setError] = useState("")
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role_id: 0,
    department_id: 0,
    is_enabled: true, // Tambahan
    profile: {
        address: "",
        photo: "",
        bio: "",
        birthdate: "",
        gender: "Male"
    }
  })

  // Gender options with icons
  const genderOptions = [
    { value: "Male", label: "Male", icon: "👨" },
    { value: "Female", label: "Female", icon: "👩" }
  ]

  // Fetch roles & departments
  useEffect(() => {
    setDepartments([
      { department_id: 1, name: "IT Development", code: "IT" },
      { department_id: 2, name: "Finance", code: "FI" },
      { department_id: 3, name: "Sales & Distribution", code: "SD" },
      { department_id: 4, name: "Human Resources", code: "HR" },
      { department_id: 5, name: "Purchasing", code: "PO" },
    ])
    // Jika roles tetap dari API:
    setRoles([
        { role_id: 3, name: "BOD" },
        { role_id: 4, name: "Leader" },
        { role_id: 5, name: "Staff" },
        { role_id: 6, name: "Viewer" },
    ])
  }, [])

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name in formData.profile) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Handle role/department select
  const handleRoleSelect = (role_id: number) => {
    setFormData(prev => ({
      ...prev,
      role_id
    }))
    setRoleDropdownOpen(false)
  }
  const handleDeptSelect = (department_id: number) => {
    setFormData(prev => ({
      ...prev,
      department_id
    }))
    setDeptDropdownOpen(false)
  }

  // Handle gender selection
  const handleGenderSelect = (gender: string) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        gender
      }
    }))
    setGenderDropdownOpen(false)
  }

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large! Please select an image smaller than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        setError("Invalid file type! Please select an image file")
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string)
        setFormData(prev => ({
          ...prev,
          profile: { ...prev.profile, photo: ev.target?.result as string }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateUser = async () => {
    setSaving(true)
    setSuccess("")
    setError("")
    try {
        //Set FormData
        const formDataObj = new FormData()
        formDataObj.append("name", formData.name)
        formDataObj.append("email", formData.email)
        formDataObj.append("gender", formData.profile.gender)
        formDataObj.append("department_id", String(formData.department_id))
        formDataObj.append("role_id", String(formData.role_id))

        // Optional fields
        if (formData.phone) {
        formDataObj.append("phone", formData.phone)
        }
        formDataObj.append("is_enabled", formData.is_enabled ? "1" : "0")

        if (formData.profile.address) {
        formDataObj.append("address", formData.profile.address)
        }
        if (formData.profile.bio) {
        formDataObj.append("bio", formData.profile.bio)
        }
        if (formData.profile.birthdate) {
        formDataObj.append(
            "birthdate",
            new Date(formData.profile.birthdate).toISOString()
        )
        }

        // Photo (ambil file asli, bukan base64)
        if (photoInputRef.current?.files?.[0]) {
        formDataObj.append("photo", photoInputRef.current.files[0])
        }
  
        // call API
        await apiService.createUserForm(formDataObj)
  
        setSuccess("User created successfully!")
        showMessage(formData.name)
        router.push("/user")
    } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Failed to create user"
        setError(`Create failed: ${message}`)
    } finally {
      setSaving(false)
    }
  }
  
  // Show message toast
  const showMessage = (name: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300'
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Success to create user, ${name}!</span>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full')
    }, 100)
    
    // Animate out and remove
    setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600">Fill in user information below</p>
        </div>

        <div className="space-y-6">
          {/* Personal Info */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic user information</CardDescription>
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
                    <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg transform hover:scale-110">
                      <Camera className="h-4 w-4" />
                      <input
                        ref={photoInputRef}
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
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
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                        placeholder="Enter full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                        placeholder="Enter email address"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                        placeholder="Enter phone number"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">
                              {genderOptions.find(opt => opt.value === formData.profile.gender)?.icon}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {genderOptions.find(opt => opt.value === formData.profile.gender)?.label}
                            </span>
                          </div>
                          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                            genderDropdownOpen ? 'rotate-180' : ''
                          }`} />
                        </button>
                        {genderDropdownOpen && (
                          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                            {genderOptions.map(option => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleGenderSelect(option.value)}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between group ${
                                  formData.profile.gender === option.value ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg group-hover:scale-110 transition-transform duration-150">
                                    {option.icon}
                                  </span>
                                  <span className={`font-medium ${
                                    formData.profile.gender === option.value ? 'text-blue-700' : 'text-gray-900'
                                  }`}>
                                    {option.label}
                                  </span>
                                </div>
                                {formData.profile.gender === option.value && (
                                  <Check className="h-4 w-4 text-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birth Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="birthdate"
                          value={formData.profile.birthdate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
                          max={new Date().toISOString().split('T')[0]}
                        />
                        <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.profile.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 resize-none"
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Info */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                Work Information
              </CardTitle>
              <CardDescription>User role and department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white hover:border-gray-400 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="text-green-900 font-semibold">
                          {roles.find(r => r.role_id === formData.role_id)?.name || "Select Role"}
                        </span>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                        roleDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {roleDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {roles.map(role => (
                          <button
                            key={role.role_id}
                            type="button"
                            onClick={() => handleRoleSelect(role.role_id)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center group ${
                              formData.role_id === role.role_id ? 'bg-green-50 border-l-4 border-green-500' : ''
                            }`}
                          >
                            <span className={`font-medium ${
                              formData.role_id === role.role_id ? 'text-green-700' : 'text-gray-900'
                            }`}>
                              {role.name}
                            </span>
                            {formData.role_id === role.role_id && (
                              <Check className="h-4 w-4 text-green-600 ml-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {roles.find(r => r.role_id === formData.role_id)?.name && (
                    <p className="text-sm text-green-700 mt-1">
                      {roles.find(r => r.role_id === formData.role_id)?.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-900 font-semibold">
                          {departments.find(d => d.department_id === formData.department_id)?.name || "Select Department"}
                        </span>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                        deptDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {deptDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {departments.map(dept => (
                          <button
                            key={dept.department_id}
                            type="button"
                            onClick={() => handleDeptSelect(dept.department_id)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center group ${
                              formData.department_id === dept.department_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <span className={`font-medium ${
                              formData.department_id === dept.department_id ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {dept.name}
                            </span>
                            {formData.department_id === dept.department_id && (
                              <Check className="h-4 w-4 text-blue-600 ml-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {departments.find(d => d.department_id === formData.department_id)?.code && (
                    <p className="text-sm text-blue-700 mt-1">
                      {departments.find(d => d.department_id === formData.department_id)?.code}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Section */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                About User
              </CardTitle>
              <CardDescription>Short bio for this user</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                name="bio"
                value={formData.profile.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 resize-none"
                placeholder="Write something about this user..."
              />
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleCreateUser}
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
                  <span>Create User</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Click outside to close dropdowns */}
        {(genderDropdownOpen || roleDropdownOpen || deptDropdownOpen) && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => {
              setGenderDropdownOpen(false)
              setRoleDropdownOpen(false)
              setDeptDropdownOpen(false)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}