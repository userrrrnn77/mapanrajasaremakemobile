import api from "./_axios";

export interface IReportFE {
  _id?: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[]; // URL Cloudinary hasil upload tadi
  source?: "mobile" | "web" | "system";
  priority?: "low" | "medium" | "high";
  status?: "open" | "in_progress" | "resolved" | "rejected";
  createdAt?: string;
}

export interface GetReportsResponse {
  success: boolean;
  data: IReportFE[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

/**
 * 🔥 API CALLS
 */

// 1. Kirim Laporan Baru
export const createReportReq = async (data: IReportFE) => {
  const response = await api.post("/reports", data);
  return response.data;
};

// 2. Ambil Semua Laporan (Admin Only)
export const getAllReportsReq = async (
  page = 1,
  limit = 10,
): Promise<GetReportsResponse> => {
  const response = await api.get("/reports", {
    params: { page, limit },
  });
  return response.data;
};
