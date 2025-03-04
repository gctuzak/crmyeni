import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { NextResponse } from "next/server"

// Auth modülündeki sabit değerlerle aynı olmalı
const JWT_SECRET = process.env.JWT_SECRET || "gizli-anahtar-degistirin"
const secret = new TextEncoder().encode(JWT_SECRET)
const COOKIE_NAME = "auth_token"

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify token
    await jwtVerify(token, secret)

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error("Auth kontrolü hatası:", error)
    return NextResponse.json({ authenticated: false })
  }
} 