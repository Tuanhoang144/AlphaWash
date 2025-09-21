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
    } catch (error : any) {
        console.error("Lỗi khi lấy tất cả thông tin nhân viên:", error);

        if (error.response?.status === 400 && error.response?.data?.message) {
          const serverMessage = error.response.data.message;
          const customError = new Error(serverMessage);
          customError.name = 'BadRequest';
          throw customError;
        }
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getEmployeeById = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `employee/${id}`);
      return response?.data;
    } catch (error : any) {
        console.error("Lỗi khi lấy thông tin nhân viên:", error);

        if (error.response?.status === 400 && error.response?.data?.message) {
          const serverMessage = error.response.data.message;
          const customError = new Error(serverMessage);
          customError.name = 'BadRequest';
          throw customError;
        }
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const insertEmployee = useCallback(
    async (employee: Omit<Employee, "id">) => {
      setIsLoading(true);
      try {
        const response = await callApi("post", "employee/insert", employee);
        return response;
      } catch (error : any) {
        console.error("Lỗi khi tạo mới nhân viên:", error);

        if (error.response?.status === 400 && error.response?.data?.message) {
          const serverMessage = error.response.data.message;
          const customError = new Error(serverMessage);
          customError.name = 'BadRequest';
          throw customError;
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const updateEmployee = useCallback(
    async (id: number, updatedData: Partial<Employee>) => {
      setIsLoading(true);
      try {
        const response = await callApi(
          "patch",
          `employee/update/${id}`,
          updatedData
        );
        return response;
      } catch (error: any) {
        console.error("Lỗi khi cập nhật nhân viên:", error);

        if (error.response?.status === 400 && error.response?.data?.message) {
          const serverMessage = error.response.data.message;
          const customError = new Error(serverMessage);
          customError.name = 'BadRequest';
          throw customError;
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  return {
    getAllEmployees,
    getEmployeeById,
    insertEmployee,
    updateEmployee,
    loading,
  };
}
