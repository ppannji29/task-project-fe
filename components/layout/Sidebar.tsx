"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  User, 
  Users, 
  Home, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  BarChart3,
  UserCircle
} from 'lucide-react'

interface SidebarProps {
  onLogout: () => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  isMobile: boolean
  currentUser?: any
}

export default function Sidebar({ onLogout, isOpen, onToggle, onClose, isMobile, currentUser }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard"
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
      active: pathname === "/profile"
    },
    {
      title: "Task",
      icon: FileText,
      href: "/task/listing",
      active: pathname === "/task"
    },
    // {
    //   title: "Users",
    //   icon: Users,
    //   href: "/user",
    //   active: pathname === "/user"
    // },
    // {
    //   title: "Reports",
    //   icon: FileText,
    //   href: "/reports",
    //   active: pathname === "/reports"
    // },
    // {
    //   title: "Analytics",
    //   icon: BarChart3,
    //   href: "/analytics",
    //   active: pathname === "/analytics"
    // }
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    // Close sidebar on mobile after navigation
    if (isMobile) {
      onClose()
    }
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!currentUser) return "User"
    if (currentUser.name) return currentUser.name
    if (currentUser.email) return currentUser.email.split('@')[0]
    return "User"
  }

  return (
    <div className={`bg-white shadow-lg h-full flex flex-col ${
      isMobile ? 'w-80' : isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {(isOpen || isMobile) && (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Task System</h1>
                <p className="text-xs text-gray-500">Management Portal</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {(isOpen || isMobile) ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile Section - hanya tampil jika sidebar terbuka */}
      {(isOpen || isMobile) && currentUser && (
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser.email}
              </p>
              {currentUser.role?.name && (
                <p className="text-xs text-blue-600 font-medium">
                  {currentUser.role.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.title}
              onClick={() => handleNavigation(item.href)}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start transition-all duration-200 ${
                (!isOpen && !isMobile) ? 'px-2' : 'px-3'
              } ${
                item.active 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={(!isOpen && !isMobile) ? item.title : undefined}
            >
              <item.icon className={`h-4 w-4 ${
                (!isOpen && !isMobile) ? '' : 'mr-3'
              } ${item.active ? 'text-white' : ''}`} />
              {(isOpen || isMobile) && <span>{item.title}</span>}
            </Button>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          onClick={() => handleNavigation('/settings')}
          variant="ghost"
          className={`w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 ${
            (!isOpen && !isMobile) ? 'px-2' : 'px-3'
          }`}
          title={(!isOpen && !isMobile) ? "Settings" : undefined}
        >
          <Settings className={`h-4 w-4 ${
            (!isOpen && !isMobile) ? '' : 'mr-3'
          }`} />
          {(isOpen || isMobile) && <span>Settings</span>}
        </Button>
        
        <Button
          onClick={onLogout}
          variant="ghost"
          className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 ${
            (!isOpen && !isMobile) ? 'px-2' : 'px-3'
          }`}
          title={(!isOpen && !isMobile) ? "Logout" : undefined}
        >
          <LogOut className={`h-4 w-4 ${
            (!isOpen && !isMobile) ? '' : 'mr-3'
          }`} />
          {(isOpen || isMobile) && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
