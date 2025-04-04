import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { NextResponse } from "next/server"

// Diğer dosyalarda kullanılan JWT_SECRET ile aynı olmasına dikkat edelim
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here"
const secret = new TextEncoder().encode(JWT_SECRET)
const COOKIE_NAME = "auth_token"

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    console.log("Auth check - Token:", token ? "Mevcut" : "Yok")

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify token
    const verified = await jwtVerify(token, secret)
    console.log("Auth check - Token doğrulandı")

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error("Auth kontrolü hatası:", error)
    return NextResponse.json({ authenticated: false })
  }
} 