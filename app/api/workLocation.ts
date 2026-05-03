import api from "./_axios";

export type WorkRole =
  | "security"
  | "cleaning_service"
  | "customer_service"
  | "gardener"
  | "street";

export interface ShiftTime {
  hour: number;
  minute: number;
  endHour: number;
  endMinute: number;
}

export interface IWorkLocationFE {
  _id: string;
  code: string;
  role: WorkRole;
  name: string;
  center: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  radiusMeter: number;
  isActive: boolean;
  shiftConfigs: {
    weekday: { pagi: ShiftTime; siang: ShiftTime; malam: ShiftTime };
    weekend: { pagi: ShiftTime; siang: ShiftTime; malam: ShiftTime };
  };
  createdAt?: string;
}

/**
 * 🔥 API CALLS
 */

export const getAllLocationsReq = async (): Promise<{
  success: boolean;
  data: IWorkLocationFE[];
}> => {
  const response = await api.get("/worklocation");
  return response.data;
};

export const createLocationReq = async (data: any) => {
  const response = await api.post("/worklocation", data);
  return response.data;
};

export const updateLocationReq = async (id: string, data: any) => {
  const response = await api.patch(`/worklocation/${id}`, data);
  return response.data;
};

export const deleteLocationReq = async (id: string) => {
  const response = await api.delete(`/worklocation/${id}`);
  return response.data;
};
