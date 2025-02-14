import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "default-secret"
const secret = new TextEncoder().encode(JWT_SECRET)

export async function GET() {
  try {
    const token = cookies().get("auth-token")?.value

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