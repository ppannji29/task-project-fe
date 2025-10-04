"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiService } from "@/services/api"
import toast from "react-hot-toast"

interface User {
  data: any
  id: number
  email: string
  name?: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  requestOtp: (email: string) => Promise<void>
  refreshUserToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize auth only on client side
  useEffect(() => {
    if (isClient) {
      initializeAuth()
    }
  }, [isClient])

  // Listen for logout events
  useEffect(() => {
    if (isClient) {
      const logout = () => {
        console.log("🔄 Auto logout triggered")
        setUser(null)
        // Simpan current path sebelum redirect ke login
        // if (pathname && pathname !== "/auth/login") {
        //   sessionStorage.setItem("redirectAfterLogin", pathname)
        // }
        router.push("/auth/login")
      }

      window.addEventListener("auth:logout", logout)
      return () => window.removeEventListener("auth:logout", logout)
    }
  }, [isClient, router, pathname])

  const refreshUserToken = async (): Promise<boolean> => {
    try {
      // console.log("🔄 Attempting manual token refresh...")
      
      const response = await apiService.refreshToken("")
      console.log("✅ Manual token refresh successful:", response.data)
      
      // Get updated user info
      const userResponse = await apiService.getCurrentUser()
      console.log("RESPONSE ME: ", userResponse)
      setUser(userResponse.data)
      
      return true
    } catch (error) {
      console.error("❌ Manual token refresh failed:", error)
      return false
    }
  }
  const getRedirectPath = (): string => {
    // Cek apakah ada redirect path yang disimpan
    const savedRedirect = sessionStorage.getItem("redirectAfterLogin")
    
    if (savedRedirect) {
      // Hapus dari sessionStorage setelah digunakan
      sessionStorage.removeItem("redirectAfterLogin")
      
      // Pastikan path valid dan bukan auth page
      if (savedRedirect !== "/auth/login" && savedRedirect !== "/auth/register") {
        return savedRedirect
      }
    }
    
    // Default redirect ke dashboard
    return "/dashboard"
  }

  const initializeAuth = async () => {
    try {
      console.log("🔄 Initializing auth...")
      setLoading(true)
      
      // Try to get current user - cookies akan dikirim otomatis
      try {
        const response = await apiService.getCurrentUser()
        console.log("RESPONSE ME: ", response)
        setUser(response.data)
        
        // Jika user berhasil di-authenticate dan sedang di login page
        if (pathname === "/auth/login") {
          const redirectPath = getRedirectPath()
          console.log("🔄 Redirecting authenticated user to:", redirectPath)
          router.replace(redirectPath)
        }
        
        return
      } catch (error: any) {
        console.log("❌ Current user check failed:", error.response?.status)
        
        // If 401, try refresh token
        if (error.response?.status === 401) {
          console.log("🔄 Trying refresh token...")
          const refreshSuccess = await refreshUserToken()
          if (refreshSuccess) {
            console.log("✅ Successfully refreshed and got user")
            
            // Jika refresh berhasil dan sedang di login page
            if (pathname === "/auth/login") {
              const redirectPath = getRedirectPath()
              console.log("🔄 Redirecting refreshed user to:", redirectPath)
              router.replace(redirectPath)
            }
            
            return
          }
        }
      }
      
      // No valid session
      console.log("❌ No valid session found")
      setUser(null)
      
      // Jika tidak ada session valid dan bukan di auth page, simpan current path
      if (pathname && !pathname.startsWith("/auth") && pathname !== "/") {
        console.log("💾 Saving redirect path:", pathname)
        sessionStorage.setItem("redirectAfterLogin", pathname)
      }
      
    } catch (error) {
      console.error("❌ Auth initialization error:", error)
      setUser(null)
    } finally {
      console.log("✅ Auth initialization completed")
      setLoading(false)
    }
  }

  const requestOtp = async (email: string) => {
    try {
      await apiService.requestOtp(email)
      toast.success("OTP sent to your email!")
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send OTP"
      toast.error(message)
      throw error
    }
  }

  const login = async (email: string, otp: string) => {
    try {
      const response = await apiService.verifyOtp(email, otp)
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.setItem('userName', response.data.user_auth.name)
      localStorage.setItem('userEmail', response.data.user_auth.email)
      
      // Handle different response structures
      let userData = null
      
      if (response.data.user) {
        userData = response.data.user
      } else if (response.data.data) {
        userData = response.data.data.user || response.data.data
      } else {
        userData = response.data
      }

      setUser(userData)
      toast.success(`Welcome!`)
      
      // Navigate to intended page or dashboard
      const redirectPath = getRedirectPath()
      // console.log("🔄 Redirecting after login to:", redirectPath)
      router.push(redirectPath)
      
    } catch (error: any) {
      console.error("❌ Login error:", error)
      const message = error.response?.data?.message || "Invalid OTP"
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout API error:", error)
      toast.success("Logged out successfully")
    } finally {
      // Always clear state - cookies akan dihapus oleh backend
      setUser(null)
      // Hapus redirect path saat logout
      sessionStorage.removeItem("redirectAfterLogin")
      router.push("/auth/login")
    }
  }

  // Don't render anything until client-side
  if (!isClient) {
    return null
  }

  const value = {
    user,
    loading,
    login,
    logout,
    requestOtp,
    refreshUserToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}