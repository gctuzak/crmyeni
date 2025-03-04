"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { prisma } from "./prisma"
import { AuthorizationError } from "./error"
import * as bcrypt from "bcrypt"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "gizli-anahtar-degistirin"
)

const COOKIE_NAME = "auth_token"

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
    .sign(JWT_SECRET)

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
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)
  
  if (!token) {
    return null
  }
  
  try {
    const verified = await jwtVerify(token.value, JWT_SECRET)
    return verified.payload as unknown as AuthUser
  } catch (error) {
    console.error("Oturum doğrulama hatası:", error)
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  try {
    const user = await prisma.kullanicilar.findUnique({
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
    
    return user
  } catch (error) {
    console.error("Kullanıcı bilgileri alınırken hata oluştu:", error)
    return null
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