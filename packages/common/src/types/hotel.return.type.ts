// shared-types/src/types.ts

export enum RoomType {
  ACROOM = "ACROOM",
  NOACROOM = "NOACROOM",
}

export enum Roles {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface Hotel {
  id: string;
  img: string;
  name: string;
  address: string;
  contact: number;
  isArchive: boolean;
  email: string;
  // rooms: Room[];
  // reviews: Review[];
}

export interface Review {
  id: string;
  comment?: string;
  star: number;
  hotelId: string;
  hotel: Hotel;
}

export interface Room {
  id: string;
  img: string[];
  roomType: RoomType.ACROOM | RoomType.NOACROOM;
  isBooked: boolean;
  hotelId: string;
  hotel: Hotel;
  bookings: Booking[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  isActive: boolean;
  isArchive: boolean;
  roles: Roles[];
  created_by: string;
  updated_by: string;
  bookings: Booking[];
}

export interface Booking {
  id: string;
  userId: string;
  user: User;
  roomId: string;
  room: Room;
  checkIn: Date;
  checkOut: Date;
}

export interface Auth {
  id: string;
  email: string;
  otp: string;
}
