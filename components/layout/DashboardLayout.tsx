"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, Activity, User } from 'lucide-react'
import Sidebar from './Sidebar'
import { apiService } from '@/services/api'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default false untuk mobile
  const [isMobile, setIsMobile] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
      // Auto close sidebar on mobile when resizing
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    checkAuth()
    
    // Listen for logout events from API interceptor
    const handleLogout = () => {
      setIsAuthenticated(false)
      router.push('/auth/login')
    }

    window.addEventListener('auth:logout', handleLogout)
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [router])

  const checkAuth = async () => {
    try {
      // Try to get current user to verify authentication
      const response = await apiService.getCurrentUser()
      setCurrentUser(response.data.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      await apiService.logout()
      
      // Show logout toast
      showLogoutToast()
      
      // Redirect after toast animation
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
      
    } catch (error) {
      console.error("Logout error:", error)
      // Show error toast but still redirect
      showErrorToast("Logout failed, but you'll be redirected anyway")
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!currentUser) return "User"
    if (currentUser.name) return currentUser.name
    if (currentUser.email) return currentUser.email.split('@')[0]
    return "User"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  // Add toast functions
  const showLogoutToast = () => {
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300'
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
        <div>
          <p class="font-medium">You have been logged out</p>
          <p class="text-sm opacity-90">Redirecting to login page...</p>
        </div>
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
    }, 1500)
  }

  const showErrorToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300'
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p class="font-medium">Logout Error</p>
          <p class="text-sm opacity-90">${message}</p>
        </div>
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
    }, 1500)
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Header - hanya tampil di mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between z-30 lg:hidden">
          <div className="flex items-center space-x-3">
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Task System</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                {getUserDisplayName()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : `relative transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`
        }
      `}>
        <Sidebar 
          onLogout={handleLogout} 
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onClose={closeSidebar}
          isMobile={isMobile}
          currentUser={currentUser}
        />
      </div>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${
        isMobile ? 'pt-16' : '' // Add padding top for mobile header
      }`}>
        {children}
      </main>
    </div>
  )
}
