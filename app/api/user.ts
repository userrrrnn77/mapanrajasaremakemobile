import api from "./_axios";

export interface createUser {
  username: string;
  fullname: string;
  phone: string;
  password: string;
  role: string;
  assignedWorkLocations: string[];
}

export interface userAssignment {
  role?: string;
  assignedWorkLocations?: string[] | string;
  password?: string;
}

export const createUserReq = async (data: createUser) => {
  const response = await api.post("/user", data);
  return response.data;
};

export const getAllUserReq = () => api.get("/user");
export const getMyProfile = () => api.get("/user/me");

export const getUserByIdReq = (id: string) => api.get(`/user/${id}`);

export const updateUserStatusReq = async (id: string, status: string) => {
  const response = await api.patch(`/user/${id}/status`, status);
  return response.data;
};

export const getDashboardStatsReq = async () => {
  const response = await api.get("/user/dashboard");
  return response.data;
};

export const getMyTimelineReq = async () => {
  const response = await api.get("/user/my-timeline");
  return response.data;
};

export const updateUserAssignmentReq = async (
  id: string,
  data: userAssignment,
) => {
  const response = await api.patch(`/user/${id}/role`, data);
  return response.data;
};

export const verifyUserReq = async (id: string) => {
  const response = await api.patch(`/user/verify/${id}`);
  return response.data;
};

export const deleteUserReq = (id: string) => api.delete(`/user/${id}`);
