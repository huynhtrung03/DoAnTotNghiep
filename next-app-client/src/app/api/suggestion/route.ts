import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/services/Constant";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "UserId is required" },
      { status: 400 }
    );
  }

  try {
    // Forward request to Spring Boot backend
    // Backend API: http://localhost:3333/api/test/get-similarity?userId={uuid}
    // API_URL is "http://localhost:3333/api"
    const backendUrl = new URL(`${API_URL}/test/get-similarity`);
    backendUrl.searchParams.append("userId", userId);
    
    // Use fetch instead of axios
    const response = await fetch(backendUrl.toString());

    if (!response.ok) {
       const errorText = await response.text();
       return NextResponse.json(
        { error: errorText || `Backend responded with status ${response.status}` },
        { status: response.status }
       );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error forwarding request to backend:", error.message);
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
