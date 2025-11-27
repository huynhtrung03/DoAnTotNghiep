/* eslint-disable @typescript-eslint/no-explicit-any */

import { API_URL } from "../config/Constant";
import { RoomDetail, RoomInUser, PaginatedResponse } from "../../types/types";

// TypeScript interfaces for better type safety
export interface Room {
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

export interface ImageAsset {
  uri: string;
  type?: string;
  name?: string;
}

/**
 * Create a new room with images (React Native compatible)
 * @param images - Array of image objects from expo-image-picker
 * @param room - Room data as JSON string or object
 */
export async function createRoom(
  images: ImageAsset[] | null,
  room: string | object
) {
  try {
    const formData = new FormData();

    // Handle images from React Native image picker
    if (images && Array.isArray(images)) {
      images.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          type: image.type || "image/jpeg",
          name: image.name || `image_${index}.jpg`,
        } as any);
      });
    }

    // Handle room data (convert object to string if needed)
    const roomData = typeof room === "string" ? room : JSON.stringify(room);
    formData.append("room", roomData);

    const response = await fetch(`${API_URL}/landlord/room`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to create room");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error creating room:", error);
    throw error;
  }
}

/**
 * Update an existing room (React Native compatible)
 * @param roomId - The ID of the room to update
 * @param formData - FormData object with room data and images
 */
export async function updateRoom(roomId: string, formData: FormData) {
  try {
    // console.log("--- UPDATE ROOM API ---");
    // console.log("roomId:", roomId);
    // console.log("-----------------------");

    const response = await fetch(
      `${API_URL}/landlord/room?roomId=${roomId}`,
      {
        method: "PATCH",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to update room");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error updating room:", error);
    throw error;
  }
}

/**
 * Get rooms by landlord (paginated)
 * Requires authentication
 */
export async function getRoomsByLandlord(
  page: number,
  size: number,
  authToken?: string
) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(
      `${API_URL}/landlord/room?page=${page}&size=${size}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch rooms");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error fetching landlord rooms:", error);
    return null;
  }
}

/**
 * Update room post extension (VIP post duration)
 * Requires authentication
 */
export async function updateRoomPostExtend(
  roomId: string,
  postStartDate: string,
  postEndDate: string,
  typepostId: string,
  authToken?: string
) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}/landlord/room/extend`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        roomId,
        postStartDate,
        postEndDate,
        typepostId,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to update room post");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error updating room post:", error);
    throw error;
  }
}

/**
 * Hide or show a room
 * @param roomId - The ID of the room
 * @param isHidden - 0 = show, 1 = hide
 */
export async function hideShowRoom(
  roomId: string,
  isHidden: number,
  authToken?: string
) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}/landlord/room/hide-show`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ roomId, isHidden }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to update room visibility");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error updating room visibility:", error);
    throw error;
  }
}

/**
 * Get room details by ID
 * Public endpoint - no auth required
 */
export async function getRoomById(id: string): Promise<RoomDetail | null> {
  try {
    // console.log("Fetching room with ID:", id);
    const response = await fetch(`${API_URL}/rooms/${id}`);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch room");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return null;
  }
}

/**
 * Get VIP rooms with user favorite status
 * @param page - Page number
 * @param size - Page size
 * @param userId - Optional user ID to check favorites
 */
export async function getRoomVipUser(
  page: number,
  size: number,
  userId?: string
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    let url = `${API_URL}/rooms/allroom-vip?page=${page}&size=${size}`;
    if (userId) {
      url += `&userId=${userId}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch VIP rooms");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error fetching VIP rooms:", error);
    return null;
  }
}

/**
 * Get normal rooms with user favorite status
 * @param page - Page number
 * @param size - Page size
 * @param userId - Optional user ID to check favorites
 */
