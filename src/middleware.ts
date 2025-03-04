import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "default-secret"
const secret = new TextEncoder().encode(JWT_SECRET)

// NextResponse'un serializer'ını Decimal objelerini düzgün serileştirmek için override edelim
const originalJson = NextResponse.json;
NextResponse.json = function (...args: Parameters<typeof originalJson>) {
  // Decimal objelerini düzenleyen özel serileştirici
  const customSerializer = (key: string, value: any) => {
    // Decimal objesi kontrol (Prisma), 'd', 'e' ve 's' özellikleri varsa
    if (value && typeof value === 'object' && 
      ('d' in value || 'e' in value || 's' in value) && 
      typeof value.toString === 'function') {
      return Number(value.toString());
    }
    
    return value;
  };
  
  // İlk argüman datadır, eğer JSON.stringify kullanılacaksa özel serileştiriciyi ekle
  if (args.length > 0 && typeof args[0] === 'object') {
    args[1] = {
      ...args[1],
      headers: {
        ...args[1]?.headers,
        'content-type': 'application/json'
      }
    };
  }
  
  // Orijinal fonksiyon çağrısı
  return originalJson.apply(null, args);
} as typeof NextResponse.json;

export async function middleware(request: NextRequest) {
  console.log("Middleware çalıştı - URL:", request.nextUrl.pathname)
  
  // Public routes - no auth required
  const publicRoutes = ["/sign-in"]
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    console.log("Public route, geçiş izni verildi")
    return NextResponse.next()
  }

  // Check auth token
  const token = request.cookies.get("auth_token")?.value
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