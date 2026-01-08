
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/services/Constant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, userId } = body;

    if (!roomId) {
      return NextResponse.json(
        { message: "Room ID is required" },
        { status: 400 }
      );
    }

    let url = `${API_URL}/rooms/${roomId}/track-view`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    // console.log("Tracking view:", url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Backend error:", errorData);
      return NextResponse.json(
        { message: "Failed to track view from backend" },
        { status: res.status }
      );
    }
    
    // Backend text response: "Tracked view successfully"
    const data = await res.text(); 
    return NextResponse.json(data);
  } catch (error) {
    console.error("Track view error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
