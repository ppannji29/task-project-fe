"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { X, RefreshCw } from "lucide-react"

export function DebugCookies() {
  const [cookies, setCookies] = useState<Record<string, string>>({})
  const [isVisible, setIsVisible] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const updateCookies = () => {
      setCookies({
        access_token: Cookies.get("access_token") || "Not found",
        refresh_token: Cookies.get("refresh_token") || "Not found",
      })
      setLastUpdate(new Date())
    }

    updateCookies()
    const interval = setInterval(updateCookies, 2000) // Update every 2 seconds
    return () => clearInterval(interval)
  }, [])

  const clearCookies = () => {
    Cookies.remove("access_token")
    Cookies.remove("refresh_token")
    setCookies({
      access_token: "Not found",
      refresh_token: "Not found",
    })
  }

  const refreshCookies = () => {
    setCookies({
      access_token: Cookies.get("access_token") || "Not found",
      refresh_token: Cookies.get("refresh_token") || "Not found",
    })
    setLastUpdate(new Date())
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Show Debug Panel"
      >
        🍪
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center">
          🍪 Debug Cookies
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshCookies}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Hide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        {Object.entries(cookies).map(([key, value]) => (
          <div key={key} className="border-b border-gray-700 pb-2">
            <div className="font-semibold text-blue-400">{key}:</div>
            <div className="text-gray-300 break-all">
              {value === "Not found" ? (
                <span className="text-red-400">Not found</span>
              ) : (
                <span className="font-mono">
                  {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
        <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
        <button
          onClick={clearCookies}
          className="text-red-400 hover:text-red-300 transition-colors"
          title="Clear all cookies"
        >
          Clear
        </button>
      </div>
    </div>
  )
}