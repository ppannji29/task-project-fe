"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { apiService } from "@/services/api"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateTaskPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("2025-10-10")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    setLoading(true)
    setError("")
    try {
        await apiService.createTask({
            title,
            description,
            status,
            priority,
            due_date: new Date(dueDate).toISOString(),
        })
        showMessage(title)
        router.push("/task/listing")
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create task"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (name: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300'
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Success to create task, ${name}!</span>
      </div>
    `
    document.body.appendChild(toast)
  
    setTimeout(() => {
      toast.classList.remove('translate-x-full')
    }, 100)
  
    setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }  

  return (
    <DashboardLayout>
        <div className="flex justify-center px-4 py-6">

            <Card className="w-full max-w-xl shadow-md border rounded-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Create New Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <Input placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Input placeholder="Enter task description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="absolute z-[999] bg-white shadow-lg border rounded-md">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In-Progress</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="absolute z-[999] bg-white shadow-lg border rounded-md">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div>
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                    onClick={handleCreate}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-all"
                    >
                    {loading ? "Creating..." : "Create Task"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    </DashboardLayout>
  )
}
