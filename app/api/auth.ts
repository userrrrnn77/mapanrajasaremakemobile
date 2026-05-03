import api from "./_axios";

interface RegisterBody {
  username: string;
  password: string;
  fullname: string;
  phone: string;
  role?: string;
  locationCode: string;
}

interface UpdateMeBody {
  username?: string;
  password?: string;
  profilePhoto?: {
    url: string;
    publicId: string;
  };
}

export const regiterReq = async (data: RegisterBody) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginReq = async (phone: string, password: string) => {
  const response = await api.post("/auth/login", { phone, password });
  return response.data;
};

export const logoutReq = async () => {
  try {
    const response = await api.delete("/auth/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMeReq = async (data: UpdateMeBody) => {
  const response = await api.patch("/auth/me", data);
  return response.data;
};
