"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import type {
  AutoLinkPreview,
  AutoLinkResult,
  DuplicateVehicleGroup,
  MergeLog,
  MergePreviewResult,
  MergeVehicleRequest,
  MergeVehicleResult,
  PlateCheckResult,
} from "@/types/Vehicle";

export function useVehicleService() {
  const { callApi, loading, setIsLoading } = useApiService();

  const checkPlate = useCallback(
    async (plate: string): Promise<PlateCheckResult | null> => {
      if (!plate.trim()) return null;
      try {
        const response = await callApi(
          "get",
          `vehicles/check-plate?plate=${encodeURIComponent(plate)}`
        );
        return response?.data ?? null;
      } catch (error) {
        console.error("Lỗi khi kiểm tra biển số:", error);
        return null;
      }
    },
    [callApi]
  );

  const linkCustomerToVehicle = useCallback(
    async (vehicleId: string, customerId: string) => {
      setIsLoading(true);
      try {
        const response = await callApi(
          "post",
          `vehicles/${vehicleId}/link-customer/${customerId}`
        );
        return response?.data ?? null;
      } catch (error) {
        console.error("Lỗi khi liên kết xe với khách hàng:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const transferVehicleOwnership = useCallback(
    async (vehicleId: string, newCustomerId: string) => {
      setIsLoading(true);
      try {
        const response = await callApi(
          "post",
          `vehicles/${vehicleId}/transfer-ownership/${newCustomerId}`
        );
        return response?.data ?? null;
      } catch (error) {
        console.error("Lỗi khi chuyển quyền sở hữu xe:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const getDuplicateVehicleGroups = useCallback(async (): Promise<
    DuplicateVehicleGroup[]
  > => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "admin/duplicate-vehicles");
      return response?.data ?? [];
    } catch (error) {
      console.error("Lỗi khi tải danh sách xe trùng lặp:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const mergeDuplicateVehicles = useCallback(
    async (payload: MergeVehicleRequest): Promise<MergeVehicleResult | null> => {
      setIsLoading(true);
      try {
        const response = await callApi(
          "post",
          "admin/duplicate-vehicles/merge",
          payload
        );
        return response?.data ?? null;
      } catch (error) {
        console.error("Lỗi khi gộp xe trùng lặp:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const getMergePreview = useCallback(
    async (
      vehicleIds: string[],
      primaryCustomerId?: string | null
    ): Promise<MergePreviewResult> => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("vehicleIds", vehicleIds.join(","));
        if (primaryCustomerId) {
          params.set("primaryCustomerId", primaryCustomerId);
        }
        const response = await callApi(
          "get",
          `admin/duplicate-vehicles/preview?${params.toString()}`
        );
        return response?.data ?? { vehicles: [], totalInvoices: 0, totalHistoryRecords: 0 };
      } catch (error) {
        console.error("Lỗi khi tải bản xem trước gộp xe:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const getMergeLogs = useCallback(async (): Promise<MergeLog[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "admin/duplicate-vehicles/logs");
      return response?.data ?? [];
    } catch (error) {
      console.error("Lỗi khi tải lịch sử gộp xe:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getAutoLinkPreview = useCallback(async (): Promise<AutoLinkPreview> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "admin/auto-link/preview");
      return response?.data ?? { totalUnlinked: 0, safeToLink: 0, conflicts: 0, previewItems: [], conflictItems: [] };
    } catch (error) {
      console.error("Lỗi khi tải preview auto-link:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const executeAutoLink = useCallback(async (): Promise<AutoLinkResult> => {
    setIsLoading(true);
    try {
      const response = await callApi("post", "admin/auto-link/execute");
      return response?.data ?? { linked: 0, skipped: 0, conflicts: 0 };
    } catch (error) {
      console.error("Lỗi khi thực hiện auto-link:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return {
    loading,
    checkPlate,
    linkCustomerToVehicle,
    transferVehicleOwnership,
    getDuplicateVehicleGroups,
    mergeDuplicateVehicles,
    getMergePreview,
    getMergeLogs,
    getAutoLinkPreview,
    executeAutoLink,
  };
}
