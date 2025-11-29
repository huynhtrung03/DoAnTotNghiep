/**
 * Rental History Types
 */

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface RentalData {
  key: string; // bookingId
  name_landlord: string;
  phone_landlord: string;
  room: string;
  idRoom: string;
  address: string;
  rentalDate: string;
  expires: string;
  tenants: number;
  price: string;
  status: number;
  isRemoved?: number;
  userId?: string | number;
  imageProof?: string;
}

export enum BookingStatus {
  PENDING = 0,
  CONFIRMED = 1,
  CANCELLED = 2,
  REJECTED = 3,
  RENTING = 4,
}

export interface BookingResponse {
  bookingId: string;
  status: number;
  rentalDate: string;
  rentalExpires: string;
  tenantCount: number;
  isRemoved: number;
  imageProof?: string;
  room: {
    roomId: string;
    title: string;
    ownerName: string;
    ownerPhone: string;
    priceMonth: number;
    address: {
      street: string;
      ward: {
        name: string;
        district: {
          name: string;
          province: {
            name: string;
          };
        };
      };
    };
  };
}

export interface PaginatedBookingResponse {
  bookings: BookingResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface RequestModalProps {
  visible: boolean;
  roomId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface PaymentModalProps {
  visible: boolean;
  bookingId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface ImageViewModalProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

export interface RentalHistoryItemProps {
  item: RentalData;
  onPressRequest: (roomId: string) => void;
  onPressPayment: (bookingId: string) => void;
  onSelectPaymentMethod?: (bookingId: string, method: PaymentMethod) => void;
  onPressImage: (imageUrl: string) => void;
  onPressRoomDetail: (roomId: string) => void;
}

export interface FilterOptions {
  status?: BookingStatus;
  dateFrom?: Date;
  dateTo?: Date;
}
