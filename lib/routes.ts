export const ROUTES = {
    // Public Routes
    HOME: '/',
    
    // Auth Routes
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    
    // Dashboard Routes
    DASHBOARD: '/dashboard',
    DASHBOARD_TEMPORARY: '/dashboard/temporary',
    DASHBOARD_USERS: '/dashboard/user',
    DASHBOARD_USERS_CREATE: '/dashboard/user/create',
    DASHBOARD_SETTINGS: '/dashboard/settings',
    DASHBOARD_REPORTS: '/dashboard/reports',
    DASHBOARD_PROFILE: '/dashboard/profile',
  } as const
  
  export type RouteType = typeof ROUTES[keyof typeof ROUTES]
  
  export interface RouteConfig {
    path: string
    title: string
    description?: string
    protected: boolean
    icon?: string
    showInNav?: boolean
    group?: string
  }
  
  export const ROUTE_CONFIG: Record<string, RouteConfig> = {
    HOME: {
      path: ROUTES.HOME,
      title: 'Home',
      description: 'Welcome to Task Project System',
      protected: false,
      icon: 'Home',
      showInNav: false,
    },
    DASHBOARD: {
      path: ROUTES.DASHBOARD,
      title: 'Dashboard',
      description: 'Main dashboard overview',
      protected: true,
      icon: 'LayoutDashboard',
      showInNav: true,
      group: 'main',
    },
    DASHBOARD_TEMPORARY: {
      path: ROUTES.DASHBOARD_TEMPORARY,
      title: 'Responsive View',
      description: 'Modern responsive dashboard layout',
      protected: true,
      icon: 'Monitor',
      showInNav: true,
      group: 'main',
    },
    DASHBOARD_USERS: {
      path: ROUTES.DASHBOARD_USERS,
      title: 'Users',
      description: 'Manage system users',
      protected: true,
      icon: 'Users',
      showInNav: true,
      group: 'management',
    },
    DASHBOARD_REPORTS: {
      path: ROUTES.DASHBOARD_REPORTS,
      title: 'Reports',
      description: 'Generate and view reports',
      protected: true,
      icon: 'FileText',
      showInNav: true,
      group: 'management',
    },
    DASHBOARD_SETTINGS: {
      path: ROUTES.DASHBOARD_SETTINGS,
      title: 'Settings',
      description: 'System configuration',
      protected: true,
      icon: 'Settings',
      showInNav: true,
      group: 'system',
    },
    DASHBOARD_PROFILE: {
      path: ROUTES.DASHBOARD_PROFILE,
      title: 'Profile',
      description: 'User profile settings',
      protected: true,
      icon: 'User',
      showInNav: true,
      group: 'system',
    },
    AUTH_LOGIN: {
      path: ROUTES.AUTH_LOGIN,
      title: 'Login',
      description: 'Sign in to your account',
      protected: false,
      icon: 'LogIn',
      showInNav: false,
    },
    AUTH_REGISTER: {
      path: ROUTES.AUTH_REGISTER,
      title: 'Register',
      description: 'Create new account',
      protected: false,
      icon: 'UserPlus',
      showInNav: false,
    },
  }
  
  // Helper functions
  export const getRoutesByGroup = (group: string) => {
    return Object.values(ROUTE_CONFIG).filter(route => route.group === group)
  }
  
  export const getNavigationRoutes = () => {
    return Object.values(ROUTE_CONFIG).filter(route => route.showInNav)
  }
  
  export const getProtectedRoutes = () => {
    return Object.values(ROUTE_CONFIG).filter(route => route.protected).map(route => route.path)
  }
  