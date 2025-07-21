"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import { Employee } from "@/types/Employee";

export function useEmployeeManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAllEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "employee/");
      return response?.data ?? [];
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  // ✅ GET: Lấy nhân viên theo ID
  const getEmployeeById = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `employee/${id}`);
      return response?.data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const insertEmployee = useCallback(async (employee: Omit<Employee, "id">) => {
    setIsLoading(true);
    try {
      const response = await callApi("post", "employee/insert", employee);
      return response?.data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const updateEmployee = useCallback(async (id: number, updatedData: Partial<Employee>) => {
    setIsLoading(true);
    try {
      const response = await callApi("patch", `employee/update/${id}`, updatedData);
      return response?.data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return {
    getAllEmployees,
    getEmployeeById,
    insertEmployee,
    updateEmployee,
    loading,
  };
}
