"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"

export default function DebugPage() {
  const { user, loading } = useAuth()
  const [cookies, setCookies] = useState<string>("")
  const [localStorage, setLocalStorage] = useState<string>("")

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie)
    
    // Get localStorage (if any)
    const storage = Object.keys(window.localStorage).map(key => 
      `${key}: ${window.localStorage.getItem(key)}`
    ).join(", ")
    setLocalStorage(storage)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Auth State</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify({ user, loading }, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Cookies</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {cookies || "No cookies found"}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Specific Cookies</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              access_token: {Cookies.get("access_token") || "not found"}
              {"\n"}refresh_token: {Cookies.get("refresh_token") || "not found"}
              {"\n"}token: {Cookies.get("token") || "not found"}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Local Storage</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {localStorage || "No localStorage items"}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Current URL</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {typeof window !== "undefined" ? window.location.href : "Server side"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}