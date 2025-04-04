import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { NextResponse } from "next/server"
import { AuthUser } from "@/lib/auth"

// Diğer dosyalarda kullanılan JWT_SECRET ile aynı olmasına dikkat edelim
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here"
const secret = new TextEncoder().encode(JWT_SECRET)
const COOKIE_NAME = "auth_token"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log(`Giriş denemesi: ${email}`)

    // Find user
    const user = await prisma.kullanicilar.findUnique({
      where: { email },
      include: { rol: true },
    })

    if (!user) {
      console.error(`Kullanıcı bulunamadı: ${email}`)
      return NextResponse.json(
        { message: "Geçersiz e-posta veya şifre" },
        { status: 401 }
      )
    }

    console.log(`Kullanıcı bulundu: ${user.email} (ID: ${user.id})`)

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.sifreHash)

    if (!passwordMatch) {
      console.error(`Şifre eşleşmedi: ${email}`)
      return NextResponse.json(
        { message: "Geçersiz e-posta veya şifre" },
        { status: 401 }
      )
    }

    console.log(`Şifre doğrulandı: ${email}`)

    // Create session data
    const session: AuthUser = {
      id: user.id,
      email: user.email,
      ad: user.ad,
      soyad: user.soyad,
      rolId: user.rolId,
    }

    console.log("Oluşturulacak token içeriği:", JSON.stringify(session))

    // Create token
    const token = await new SignJWT(session)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret)

    console.log(`JWT token oluşturuldu: ${email}`)
    console.log(`Token içeriği:`, session)

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

    console.log(`Cookie ayarlandı: ${email}`)

    return NextResponse.json(
      { 
        message: "Giriş başarılı", 
        user: {
          id: user.id,
          email: user.email,
          ad: user.ad,
          soyad: user.soyad,
          rolId: user.rolId,
          rol: user.rol
        } 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Giriş hatası:", error)
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    )
  }
} 