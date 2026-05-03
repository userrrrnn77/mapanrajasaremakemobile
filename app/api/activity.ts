import api from "./_axios";

export interface CreateActivityBody {
  title?: string;
  lat: string;
  lng: string;
  address?: string;

  documentation: {
    photo: {
      url: string;
      publicId: string;
    };
    caption: string;
  }[];
}

export const createActivityReq = async (data: CreateActivityBody) => {
  const response = await api.post("/activity", data);
  return response.data;
};

export const myActivityReq = () => api.get("/activity/me");

export const getAllActivityReq = () => api.get("/activity");
