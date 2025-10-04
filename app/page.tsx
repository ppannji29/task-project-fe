"use client"

import { useRouter } from 'next/navigation'
import { Activity, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Task Simple Project
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track, review, and approve in just a few clicks.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="btn btn-primary text-lg px-8 py-3 inline-flex items-center"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}