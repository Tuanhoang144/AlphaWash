// File: lib/api.ts
import { api } from "./mock";

export const getServices = async () => {
  const response = await api.get("/services");
  return response.data;
};

export const createOrUpdateService = async (payload: {
  serviceTypeCode: string;
  serviceCode: string;
  duration: string;
  size: string;
  price: number;
  note?: string;
}) => {
  const response = await api.post("/services", payload);
  return response.data;
};
