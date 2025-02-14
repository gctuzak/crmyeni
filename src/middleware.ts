import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "default-secret"
const secret = new TextEncoder().encode(JWT_SECRET)

export async function middleware(request: NextRequest) {
  console.log("Middleware çalıştı - URL:", request.nextUrl.pathname)
  
  // Public routes - no auth required
  const publicRoutes = ["/sign-in"]
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    console.log("Public route, geçiş izni verildi")
    return NextResponse.next()
  }

  // Check auth token
  const token = request.cookies.get("auth-token")?.value
  console.log("Cookie kontrolü:", token ? "Token bulundu" : "Token bulunamadı")
  
  if (!token) {
    console.log("Token bulunamadı, giriş sayfasına yönlendiriliyor")
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, secret)
    console.log("Token doğrulandı:", payload)

    // Admin only routes
    const adminRoutes = ["/kullanicilar", "/kullanicilar/yonetim"]
    if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      // Rol ID'si 1 veya 2 olan kullanıcılar erişebilir
      if (payload.rolId !== 1 && payload.rolId !== 2) {
        console.log("Yetkisiz erişim, ana sayfaya yönlendiriliyor")
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    console.log("Erişim izni verildi")
    return NextResponse.next()
  } catch (error) {
    // Token is invalid
    console.error("Token geçersiz:", error)
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
} 