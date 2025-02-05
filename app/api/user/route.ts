import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      name: session.user.name,
      userType: session.user.type,
    })
  } catch (error) {
    console.error("Error in /api/user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