export async function getRoomNormalUser(
  page: number,
  size: number,
  userId?: string
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    let url = `${API_URL}/rooms/allroom-normal?page=${page}&size=${size}`;
    if (userId) {
      url += `&userId=${userId}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch normal rooms");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error fetching normal rooms:", error);
    return null;
  }
}

/**
 * Get VIP rooms sorted by distance from user location
 * For users not logged in
 */
export async function getRoomVipWithLocation(
  page: number,
  size: number,
  latitude?: number,
  longitude?: number
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    let url = `${API_URL}/rooms/allroom-vip-location?page=${page}&size=${size}`;
    if (latitude !== undefined && longitude !== undefined) {
      url += `&lat=${latitude}&lng=${longitude}`;
    }

    // console.log("🌍 VIP API Call:", url);
    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || "Failed to fetch VIP rooms with location"
      );
    }

    const result = await response.json();
    // console.log("[HOUSE] VIP API Response:", result);
    return result;
  } catch (error: any) {
    console.error("Error fetching VIP rooms with location:", error);
    return null;
  }
}

/**
 * Get normal rooms sorted by distance from user location
 * For users not logged in
 */
export async function getRoomNormalWithLocation(
  page: number,
  size: number,
  latitude?: number,
  longitude?: number
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    let url = `${API_URL}/rooms/allroom-normal-location?page=${page}&size=${size}`;
    if (latitude !== undefined && longitude !== undefined) {
      url += `&lat=${latitude}&lng=${longitude}`;
    }

    // console.log("🌍 Normal API Call:", url);
    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || "Failed to fetch normal rooms with location"
      );
    }

    const result = await response.json();
    // console.log("[HOUSE] Normal API Response:", result);
    return result;
  } catch (error: any) {
    console.error("Error fetching normal rooms with location:", error);
    return null;
  }
}

/**
 * Smart function - automatically chooses the right API based on user session and location
 * @param page - Page number
 * @param size - Page size
 * @param roomType - "VIP" or "NORMAL"
 * @param userId - Optional user ID (if logged in)
 * @param latitude - Optional user latitude
 * @param longitude - Optional user longitude
 */
export async function getRoomsSmartLocation(
  page: number,
  size: number,
  roomType: "VIP" | "NORMAL" = "VIP",
  userId?: string,
  latitude?: number,
  longitude?: number
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    // If user is logged in, use userId-based API
    if (userId) {
      return roomType === "VIP"
        ? await getRoomVipUser(page, size, userId)
        : await getRoomNormalUser(page, size, userId);
    }

    // If user not logged in but has location, use location-based API
    if (latitude !== undefined && longitude !== undefined) {
      return roomType === "VIP"
        ? await getRoomVipWithLocation(page, size, latitude, longitude)
        : await getRoomNormalWithLocation(page, size, latitude, longitude);
    }

    // Fallback to basic API without any location sorting
    return roomType === "VIP"
      ? await getRoomVipUser(page, size)
      : await getRoomNormalUser(page, size);
  } catch (error: any) {
    console.error("Error in smart room fetching:", error);
    return null;
  }
}

/**
 * Filter rooms with advanced criteria
 * @param page - Page number
 * @param size - Page size
 * @param filters - Filter object with criteria
 */
export async function filterRooms(
  page: number,
  size: number,
  filters: Record<string, any>
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    const response = await fetch(
      `${API_URL}/rooms/filter-rooms?page=${page}&size=${size}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to filter rooms");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error filtering rooms:", error.message);
    return null;
  }
}

/**
 * Get recently posted rooms
 * Public endpoint
 */
export async function getRecentRooms(): Promise<RoomInUser[] | null> {
  try {
    const response = await fetch(`${API_URL}/rooms/recent-rooms`);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch recent rooms");
    }

    return response.json();
  } catch (error: any) {
    console.error("Error fetching recent rooms:", error);
    return null;
  }
}

/**
 * Get landlord details by room ID
 * Used by NotificationService, UserInfoCard component
 * Public endpoint
 */
