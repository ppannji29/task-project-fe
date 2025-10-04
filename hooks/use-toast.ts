"use client"

export function useToast() {
  const success = (message: string) => {
    console.log('✅ Success:', message)
  }

  const error = (message: string) => {
    console.error('❌ Error:', message)
  }

  return {
    success,
    error,
  }
}
