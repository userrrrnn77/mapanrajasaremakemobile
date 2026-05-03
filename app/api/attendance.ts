import api from "./_axios";

/**
 * 🔥 TYPES & INTERFACES (FE VERSION)
 */
export type AttendanceType = "masuk" | "keluar" | "sakit";
export type AttendanceStatus =
  | "tepat_waktu"
  | "terlambat"
  | "lembur"
  | "sakit"
  | "izin";
export type ShiftType = "pagi" | "siang" | "malam";

export interface IAttendanceFE {
  _id: string; // Di FE pake string
  user: any; // Bisa string atau object user kalo di-populate
  attendanceDayKey: string;
  type: AttendanceType;
  status: AttendanceStatus;
  shift?: ShiftType;
  checkIn?: string; // Date dikirim sebagai string ISO
  checkOut?: string;
  isIncomplete: boolean;
  workLocation?: string;
  locationSnapshot?: {
    name?: string;
    radiusMeter?: number;
    center?: {
      type: string;
      coordinates: [number, number];
    };
  };
  photo: {
    url: string;
    publicId: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  distanceFromCenter?: number;
  lateMinutes: number;
  penalty: number;
  note: string;
  isOvertime: boolean;
  isBackup: boolean;
  backupUser?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 🔥 API CALLS
 */

// 1. Check-in (Bisa Normal / Backup)
export const checkInReq = async (data: {
  lat: number;
  lng: number;
  shift: ShiftType;
  photo: { url: string; publicId: string };
  note?: string;
  isOvertime?: boolean;
  backupForUserId?: string; // Opsional kalo lagi backup orang
}) => {
  // Kalo ada backupForUserId, tembak endpoint backup
  const endpoint = data.backupForUserId
    ? "/attendance/check-in/backup"
    : "/attendance/check-in";
  const response = await api.post(endpoint, data);
  return response.data;
};

// 2. Check-out
export const checkOutReq = async (data: {
  lat: number;
  lng: number;
  note?: string;
}) => {
  const response = await api.post("/attendance/check-out", data);
  return response.data;
};

// 3. Izin Sakit
export const sickAttendanceReq = async (data: {
  lat: number;
  lng: number;
  photo: { url: string; publicId: string };
  note: string;
}) => {
  const response = await api.post("/attendance/sick", data);
  return response.data;
};

// 4. Riwayat Absen Saya
export const getMyAttendanceReq = async (params?: {
  startDate: string;
  endDate: string;
}) => {
  const response = await api.get("/attendance/my-attendance", { params });
  return response.data;
};
