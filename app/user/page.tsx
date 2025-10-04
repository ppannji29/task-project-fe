"use client"

import { useEffect, useState, useRef } from "react"
import { apiService } from "@/services/api"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react"

interface UserWithProfile {
  user_id: string
  name: string
  email: string
  phone: string
  role: { name: string }
  department: { name: string }
  profile: {
    gender: string
    birthdate: string
    address: string
    photo: string
    bio: string
  }
  is_enabled: boolean
  created_at: string
}

interface UserListInnerData {
    data: UserWithProfile[];
    total: number;
    page: number;
    limit: number;
    total_pages: number; 
}

interface UserListResponse {
    success: boolean;
    message: string;
    data: UserListInnerData;
}

export default function UserListPage() {
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Fetch user data
  const fetchUsers = async (params?: { page?: number, limit?: number, keyword?: string }) => {
    setLoading(true)
    setError("")
    try {
        const response = await apiService.getUsers({
            page: params?.page ?? page,
            limit: params?.limit ?? limit,
            keyword: params?.keyword ?? (keyword.length >= 3 ? keyword : ""),
        });
        const res: UserListResponse = response.data;
        setUsers(res.data.data)
        setTotal(res.data.total)
        setTotalPages(res.data.total_pages)
        setPage(res.data.page)
    } catch (err: any) {
        setError(err.message || "Failed to fetch users")
    } finally {
        setLoading(false)
    }
  }

  // Fetch on mount and whenever page/limit/keyword changes
  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line
  }, [page, limit, keyword])

  // Search effect (debounce)
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      if (searchValue.length === 0 || searchValue.length >= 3) {
        setKeyword(searchValue)
        setPage(1)
      }
    }, 400)
    // eslint-disable-next-line
  }, [searchValue])

  // Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage)
  }
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  function formatBirthdate(birthdate?: string) {
    if (
      !birthdate ||
      birthdate === "0001-01-01T00:00:00Z" ||
      birthdate === "0000-00-00T00:00:00Z"
    ) {
      return "Not set";
    }
    const date = new Date(birthdate);
    if (isNaN(date.getTime())) return "Not set";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 text-blue-700 mr-2" />
              Users
            </h1>
            <p className="text-gray-600">Manage your users here</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <Input
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search by name or email..."
              className="w-64 border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-xl"
            />
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold"
              onClick={() => router.push("/user/create")}
            >
              + Add User
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Birthdate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 inline-block"></span>
                    <span className="ml-2 text-blue-700">Loading...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-red-600 text-center py-6">{error}</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-gray-500 text-center py-6">No users found.</td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.user_id} className="hover:bg-blue-50 transition-colors duration-100">
                    <td className="px-6 py-2 text-sm text-gray-700">{(page-1)*limit + idx + 1}</td>
                    <td className="px-6 py-2 text-sm text-gray-900 flex items-center space-x-2">
                      {user.profile?.photo ? (
                        <img src={user.profile.photo} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <span className="h-8 w-8 bg-gray-100 rounded-full inline-flex items-center justify-center text-gray-400 ring-1 ring-gray-300">
                          <Users className="h-5 w-5" />
                        </span>
                      )}
                      <span>{user.name}</span>
                    </td>
                    <td className="px-6 py-2 text-sm text-blue-700">
                        {user.email}
                        {user.is_enabled ? (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            ● Active
                            </span>
                        ) : (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                            ● Inactive
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-2 text-sm text-green-600">{user.role?.name}</td>
                    <td className="px-6 py-2 text-sm text-indigo-600">{user.department?.name}</td>
                    <td className="px-6 py-2 text-sm">{user.profile?.gender}</td>
                    {/* <td className="px-6 py-2 text-sm">{user.profile?.birthdate ? new Date(user.profile.birthdate).toLocaleDateString() : "-"}</td> */}
                    <td className="px-6 py-2 text-sm">{formatBirthdate(user.profile?.birthdate)}</td>
                    <td className="px-6 py-2 text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-gray-600 text-sm">
            Showing {(page-1)*limit + 1}-{Math.min(page*limit, total)} of {total} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-sm px-2">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}