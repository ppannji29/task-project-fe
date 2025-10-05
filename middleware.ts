import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// improve public routes:
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public route patterns (support dynamic segments)
  const publicRoutePatterns = [
    /^\/$/,                            // home
    /^\/auth\/(login|register)$/,      // auth pages
    /^\/dashboard$/,                   // dashboard
    /^\/profile$/,                     // profile
    /^\/task\/listing$/,               // task listing
    /^\/task\/create$/,                // task create
    /^\/task\/edit(\/.*)?$/,           // task edit with optional ID
    /^\/task\/view(\/.*)?$/,           // task view with optional ID
  ]

  const isPublicRoute = publicRoutePatterns.some((pattern) => pattern.test(pathname))

  // Check for auth cookies
  const hasAuthCookie =
    request.cookies.has("access_token") ||
    request.cookies.has("refresh_token") ||
    request.cookies.has("token") // fallback

  // Redirect to login if accessing protected route without auth
  if (!hasAuthCookie && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if already logged in and accessing login/register
  if (hasAuthCookie && /^\/auth\/(login|register)$/.test(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
  
//   // Public routes that don't require authentication
//   const publicRoutes = [
//     "/auth/login", 
//     "/auth/register", 
//     "/",
//     "/dashboard",
//     "/profile",
//     "/task/listing",
//     "/task/create",
//     "/task/edit",
//     "/task/view",
//   ]
//   const isPublicRoute = publicRoutes.includes(pathname)
  
//   // Check if user has any auth-related cookies (since we can't read httpOnly cookies)
//   // We'll rely on the auth context to handle the actual authentication
//   const hasAuthCookie = request.cookies.has("access_token") || 
//                        request.cookies.has("refresh_token") ||
//                        request.cookies.has("token") // fallback for different cookie names

//   // If trying to access protected route without any auth cookies
//   if (!hasAuthCookie && !isPublicRoute) {
//     const loginUrl = new URL("/auth/login", request.url)
    
//     // Add the intended destination as a query parameter
//     if (pathname !== "/") {
//       loginUrl.searchParams.set("redirect", pathname)
//     }
    
//     return NextResponse.redirect(loginUrl)
//   }

//   // If has auth cookies and trying to access auth pages, redirect to dashboard
//   if (hasAuthCookie && (pathname === "/auth/login" || pathname === "/auth/register")) {
//     return NextResponse.redirect(new URL("/dashboard", request.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }
