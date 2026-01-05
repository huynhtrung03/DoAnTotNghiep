/* eslint-disable @typescript-eslint/no-explicit-any */

import { BaseApiClient } from './api/BaseApiClient';
import { RoomDetail, RoomInUser, PaginatedResponse } from "../types/types";

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
 * Tao phong moi voi anh (React Native compatible)
 * @param images - Mang cac doi tuong anh tu expo-image-picker
 * @param room - Du lieu phong nhu JSON string hoac object
 */
export async function createRoom(
  images: ImageAsset[] | null,
  room: string | object
) {
  try {
    console.log('🏠 [createRoom] Creating new room...');
    const formData = new FormData();

    // Xu ly anh tu React Native image picker
    if (images && Array.isArray(images)) {
      console.log(`📸 [createRoom] Adding ${images.length} images to formData`);
      images.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          type: image.type || "image/jpeg",
          name: image.name || `image_${index}.jpg`,
        } as any);
      });
    }

    // Xu ly du lieu phong (chuyen object thanh string neu can)
    const roomData = typeof room === "string" ? room : JSON.stringify(room);
    console.log('📝 [createRoom] Room data:', roomData);
    formData.append("room", roomData);

    console.log('🚀 [createRoom] Calling POST /rooms endpoint');
    return await BaseApiClient.uploadFile('/rooms', formData);
  } catch (error: any) {
    console.error("❌ [createRoom] Error creating room:", error);
    throw error;
  }
}

/**
 * Cap nhat phong da co (React Native compatible)
 * @param roomId - ID cua phong can cap nhat
 * @param formData - Doi tuong FormData voi du lieu phong va anh
 */
export async function updateRoom(roomId: string, formData: FormData) {
  try {
    return await BaseApiClient.patchUpload(`/rooms/${roomId}`, formData);
  } catch (error: any) {
    console.error("Loi cap nhat phong:", error);
    throw error;
  }
}

/**
 * Lay cac phong cua chu nha (phan trang)
 * Can xac thuc
 * @param page - So trang (bat dau tu 1)
 * @param size - So luong phong moi trang
 * @param landlordId - ID chu nha (neu co), neu khong co se su dung endpoint cho user hien tai
 */
export async function getRoomsByLandlord(
  page: number,
  size: number,
  landlordId?: string,
  authToken?: string
) {
  try {
    // Neu co landlordId, su dung endpoint v2 (co images)
    if (landlordId) {
      console.log(`📡 [getRoomsByLandlord] Using v2 API with images for landlord: ${landlordId}`);
      // /rooms/v2/by-landlord/{id}/paging
      return await BaseApiClient.get(`/rooms/v2/by-landlord/${landlordId}/paging`, { page, size });
      // return await BaseApiClient.get(`/rooms/by-landlord/${landlordId}/paging`, { page, size });
    }
    
    // Fallback: thay vi endpoint '/landlord/room', su dung endpoint public de lay cac phong vip
    // hoac normal rooms. Tuy nhien, dung chi ra la can landlordId de lay phong cua chu nha hien tai
    console.warn('getLandlordId chua co landlordId, vui long cap landlordId de lay phong');
    
    // Fallback tạm thời - dùng endpoint chung (có thể không chính xác nếu user là tenant)
    // Thay vào đó, nên lấy landlordId từ ProfileService hoặc AuthService
    return await BaseApiClient.get('/rooms/allroom-vip', { page, size });
  } catch (error: any) {
    console.error("Loi lay cac phong cua chu nha:", error);
    return null;
  }
}

/**
 * Cap nhat gia han bai dang phong (VIP post duration)
 * Can xac thuc
 */
export async function updateRoomPostExtend(
  roomId: string,
  postStartDate: string,
  postEndDate: string,
  typepostId: string,
  authToken?: string
) {
  try {
    const data = {
      roomId,
      postStartDate,
      postEndDate,
      typepostId,
    };

    return await BaseApiClient.patch('/rooms/update-post-extend', data);
  } catch (error: any) {
    console.error("Loi cap nhat gia han bai dang phong:", error);
    throw error;
  }
}

/**
 * An hoac hien thi phong
 * @param roomId - ID cua phong
 * @param isHidden - 0 = hien thi, 1 = an
 */
export async function hideShowRoom(
  roomId: string,
  isHidden: number,
  authToken?: string
) {
  try {
    const data = { isHidden };
    return await BaseApiClient.patch(`/rooms/${roomId}/hidden`, data);
  } catch (error: any) {
    console.error("Loi cap nhat trang thai an/hien phong:", error);
    throw error;
  }
}

/**
 * Lay chi tiet phong theo ID
 * Endpoint cong khai - khong can xac thuc
 */
export async function getRoomById(id: string): Promise<RoomDetail | null> {
  try {
    return await BaseApiClient.get<RoomDetail>(`/rooms/${id}`);
  } catch (error: any) {
    console.error("Loi lay chi tiet phong:", error);
    return null;
  }
}

/**
 * Lay cac phong VIP voi trang thai yeu thich cua nguoi dung
 * @param page - So trang
 * @param size - Kich thuoc trang
 * @param userId - ID nguoi dung tuy chon de kiem tra yeu thich
 */
export async function getRoomVipUser(
  page: number,
  size: number,
  userId?: string
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    const params: Record<string, any> = { page, size };
    if (userId) {
      params.userId = userId;
    }

    return await BaseApiClient.get<PaginatedResponse<RoomInUser>>('/rooms/allroom-vip', params);
  } catch (error: any) {
    console.error("Loi lay cac phong VIP:", error);
    return null;
  }
}

/**
 * Lay cac phong thuong voi trang thai yeu thich cua nguoi dung
 * @param page - So trang
 * @param size - Kich thuoc trang
 * @param userId - ID nguoi dung tuy chon de kiem tra yeu thich
 */
export async function getRoomNormalUser(
  page: number,
  size: number,
  userId?: string
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    const params: Record<string, any> = { page, size };
    if (userId) {
      params.userId = userId;
    }

    return await BaseApiClient.get<PaginatedResponse<RoomInUser>>('/rooms/allroom-normal', params);
  } catch (error: any) {
    console.error("Loi lay cac phong thuong:", error);
    return null;
  }
}

/**
 * Lay cac phong VIP sap xep theo khoang cach tu vi tri nguoi dung
 * Cho nguoi dung chua dang nhap
 */
export async function getRoomVipWithLocation(
  page: number,
  size: number,
  latitude?: number,
  longitude?: number
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    const params: Record<string, any> = { page, size };
    if (latitude !== undefined && longitude !== undefined) {
      params.lat = latitude;
      params.lng = longitude;
    }

    const result = await BaseApiClient.get<PaginatedResponse<RoomInUser>>('/rooms/allroom-vip-location', params);
    return result;
  } catch (error: any) {
    console.error("Loi lay cac phong VIP voi vi tri:", error);
    return null;
  }
}

/**
 * Lay cac phong thuong sap xep theo khoang cach tu vi tri nguoi dung
 * Cho nguoi dung chua dang nhap
 */
export async function getRoomNormalWithLocation(
  page: number,
  size: number,
  latitude?: number,
  longitude?: number
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    const params: Record<string, any> = { page, size };
    if (latitude !== undefined && longitude !== undefined) {
      params.lat = latitude;
      params.lng = longitude;
    }

    const result = await BaseApiClient.get<PaginatedResponse<RoomInUser>>('/rooms/allroom-normal-location', params);
    return result;
  } catch (error: any) {
    console.error("Loi lay cac phong thuong voi vi tri:", error);
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
 * Loc cac phong voi tieu chi nang cao
 * @param page - So trang
 * @param size - Kich thuoc trang
 * @param filters - Doi tuong loc voi cac tieu chi
 */
export async function filterRooms(
  page: number,
  size: number,
  filters: Record<string, any>
): Promise<PaginatedResponse<RoomInUser> | null> {
  try {
    return await BaseApiClient.post<PaginatedResponse<RoomInUser>>(`/rooms/filter-rooms?page=${page}&size=${size}`, filters);
  } catch (error: any) {
    console.error("Loi loc cac phong:", error.message);
    return null;
  }
}

/**
 * Lay cac phong duoc dang gan day
 * Endpoint cong khai
 */
export async function getRecentRooms(): Promise<RoomInUser[] | null> {
  try {
    return await BaseApiClient.get<RoomInUser[]>('/rooms/recent-rooms');
  } catch (error: any) {
    console.error("Loi lay cac phong gan day:", error);
    return null;
  }
}

/**
 * Lay thong tin chu nha theo ID phong
 * Su dung boi NotificationService, UserInfoCard component
 * Endpoint cong khai
 */
export async function getLandlordByRoomId(roomId: string) {
  try {
    const landlord = await BaseApiClient.get(`/rooms/landlord-room/${roomId}`) as any;

    // Validate response
    if (!landlord) {
      console.error("Phan hoi landlord la null hoac undefined");
      return null;
    }

    if (!landlord.id) {
      console.error("Canh bao: landlord.id bi thieu! Cau truc phan hoi:", {
        ...landlord,
      });
      // Co gang tim truong thay the co the chua ID
      const possibleIdFields = ['userId', 'ownerId', 'landlordId', 'id'];
      for (const field of possibleIdFields) {
        if (landlord[field]) {
          console.warn(`Su dung truong thay the '${field}' lam ID:`, landlord[field]);
          return { ...landlord, id: landlord[field] };
        }
      }
      return null;
    }

    return landlord;
  } catch (error: any) {
    console.error("Loi lay thong tin chu nha:", error);
    return null;
  }
}

/**
 * Lay cac phong trong ban kinh tren ban do
 * @param lat - Vi do trung tam
 * @param lng - Kinh do trung tam
 * @param radius - Ban kinh theo km
 */
export async function getRoomsInMap(
  lat: number,
  lng: number,
  radius: number
): Promise<RoomInUser[] | null> {
  try {
    const rooms = await BaseApiClient.get<RoomInUser[]>(`/rooms/rooms-in-map?lat=${lat}&lng=${lng}&radius=${radius}`);
    
    // Loc bo cac phong co du lieu dia chi khong hoan chinh de tranh crash
    const validRooms = rooms.filter((room: any) => 
      room && room.address && room.address.ward && room.address.ward.district && room.address.ward.district.province
    );
    
    return validRooms;
  } catch (error: any) {
    console.error("Loi lay cac phong tren ban do:", error);
    return null;
  }
}

/**
 * Lay cac phong trong gioi han ban do (bounding box)
 * @param minLat - Vi do toi thieu (goc Nam-Tay)
 * @param minLng - Kinh do toi thieu (goc Nam-Tay)
 * @param maxLat - Vi do toi da (goc Bac-Dong)
 * @param maxLng - Kinh do toi da (goc Bac-Dong)
 */
export async function getRoomsInBounds(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number
): Promise<RoomInUser[] | null> {
  try {
    return await BaseApiClient.get<RoomInUser[]>(`/rooms/rooms-in-bounds?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}`);
  } catch (error: any) {
    console.error("Loi lay cac phong trong gioi han:", error);
    return null;
  }
}
