"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { apiService } from "@/services/api"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

type StatusChange = {
  type: string
  action: string
  from: string
  to: string
  changed_at: string
  changed_by: string
  changed_by_email: string
}

type TaskDetail = {
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  status_history: StatusChange[]
}

export default function ViewTaskPage() {
  const { id } = useParams()
  const router = useRouter()
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("milestone")

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await apiService.getTaskById(id as string)
        setTask(res.data)
      } catch (err) {
        setError("Failed to load task")
      }
    }
    if (id) fetchTask()
  }, [id])

  if (error) return (
    <DashboardLayout>
      <p className="text-red-500 px-6 py-4">{error}</p>
    </DashboardLayout>
  )

  if (!task) return (
    <DashboardLayout>
      <p className="text-gray-500 px-6 py-4">Loading task...</p>
    </DashboardLayout>
  )

  const milestones = task.status_history
    .filter((s) => s.type === "status" || s.type === "")
    .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-green-700"
      case "pending":
        return "bg-yellow-500 text-yellow-700"
      case "in-progress":
        return "bg-blue-500 text-blue-700"
      case "blocked":
        return "bg-red-500 text-red-700"
      default:
        return "bg-gray-400 text-gray-700"
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6 px-6 py-8 justify-center">
        {/* small card in left */}
        <Card className="w-full md:w-64 h-fit border shadow-sm">
          <CardHeader className="relative">
            <CardTitle className="text-lg font-semibold">Task Info</CardTitle>
          </CardHeader>

          <CardContent className="text-sm space-y-2 text-gray-700">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        {/* big card in the right with tabs */}
        <Card className="flex-1 border shadow-md">
          
          <CardHeader className="relative">
            <CardTitle className="text-lg font-semibold">Task History</CardTitle>

            {/* Floating Button Container */}
            <div className="absolute top-0 right-0 mt-1 mr-1 flex gap-2">
              <Button
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 text-sm font-medium"
                onClick={() => router.push(`/task/edit/${id}`)}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-2 text-sm font-medium"
                  >
                    🗑️ Delete
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-white text-gray-800 border border-gray-200 shadow-xl rounded-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold text-gray-900">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-gray-600">
                      This action will permanently delete the task. You cannot undo this.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-end gap-2 mt-4">
                    <AlertDialogCancel className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 font-medium"
                      onClick={() => {
                        apiService.deleteTask(id as string)
                          .then(() => router.push("/task/listing"))
                          .catch(() => alert("Failed to delete task"))
                      }}
                    >
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          {/*  */}
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 border-b border-gray-200">
              <TabsTrigger
                value="milestone"
                className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-semibold"
              >
                Milestone
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-semibold"
              >
                Audit Trail
              </TabsTrigger>
            </TabsList>

              {/* Milestone Tab */}
              <TabsContent value="milestone">
                {milestones.length === 0 ? (
                  <p className="text-gray-500 text-sm">No status milestones found.</p>
                ) : (
                  <div className="relative border-l-2 border-gray-300 pl-4">
                    {milestones.map((m, i) => {
                      const colorClass = getStatusColor(m.to)
                      return (
                        <div key={i} className="mb-6 relative">
                          <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full ${colorClass.split(" ")[0]} border-2 border-white shadow-md`}></div>
                          <div className="ml-2">
                            <p className={`text-sm font-semibold ${colorClass.split(" ")[1]}`}>Status: {m.to}</p>
                            <p className="text-xs text-gray-600">{m.action}</p>
                            <p className="text-xs text-gray-500">From: {m.from} → To: {m.to}</p>
                            <p className="text-[10px] text-gray-400">{new Date(m.changed_at).toLocaleString()}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Audit Trail Tab */}
              <TabsContent value="audit">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Changed At</TableHead>
                        <TableHead>Changed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {task.status_history.map((entry, i) => (
                        <TableRow key={i}>
                          <TableCell>{entry.type || "-"}</TableCell>
                          <TableCell>{entry.action || "-"}</TableCell>
                          <TableCell>{entry.from || "-"}</TableCell>
                          <TableCell>{entry.to || "-"}</TableCell>
                          <TableCell>{new Date(entry.changed_at).toLocaleString()}</TableCell>
                          <TableCell>{entry.changed_by_email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
