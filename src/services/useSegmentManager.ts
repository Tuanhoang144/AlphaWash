"use client";

import { useCallback, useState } from "react";
import api from "@/config/axiosInstance";
import type {
  CustomerSegment,
  SegmentPreview,
  SegmentDashboard,
  CustomerWithSegments,
  SegmentBadge,
} from "@/types/Segment";

export function useSegmentManager() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [customers, setCustomers] = useState<CustomerWithSegments[]>([]);
  const [dashboard, setDashboard] = useState<SegmentDashboard | null>(null);
  const [preview, setPreview] = useState<SegmentPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const getAllSegments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("customer-segments");
      setSegments(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to load segments", e);
      setSegments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSegment = useCallback(async (data: any) => {
    const res = await api.post("customer-segments", data);
    return res.data;
  }, []);

  const updateSegment = useCallback(async (id: number, data: any) => {
    const res = await api.patch(`customer-segments/${id}`, data);
    return res.data;
  }, []);

  const deleteSegment = useCallback(async (id: number) => {
    await api.delete(`customer-segments/${id}`);
  }, []);

  const previewSegment = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post("customer-segments/preview", data);
      const p = res.data;
      const safe = p ? {
        ...p,
        matchCount: p.matchCount ?? 0,
        customers: Array.isArray(p.customers) ? p.customers : [],
      } : null;
      setPreview(safe);
      return safe as SegmentPreview;
    } catch (e) {
      console.error("Failed to preview segment", e);
      setPreview(null);
      return null as unknown as SegmentPreview;
    } finally {
      setLoading(false);
    }
  }, []);

  const recomputeAll = useCallback(async () => {
    await api.post("customer-segments/recompute");
  }, []);

  const getDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("customer-segments/dashboard");
      const d = res.data;
      setDashboard(d ? {
        segments: Array.isArray(d.segments) ? d.segments : [],
        topSpenders: Array.isArray(d.topSpenders) ? d.topSpenders : [],
        atRiskCustomers: Array.isArray(d.atRiskCustomers) ? d.atRiskCustomers : [],
      } : null);
    } catch (e) {
      console.error("Failed to load segment dashboard", e);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomersWithSegments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("customer-segments/customers");
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to load customers with segments", e);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    segments, customers, dashboard, preview, loading,
    getAllSegments, createSegment, updateSegment, deleteSegment,
    previewSegment, recomputeAll, getDashboard, getCustomersWithSegments,
  };
}
