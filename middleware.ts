import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const config = {
  // Specify the matcher to match all routes except for static files and API routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|auth/error|auth/signin|auth/verify-request|public/).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request })

  // Redirect to login if not authenticated and trying to access protected routes
  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login/patient', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For premium routes, we'll handle the subscription check in the page itself
  // since Prisma doesn't work well with Edge Runtime
  if (token && pathname.startsWith('/dashboard/premium')) {
    // We'll let the page handle the subscription check
    // This is a temporary solution until Prisma has better Edge Runtime support
    return NextResponse.next()
  }

  return NextResponse.next()
}
