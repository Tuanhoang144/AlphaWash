"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import api from "@/config/axiosInstance";
import { ProductImportPreview, ProductImportResult, ProductImportHistory, ImportMode } from "@/types/ProductImport";

export function useProductImportManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const downloadTemplate = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get("products/import/template", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "product_import_template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  }, []);

  const validateFile = useCallback(async (file: File): Promise<ProductImportPreview | null> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("products/import/validate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data ?? response.data ?? null;
    } catch (error) {
      console.error("Error validating file:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const importProducts = useCallback(async (file: File, mode: ImportMode): Promise<ProductImportResult | null> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post(`products/import?mode=${mode}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data ?? response.data ?? null;
    } catch (error) {
      console.error("Error importing products:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const downloadErrorReport = useCallback(async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("products/import/error-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "import_errors.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading error report:", error);
    }
  }, []);

  const getHistory = useCallback(async (): Promise<ProductImportHistory[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "products/import/history");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getHistoryById = useCallback(async (id: number): Promise<ProductImportHistory | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `products/import/history/${id}`);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return { downloadTemplate, validateFile, importProducts, downloadErrorReport, getHistory, getHistoryById, loading };
}
