# Test-Project Frontend

A Next.js frontend application

## Features

- OTP-based authentication
- User management dashboard
- Protected routes with middleware
- Responsive design with Tailwind CSS
- API integration with Go backend

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
Create a `.env.local` file with:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/user/me` - Get current user
- `GET /api/users` - Get all users
- `GET /api/users/detail` - Get user by ID

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios for API calls
- js-cookie for cookie management
