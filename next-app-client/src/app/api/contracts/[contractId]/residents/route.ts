/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { NextRequest, NextResponse } from 'next/server';

// GET /api/contracts/[contractId]/residents - Get all residents for a contract
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contractId } = await params;
    
    // Gọi API backend lấy danh sách residents by landlord
    const res = await fetch(`${API_URL}/temporary-residences/landlord/${session.user.id}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Fetch residents failed" }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch residents' },
      { status: 500 }
    );
  }
}

// POST /api/contracts/[contractId]/residents - Create new resident
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contractId } = await params;

    // Lấy dữ liệu multipart từ request gửi từ frontend
    const formData = await req.formData();

    // Lấy data - có thể là File (từ blob) hoặc string
    const dataInput = formData.get("data");
    if (!dataInput) {
      return NextResponse.json(
        { error: "Missing resident data" },
        { status: 400 }
      );
    }

    // Xử lý data tùy theo kiểu
    let residentData;
    if (dataInput instanceof File) {
      // Nếu là File (blob từ ResidentService)
      const text = await dataInput.text();
      residentData = JSON.parse(text);
    } else {
      // Nếu là string
      residentData = JSON.parse(dataInput as string);
    }
    
    residentData.contractId = contractId; // thêm contractId cho chắc

    // Validate required fields
    if (!residentData.fullName || residentData.fullName.trim() === "") {
      return NextResponse.json(
        { error: "fullName is required" },
        { status: 400 }
      );
    }

    if (!residentData.idNumber || residentData.idNumber.trim() === "") {
      return NextResponse.json(
        { error: "idNumber is required" },
        { status: 400 }
      );
    }

    if (!residentData.relationship) {
      return NextResponse.json(
        { error: "relationship is required" },
        { status: 400 }
      );
    }

    if (!residentData.startDate || !residentData.endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(residentData.startDate)) {
      return NextResponse.json(
        { error: "startDate must be YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    if (!dateRegex.test(residentData.endDate)) {
      return NextResponse.json(
        { error: "endDate must be YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Validate date logic
    const startDate = new Date(residentData.startDate);
    const endDate = new Date(residentData.endDate);
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "endDate must be after startDate" },
        { status: 400 }
      );
    }
    const backendFormData = new FormData();

    // Gửi data dưới dạng Blob JSON để Spring Boot parse được
    const residentBlob = new Blob([JSON.stringify(residentData)], {
      type: "application/json",
    });
    backendFormData.append("data", residentBlob, "data.json");

    // Gửi ảnh nếu có
    const frontImage = formData.get("frontImage") as File | null;
    const backImage = formData.get("backImage") as File | null;

    if (frontImage) backendFormData.append("frontImage", frontImage);
    if (backImage) backendFormData.append("backImage", backImage);

    // Gọi Spring Boot API với Authentication
    const backendResponse = await fetch(
      `${API_URL}/temporary-residences`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.user.accessToken}`,
        },
        body: backendFormData,
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error status:", backendResponse.status);
      console.error("Backend error response:", errorText);
      console.error("Request data sent:", {
        fullName: residentData.fullName,
        idNumber: residentData.idNumber,
        relationship: residentData.relationship,
        startDate: residentData.startDate,
        endDate: residentData.endDate,
        contractId: residentData.contractId,
        hasImages: { frontImage: !!frontImage, backImage: !!backImage }
      });
      return NextResponse.json(
        { 
          error: "Failed to create resident",
          details: errorText,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

