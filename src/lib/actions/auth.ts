"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here"

const COOKIE_NAME = "auth_token"

export async function signIn(email: string, password: string) {
  try {
    const user = await prisma.kullanicilar.findUnique({
      where: { email },
      include: { rol: true },
    })

    if (!user) {
      return { error: "Kullanıcı bulunamadı" }
    }

    const isValid = await bcrypt.compare(password, user.sifreHash)
    if (!isValid) {
      return { error: "Hatalı şifre" }
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        ad: user.ad,
        soyad: user.soyad,
        rolId: user.rolId 
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    )

    // Set cookie
    cookies().set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 // 1 day
    })

    return { user }
  } catch (error) {
    console.error("Giriş yapılırken hata oluştu:", error)
    return { error: "Giriş yapılırken bir hata oluştu" }
  }
}

export async function signOut() {
  cookies().delete(COOKIE_NAME)
}

export async function getUser() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    if (!token) {
      console.log("getUser: Token bulunamadı")
      return null
    }

    console.log("getUser: Token doğrulanıyor...")
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number
      email: string
      ad: string
      soyad: string
      rolId: number
    }
    console.log("getUser: Token doğrulandı, kullanıcı ID:", decoded.id)

    console.log(`getUser: Veritabanından kullanıcı bilgileri alınıyor, ID: ${decoded.id}`)
    const user = await prisma.kullanicilar.findUnique({
      where: { id: decoded.id },
      include: { rol: true },
    })

    if (!user) {
      console.error(`getUser: Kullanıcı bulunamadı, ID: ${decoded.id}`)
      
      // E-posta ile alternatif sorgulama
      console.log(`getUser: E-posta ile kullanıcı aranıyor: ${decoded.email}`)
      const userByEmail = await prisma.kullanicilar.findUnique({
        where: { email: decoded.email },
        include: { rol: true },
      })
      
      if (!userByEmail) {
        console.error(`getUser: E-posta ile de kullanıcı bulunamadı: ${decoded.email}`)
        return null
      }
      
      console.log(`getUser: Kullanıcı e-posta ile bulundu: ${userByEmail.email} (ID: ${userByEmail.id})`)
      return userByEmail
    }

    console.log(`getUser: Kullanıcı başarıyla bulundu: ${user.email}`)
    return user
  } catch (error) {
    console.error("getUser: Kullanıcı bilgileri alınırken hata oluştu:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error("Bu işlem için yetkiniz yok.")
  }
  return user
} 