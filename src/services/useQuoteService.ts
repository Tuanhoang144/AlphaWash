"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import type { Quote, QuotePage, QuoteStatus } from "@/types/Quote";

export function useQuoteService() {
  const { callApi, loading } = useApiService();

  const getQuotes = useCallback(
    async (params?: { page?: number; size?: number; search?: string; status?: string }) => {
      const qs: string[] = [];
      if (params?.page !== undefined) qs.push(`page=${params.page}`);
      if (params?.size !== undefined) qs.push(`size=${params.size}`);
      if (params?.search) qs.push(`search=${encodeURIComponent(params.search)}`);
      if (params?.status) qs.push(`status=${params.status}`);
      const url = `quotes${qs.length ? `?${qs.join("&")}` : ""}`;
      const response = await callApi("get", url);
      return response?.data as QuotePage;
    },
    [callApi]
  );

  const getQuoteById = useCallback(
    async (id: string) => {
      const response = await callApi("get", `quotes/${id}`);
      return response?.data as Quote;
    },
    [callApi]
  );

  const createQuote = useCallback(
    async (data: Omit<Quote, "id" | "quoteCode">) => {
      const response = await callApi("post", "quotes", data);
      return response?.data as Quote;
    },
    [callApi]
  );

  const updateQuote = useCallback(
    async (id: string, data: Partial<Quote>) => {
      const response = await callApi("put", `quotes/${id}`, data);
      return response?.data as Quote;
    },
    [callApi]
  );

  const updateQuoteStatus = useCallback(
    async (id: string, status: QuoteStatus) => {
      const response = await callApi("put", `quotes/${id}/status`, { status });
      return response?.data as Quote;
    },
    [callApi]
  );

  const deleteQuote = useCallback(
    async (id: string) => {
      await callApi("delete", `quotes/${id}`);
    },
    [callApi]
  );

  const searchCustomers = useCallback(
    async (search: string) => {
      if (!search.trim()) return [];
      const response = await callApi(
        "get",
        `customer/list?search=${encodeURIComponent(search)}&page=0&size=10`
      );
      // API returns ApiResponse<PageResponse<CustomerListItem>>
      // callApi unwraps ApiResponse → response.data is PageResponse
      // Need .content to get the actual array
      return response?.data?.content ?? [];
    },
    [callApi]
  );

  return {
    loading,
    getQuotes,
    getQuoteById,
    createQuote,
    updateQuote,
    updateQuoteStatus,
    deleteQuote,
    searchCustomers,
  };
}
