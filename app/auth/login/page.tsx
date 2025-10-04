"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Activity, ArrowRight, Shield, Clock, Check } from 'lucide-react'
import { apiService } from '@/services/api'

interface LoginStep {
  step: 'email' | 'otp' | 'success'
}

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<LoginStep['step']>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  // Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiService.requestOtp(email)
      setSuccess('OTP has been sent to your email!')
      setCurrentStep('otp')
      startCountdown()
    } catch (err: any) {
      console.log(err);
      // const message = err.response?.data?.message || err.message || 'Failed to send OTP'
      const message = err.response.data || 'Failed to request otp. Please Contact Administrator!'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input change dengan paste support
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedValue = value.replace(/\D/g, '').slice(0, 6)
      const newOtp = ['', '', '', '', '', '']
      
      for (let i = 0; i < pastedValue.length && i < 6; i++) {
        newOtp[i] = pastedValue[i]
      }
      
      setOtp(newOtp)
      
      const lastFilledIndex = Math.min(pastedValue.length - 1, 5)
      setTimeout(() => {
        const targetInput = document.getElementById(`otp-${lastFilledIndex}`)
        targetInput?.focus()
      }, 0)
      
      return
    }
    
    // Handle input normal
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  // Handle paste event
  const handleOtpPaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault()
    
    const pastedData = e.clipboardData.getData('text')
    const pastedValue = pastedData.replace(/\D/g, '').slice(0, 6) // Hanya angka, max 6 digit
    
    if (pastedValue.length > 0) {
      const newOtp = ['', '', '', '', '', '']
      
      // fill array OTP with value
      for (let i = 0; i < pastedValue.length && i < 6; i++) {
        newOtp[i] = pastedValue[i]
      }
      
      setOtp(newOtp)
      
      // Show success feedback
      setSuccess(`OTP pasted successfully! (${pastedValue.length} digits)`)
      setTimeout(() => {
        if (success.includes('pasted successfully')) {
          setSuccess('')
        }
      }, 2000)
      
      // Focus ke input terakhir yang terisi
      const lastFilledIndex = Math.min(pastedValue.length - 1, 5)
      setTimeout(() => {
        const targetInput = document.getElementById(`otp-${lastFilledIndex}`)
        targetInput?.focus()
      }, 0)
    }
  }

  // Handle backspace dan navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Jika ada value di current input, hapus value tersebut
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        // Jika tidak ada value, pindah ke input sebelumnya dan hapus valuenya
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        
        const prevInput = document.getElementById(`otp-${index - 1}`)
        prevInput?.focus()
      }
    } else if (e.key === 'Delete') {
      // Handle delete key
      const newOtp = [...otp]
      newOtp[index] = ''
      setOtp(newOtp)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Navigate left
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Navigate right
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) return

    setLoading(true)
    setError('')

    try {
      const response = await apiService.verifyOtp(email, otpString)
      
      // Store user name
      if (response.data.user_auth?.name) {
        localStorage.setItem('userName', response.data.user_auth.name)
        setUserName(response.data.user_auth.name)
      }
      
      // Show success animation
      setCurrentStep('success')
      
      // Show toast and redirect after animation
      setTimeout(() => {
        showWelcomeToast(response.data.user_auth?.name || 'User')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }, 2000)
      
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Invalid OTP'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Show welcome toast
  const showWelcomeToast = (name: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300'
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Welcome back, ${name}!</span>
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

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return
    
    setLoading(true)
    setError('')
    
    try {
      await apiService.requestOtp(email)
      setSuccess('New OTP has been sent!')
      startCountdown()
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to resend OTP'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Countdown timer for resend
  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Go back to email step
  const handleBackToEmail = () => {
    setCurrentStep('email')
    setOtp(['', '', '', '', '', ''])
    setError('')
    setSuccess('')
    setCountdown(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentStep === 'email' && 'Welcome Back'}
            {currentStep === 'otp' && 'Verify OTP'}
            {currentStep === 'success' && 'Login Successful'}
          </h1>
          <p className="text-gray-600 mt-2">
            {currentStep === 'email' && 'Enter your email to receive OTP'}
            {currentStep === 'otp' && 'Enter the OTP sent to your email'}
            {currentStep === 'success' && 'Redirecting to dashboard...'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 'email' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              <Mail className="h-4 w-4" />
            </div>
            <div className={`h-1 w-16 ${
              currentStep === 'otp' || currentStep === 'success' ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 'otp' ? 'bg-blue-600 text-white' : 
              currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              <Shield className="h-4 w-4" />
            </div>
            <div className={`h-1 w-16 ${
              currentStep === 'success' ? 'bg-green-600' : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              <Check className="h-4 w-4" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Email</span>
            <span>OTP</span>
            <span>Success</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="card p-6">
          {/* Success Message */}
          {success && currentStep !== 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Email Step */}
          {currentStep === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Send OTP
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {currentStep === 'otp' && (
            <div className="space-y-4">
              {/* Email Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    OTP sent to: <strong>{email}</strong>
                  </span>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter OTP Code
                  </label>
                  
                  {/* Paste Instructions */}
                  <div className="text-center mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      You can paste the OTP code directly into any box
                    </p>
                  </div>
                  
                  {/* OTP Input Boxes */}
                  <div className="flex justify-center space-x-2 mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={(e) => handleOtpPaste(e, index)}
                        className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none transition-all duration-200 ${
                          digit 
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400'
                        }`}
                        maxLength={1}
                        required
                        autoComplete="off"
                        inputMode="numeric"
                        placeholder="0"
                      />
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </form>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                {countdown > 0 ? (
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Resend in {countdown}s
                  </div>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Back Button */}
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  onClick={handleBackToEmail}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  ← Change Email Address
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="text-center py-8">
              {/* Success Animation */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-pulse">
                <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full animate-bounce">
                  <Check className="h-8 w-8 text-white" />
                </div>
              </div>
              
              {/* Success Message */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-green-600">
                  Verification Successful!
                </h3>
                <p className="text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-900">{userName}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to your dashboard...
                </p>
              </div>

              {/* Loading Progress Bar */}
              <div className="mt-8">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600" style={{
                    width: '100%',
                    animation: 'loading 2s ease-in-out'
                  }}></div>
                </div>
              </div>

              {/* Custom CSS for loading animation */}
              <style jsx>{`
                @keyframes loading {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
              `}</style>
            </div>
          )}
        </div>

        {/* Back to Home */}
        {currentStep !== 'success' && (
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

