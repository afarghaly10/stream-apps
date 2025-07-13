import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()

    // Forward the request to your backend API
    const response = await fetch("http://localhost:9300/", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
