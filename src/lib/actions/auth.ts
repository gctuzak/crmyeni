"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "default-secret"

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
        rolId: user.rolId 
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    )

    // Set cookie
    cookies().set("auth-token", token, {
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
  cookies().delete("auth-token")
}

export async function getUser() {
  try {
    const token = cookies().get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number
      email: string
      rolId: number
    }

    const user = await prisma.kullanicilar.findUnique({
      where: { id: decoded.id },
      include: { rol: true },
    })

    return user
  } catch (error) {
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