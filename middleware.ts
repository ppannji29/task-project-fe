import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/login", 
    "/auth/register", 
    "/",
    "/dashboard",
    "/dashboard/users",
    "/dashboard/users/create",
    "/dashboard/temporary",
  ]
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Check if user has any auth-related cookies (since we can't read httpOnly cookies)
  // We'll rely on the auth context to handle the actual authentication
  const hasAuthCookie = request.cookies.has("access_token") || 
                       request.cookies.has("refresh_token") ||
                       request.cookies.has("token") // fallback for different cookie names

  // If trying to access protected route without any auth cookies
  if (!hasAuthCookie && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url)
    
    // Add the intended destination as a query parameter
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname)
    }
    
    return NextResponse.redirect(loginUrl)
  }

  // If has auth cookies and trying to access auth pages, redirect to dashboard
  if (hasAuthCookie && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
