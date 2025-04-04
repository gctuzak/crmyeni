import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { verifyJwtToken } from "./lib/auth"

// JWT_SECRET'ı diğer dosyalarla tutarlı olacak şekilde tanımlayalım
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here"
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

  // Token kontrolü ve doğrulama
  const token = request.cookies.get("auth_token")?.value
  
  if (token) {
    try {
      console.log("Cookie kontrolü: Token bulundu")
      const decoded = await verifyJwtToken(token)
      console.log("Token doğrulandı:", decoded)
      
      // Eğer /sign-in sayfasına gidiliyorsa ve kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
      if (request.nextUrl.pathname === "/sign-in") {
        console.log("Kullanıcı giriş yapmış ve sign-in sayfasını açmaya çalışıyor, ana sayfaya yönlendiriliyor")
        return NextResponse.redirect(new URL("/", request.url))
      }
      
      // Admin only routes
      const adminRoutes = ["/kullanicilar", "/kullanicilar/yonetim"]
      if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        // Rol ID'si 1 veya 2 olan kullanıcılar erişebilir
        if (decoded.rolId !== 1 && decoded.rolId !== 2) {
          console.log("Yetkisiz erişim, ana sayfaya yönlendiriliyor")
          return NextResponse.redirect(new URL("/", request.url))
        }
      }
      
      console.log("Erişim izni verildi")
      return NextResponse.next()
    } catch (error) {
      console.error("Token doğrulaması başarısız:", error)
      
      // Token geçersizse çerezi temizle
      const response = NextResponse.redirect(new URL("/sign-in", request.url))
      response.cookies.delete("auth_token")
      console.log("Geçersiz token temizlendi")
      return response
    }
  }

  // Token bulunamadı, giriş sayfasına yönlendiriliyor
  console.log("Token bulunamadı, giriş sayfasına yönlendiriliyor")
  const response = NextResponse.redirect(new URL("/sign-in", request.url))
  response.cookies.delete("auth_token")
  return response
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
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
} 