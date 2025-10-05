"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { apiService } from "@/services/api"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
}

export default function TaskPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  // Filters
  const [status, setStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const [title, setTitle] = useState("")
  const [sort, setSort] = useState("due_date")
  const [order, setOrder] = useState("desc")

  const fetchTasks = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await apiService.getTaskListing({
        status,
        priority,
        title,
        sort,
        order,
        page,
        limit,
      })
      setTasks(res.data.data || [])
      setTotal(res.data.meta?.total || 0)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to fetch tasks"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [status, priority, title, sort, order, page, limit])

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 items-center mb-6">
            <h1 className="text-2xl font-bold">Task List</h1>
            <div className="text-right">
                <Button
                onClick={() => router.push("/task/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-all"
                >
                Add Task
                </Button>
            </div>
        </div>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="absolute z-[999] bg-white shadow-lg border rounded-md">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In-Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
            </Select>

            <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent className="absolute z-[999] bg-white shadow-lg border rounded-md">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                </SelectContent>
            </Select>

            <Input
                placeholder="Search title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <Select value={order} onValueChange={setOrder}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="absolute z-[999] bg-white shadow-lg border rounded-md">
                    <SelectItem value="desc">Newest</SelectItem>
                    <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
            </Select>

            <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent className="absolute z-[999] bg-white shadow-lg border rounded-md">
                    <SelectItem value="10">Page: 10</SelectItem>
                    <SelectItem value="25">Page: 25</SelectItem>
                    <SelectItem value="50">Page: 50</SelectItem>
                </SelectContent>
            </Select>
            
        </div>

        {/* Task Table */}
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">No tasks found.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{task.description}</p>
                    <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-2 items-center">
                        <strong>Status:</strong>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${task.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            task.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                            task.status === "blocked" ? "bg-red-100 text-red-800" :
                            task.status === "completed" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"}
                        `}>
                            {task.status}
                        </span>

                        <span className="text-xs text-gray-600 flex items-center gap-1">
                            <strong>Priority:</strong>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${task.priority == "low" ? "bg-green-100 text-green-800" :
                                task.priority == "medium" ? "bg-yellow-100 text-yellow-800" :
                                task.priority == "high" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"}
                            `}>
                                {task.priority}
                            </span>
                        </span>

                        <span className="text-xs text-gray-600">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <Button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <Button
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
