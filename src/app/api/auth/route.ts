import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcrypt"
import { SignJWT } from "jose"
import { NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "default-secret"
const secret = new TextEncoder().encode(JWT_SECRET)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("Giriş isteği alındı:", { email })

    const user = await prisma.kullanicilar.findUnique({
      where: { email },
      include: { rol: true },
    })

    console.log("Kullanıcı sorgusu sonucu:", user ? "Bulundu" : "Bulunamadı")

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.sifreHash)
    console.log("Şifre kontrolü:", isValid ? "Başarılı" : "Başarısız")

    if (!isValid) {
      return NextResponse.json({ error: "Hatalı şifre" }, { status: 401 })
    }

    // Create JWT token
    const token = await new SignJWT({ 
      id: user.id,
      email: user.email,
      rolId: user.rolId 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)

    console.log("JWT token oluşturuldu")

    // Create response
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ad: user.ad,
        soyad: user.soyad,
        rolId: user.rolId,
        rol: user.rol
      }
    })

    // Set cookie in response
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 // 1 day
    })

    console.log("Cookie ayarlandı")
    console.log("Başarılı yanıt gönderiliyor")
    
    return response
  } catch (error) {
    console.error("Giriş yapılırken hata oluştu:", error)
    return NextResponse.json(
      { error: "Giriş yapılırken bir hata oluştu" },
      { status: 500 }
    )
  }
} 