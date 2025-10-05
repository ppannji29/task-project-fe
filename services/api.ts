import axios from "axios"
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // const token = Cookies.get("access_token")
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
          withCredentials: true
        })
        
        // Handle different response formats
        const newAccessToken = response.data.access_token || response.data.token
        const newRefreshToken = response.data.refresh_token
        
        if (newAccessToken) {
          // Update cookies
          Cookies.set("access_token", newAccessToken)
          if (newRefreshToken) {
            Cookies.set("refresh_token", newRefreshToken)
          }

          // Update the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          // Process queued requests
          processQueue(null, newAccessToken)
          return apiClient(originalRequest)
        }
      } catch (refreshError: any) {
        console.error("❌ Token refresh failed:", refreshError)
        
        Cookies.remove("access_token")
        Cookies.remove("refresh_token")
        
        // Process queued requests with error
        processQueue(refreshError, null)
        
        // Trigger logout event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export const apiService = {
  healthCheck: () => apiClient.get("/"),

  // authentication request
  requestOtp: (email: string) => apiClient.post("/api/auth/request-otp", { email }),
  verifyOtp: (email: string, otp: string) => apiClient.post("/api/auth/verify-otp", { email, otp }),
  refreshToken: () => apiClient.post("/api/auth/refresh", {}, { withCredentials: true }),
  logout: () => apiClient.delete("/api/auth/logout"),
  // get me
  getCurrentUser: () => apiClient.get("/api/user/me", { withCredentials: true }),

  // task request
  getTaskListing: (params?: {
    status?: string
    priority?: string
    title?: string
    sort?: string
    order?: string
    page?: number
    limit?: number
  }) => {
    const query = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined && val !== null) query.append(key, String(val))
    })
    return apiClient.get(`/api/tasks?${query.toString()}`)
  },
  createTask: (data: {
    title: string
    description: string
    status: string
    priority: string
    due_date: string
  }) => apiClient.post("/api/task", data),
}