export async function getLandlordByRoomId(roomId: string) {
  try {
    // console.log("🔍 getLandlordByRoomId called with roomId:", roomId);
    
    const url = `${API_URL}/rooms/landlord-room/${roomId}`;
    // console.log("📡 Fetching from URL:", url);
    
    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();
      console.error("❌ API returned error:", data);
      throw new Error(data.message || "Failed to fetch landlord details");
    }

    const landlord = await response.json();
    
    // console.log("=== DEBUG: getLandlordByRoomId RESPONSE ===");
    // console.log("Full response:", JSON.stringify(landlord, null, 2));
    // console.log("landlord type:", typeof landlord);
    // console.log("landlord.id:", landlord?.id);
    // console.log("landlord.id type:", typeof landlord?.id);
    // console.log("landlord keys:", Object.keys(landlord || {}));
    // console.log("===========================================");

    // ✅ Validate response
    if (!landlord) {
      console.error("❌ Landlord response is null or undefined");
      return null;
    }

    if (!landlord.id) {
      console.error("❌ WARNING: landlord.id is missing! Response structure:", {
        ...landlord,
      });
      // Cố gắng tìm alternative field có thể chứa ID
      const possibleIdFields = ['userId', 'ownerId', 'landlordId', 'id'];
      for (const field of possibleIdFields) {
        if (landlord[field]) {
          console.warn(`⚠️ Using alternative field '${field}' as ID:`, landlord[field]);
          return { ...landlord, id: landlord[field] };
        }
      }
      return null;
    }

    // console.log("✅ Landlord fetched successfully with ID:", landlord.id);
    return landlord;
  } catch (error: any) {
    console.error("🔥 Error fetching landlord details:", error);
    return null;
  }
}

/**
 * Get rooms within a radius on the map
 * @param lat - Center latitude
 * @param lng - Center longitude
 * @param radius - Radius in kilometers
 */
export async function getRoomsInMap(
  lat: number,
  lng: number,
  radius: number
): Promise<RoomInUser[] | null> {
  try {
    const response = await fetch(
      `${API_URL}/rooms/rooms-in-map?lat=${lat}&lng=${lng}&radius=${radius}`
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch rooms in map");
    }

    const rooms = await response.json();
    
    // Filter out rooms with incomplete address data to prevent crashes
    const validRooms = rooms.filter((room: any) => 
      room && room.address && room.address.ward && room.address.ward.district && room.address.ward.district.province
    );
    
    // console.log(`✅ getRoomsInMap: Found ${rooms.length} rooms, ${validRooms.length} valid rooms`);
    
    return validRooms;
  } catch (error: any) {
    console.error("Error fetching rooms in map:", error);
    return null;
  }
}

/**
 * Get rooms within map bounds (bounding box)
 * @param minLat - Minimum latitude (South-West corner)
 * @param minLng - Minimum longitude (South-West corner)
 * @param maxLat - Maximum latitude (North-East corner)
 * @param maxLng - Maximum longitude (North-East corner)
 */
export async function getRoomsInBounds(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number
): Promise<RoomInUser[] | null> {
  try {
    const url = `${API_URL}/rooms/rooms-in-bounds?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}`;
    
    if (__DEV__) {
      // console.log('🌐 API URL:', url);
      // console.log('📍 Bounds params:', { minLat, minLng, maxLat, maxLng });
    }
    
    const response = await fetch(url);

    if (__DEV__) {
      // console.log('📡 Response status:', response.status, response.statusText);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (__DEV__) {
        console.error('❌ API Error Response:', errorText);
      }
      let errorMessage = "Failed to fetch rooms in bounds";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If not JSON, use text
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (__DEV__) {
      // console.log('✅ API Success Response:', Array.isArray(data) ? `Array with ${data.length} items` : typeof data);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error fetching rooms in bounds:", error);
    if (__DEV__) {
      console.error("Error details:", error.message || error);
    }
    return null;
  }
}
