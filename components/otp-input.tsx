"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  length: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function OtpInput({ length, value, onChange, disabled, className }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  useEffect(() => {
    // Update internal state when value prop changes
    const otpArray = value.split("").slice(0, length)
    while (otpArray.length < length) {
      otpArray.push("")
    }
    setOtp(otpArray)
  }, [value, length])

  const handleChange = (index: number, digit: string) => {
    if (disabled) return

    // Only allow single digits and letters
    if (digit.length > 1) return
    if (!/^[a-zA-Z0-9]*$/.test(digit)) return

    const newOtp = [...otp]
    newOtp[index] = digit.toUpperCase()
    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
        onChange(newOtp.join(""))
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
        onChange(newOtp.join(""))
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").toUpperCase()
    const pastedArray = pastedData.split("").slice(0, length)
    
    const newOtp = Array(length).fill("")
    pastedArray.forEach((char, index) => {
      if (/^[a-zA-Z0-9]$/.test(char)) {
        newOtp[index] = char
      }
    })
    
    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(val => val === "")
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) {
              inputRefs.current[index] = el
            }
          }}
          type="text"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-all duration-200",
            digit ? "border-blue-500 bg-blue-50" : "border-gray-300",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100",
            "hover:border-blue-400"
          )}
          maxLength={1}
          autoComplete="off"
        />
      ))}    </div>
  )
}