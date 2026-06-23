"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import { LoginRequest, LoginResponse } from "@/types/Auth";

export function useAuthManager() {
  const { callApi, loading } = useApiService();

  const login = useCallback(
    async (credentials: LoginRequest): Promise<LoginResponse> => {
      const response = await callApi("post", "auth/login", credentials);
      // API wraps result in { success, message, data: { token, ... } }
      return response.data;
    },
    [callApi]
  );

  return { login, loading };
}
