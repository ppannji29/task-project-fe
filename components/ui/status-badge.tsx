import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  isActive: boolean
  activeText?: string
  inactiveText?: string
  className?: string
}

export function StatusBadge({ 
  isActive, 
  activeText = "Active", 
  inactiveText = "Inactive",
  className 
}: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-all duration-200",
      isActive 
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
        : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
      className
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full mr-2",
        isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"
      )}></div>
      {isActive ? activeText : inactiveText}
    </span>
  )
}