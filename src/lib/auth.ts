"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { prisma } from "./prisma"
import { AuthorizationError } from "./error"
import * as bcrypt from "bcryptjs"

// Diğer dosyalarda kullanılan JWT_SECRET ile aynı olmasına dikkat edelim
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here"
const secret = new TextEncoder().encode(JWT_SECRET)

// Tüm uygulama için tek bir cookie adı kullanılmalı
const COOKIE_NAME = "auth_token"

// JWT token doğrulama fonksiyonu
export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("JWT doğrulama hatası:", error)
    throw new Error("Token doğrulanamadı")
  }
}

export type AuthUser = {
  id: number
  email: string
  ad: string
  soyad: string
  rolId: number
}

export async function signIn(email: string, password: string) {
  try {
    // Find user
    const user = await prisma.kullanicilar.findUnique({
      where: { email },
      include: { rol: true },
    })

    if (!user) {
      return { error: "Kullanıcı bulunamadı." }
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.sifreHash)
    if (!passwordMatch) {
      return { error: "E-posta veya şifre hatalı." }
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      ad: user.ad,
      soyad: user.soyad,
      rolId: user.rolId
    })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret)

    // Set cookie
    cookies().set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        ad: user.ad,
        soyad: user.soyad,
        rol: user.rol,
      }
    }
  } catch (error) {
    console.error("Giriş işlemi sırasında hata oluştu:", error)
    return { error: "Oturum açma sırasında bir hata oluştu." }
  }
}

export async function signOut() {
  cookies().delete(COOKIE_NAME)
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    
    if (!token) {
      console.log("getSession: Token bulunamadı")
      return null
    }
    
    console.log("getSession: Token bulundu, doğrulanıyor...")
    
    const { payload } = await jwtVerify(token, secret)
    console.log("getSession: Token doğrulandı, içerik:", JSON.stringify(payload))
    
    return {
      id: payload.id as number,
      email: payload.email as string,
      ad: payload.ad as string,
      soyad: payload.soyad as string,
      rolId: payload.rolId as number,
    }
  } catch (error) {
    console.error("getSession: Token doğrulama hatası:", error)
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session) {
    console.log("Oturum bulunamadı - kullanıcı giriş yapmamış")
    return null
  }
  
  try {
    console.log(`Veritabanından kullanıcı bilgileri alınıyor, ID: ${session.id}, Email: ${session.email}`)
    
    // ID ile sorgulama
    const userById = await prisma.kullanicilar.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        ad: true,
        soyad: true,
        rolId: true,
        rol: true
      }
    })
    
    if (!userById) {
      console.error(`ID (${session.id}) ile kullanıcı bulunamadı, e-posta ile deneniyor: ${session.email}`)
      
      // E-posta ile alternatif sorgulama
      const userByEmail = await prisma.kullanicilar.findUnique({
        where: { email: session.email },
        select: {
          id: true,
          email: true,
          ad: true,
          soyad: true,
          rolId: true,
          rol: true
        }
      })
      
      if (!userByEmail) {
        console.error(`E-posta (${session.email}) ile de kullanıcı bulunamadı`)
        
        // Veritabanında kayıtlı tüm kullanıcıları kontrol et (debug amaçlı)
        const allUsers = await prisma.kullanicilar.findMany({
          select: { id: true, email: true }
        })
        
        console.log("Veritabanındaki tüm kullanıcılar:", JSON.stringify(allUsers))
        
        // Token'ı temizle çünkü geçerli bir kullanıcıya ait değil
        await signOut()
        return null
      }
      
      console.log("Kullanıcı e-posta ile bulundu:", userByEmail.email)
      
      // Kullanıcı ID'si ve token ID'si arasında tutarsızlık var
      // E-posta ile bulunan kullanıcıyı döndürelim, ancak bir sonraki istekte
      // doğru ID'yi kullanması için yeni bir token oluşturalım
      await refreshToken({
        id: userByEmail.id,
        email: userByEmail.email,
        ad: userByEmail.ad,
        soyad: userByEmail.soyad,
        rolId: userByEmail.rolId
      })
      
      return userByEmail
    }
    
    console.log("Kullanıcı ID ile başarıyla alındı:", userById.email)
    return userById
  } catch (error) {
    console.error("Kullanıcı bilgileri alınırken hata oluştu:", error)
    return null
  }
}

// Yeni bir token oluşturma fonksiyonu
async function refreshToken(user: AuthUser) {
  try {
    console.log("Token yenileniyor, yeni kullanıcı bilgileri:", JSON.stringify(user))
    
    // Create token
    const token = await new SignJWT(user)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret)
    
    // Set cookie
    const cookieStore = cookies()
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400, // 1 gün
    })
    
    console.log("Yeni token ayarlandı")
    return true
  } catch (error) {
    console.error("Token yenilenirken hata oluştu:", error)
    return false
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new AuthorizationError("Bu işlemi gerçekleştirmek için oturum açmanız gerekiyor.")
  }
  
  return user
}

export async function verifyRole(requiredRoleId: number) {
  const user = await requireAuth()
  
  if (user.rolId !== requiredRoleId) {
    throw new AuthorizationError("Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.")
  }
  
  return user
} 