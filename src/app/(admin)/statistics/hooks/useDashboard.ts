"use client";

import { useCallback, useState } from "react";
import api from "@/config/axiosInstance";
import type { DashboardData, DateRange } from "../types/dashboard";

const EMPTY_GOAL = { target: 0, current: 0, percentage: 0, remaining: 0, daysLeft: 0 };

function normalize(raw: any): DashboardData {
  const d = raw ?? {};
  const kpi = d.kpiSummary ?? {};
  const rev = d.revenueDashboard ?? {};
  const prof = d.profitDashboard ?? {};
  const svc = d.servicePerformance ?? {};
  const cust = d.customerAnalytics ?? {};
  const ws = d.workshopOperations ?? {};
  const fin = d.financialHealth ?? {};
  const goals = d.businessGoals ?? {};

  return {
    kpiSummary: {
      todayRevenue: kpi.todayRevenue ?? 0,
      yesterdayRevenue: kpi.yesterdayRevenue ?? 0,
      periodRevenue: kpi.periodRevenue ?? 0,
      comparePeriodRevenue: kpi.comparePeriodRevenue ?? 0,
      periodProfit: kpi.periodProfit ?? 0,
      comparePeriodProfit: kpi.comparePeriodProfit ?? 0,
      periodCost: kpi.periodCost ?? 0,
      periodInvoices: kpi.periodInvoices ?? 0,
      comparePeriodInvoices: kpi.comparePeriodInvoices ?? 0,
      periodVehicles: kpi.periodVehicles ?? 0,
      comparePeriodVehicles: kpi.comparePeriodVehicles ?? 0,
      avgInvoiceValue: kpi.avgInvoiceValue ?? 0,
      compareAvgInvoiceValue: kpi.compareAvgInvoiceValue ?? 0,
      profitMargin: kpi.profitMargin ?? 0,
      compareProfitMargin: kpi.compareProfitMargin ?? 0,
      revenueSparkline: kpi.revenueSparkline ?? [],
    },
    revenueDashboard: {
      revenueByDay: rev.revenueByDay ?? [],
      revenueByMonth: rev.revenueByMonth ?? [],
      revenueByCategory: rev.revenueByCategory ?? [],
      revenueByPaymentMethod: rev.revenueByPaymentMethod ?? [],
      revenueByEmployee: rev.revenueByEmployee ?? [],
    },
    profitDashboard: {
      totalRevenue: prof.totalRevenue ?? 0,
      serviceRevenue: prof.serviceRevenue ?? 0,
      productRevenue: prof.productRevenue ?? 0,
      totalCost: prof.totalCost ?? 0,
      grossProfit: prof.grossProfit ?? 0,
      profitMargin: prof.profitMargin ?? 0,
      tipTotal: prof.tipTotal ?? 0,
    },
    servicePerformance: {
      topByCount: svc.topByCount ?? [],
      topByRevenue: svc.topByRevenue ?? [],
      categoryDistribution: svc.categoryDistribution ?? [],
      productAttachRate: svc.productAttachRate ?? 0,
    },
    customerAnalytics: {
      newCustomers: cust.newCustomers ?? 0,
      returningCustomers: cust.returningCustomers ?? 0,
      retentionRate: cust.retentionRate ?? 0,
      avgSpending: cust.avgSpending ?? 0,
      avgLifetimeValue: cust.avgLifetimeValue ?? 0,
      topCustomers: cust.topCustomers ?? [],
      avgVisitFrequency: cust.avgVisitFrequency ?? 0,
      totalCustomers: cust.totalCustomers ?? 0,
    },
    employeePerformance: d.employeePerformance ?? [],
    workshopOperations: {
      vehiclesInShop: ws.vehiclesInShop ?? 0,
      completedToday: ws.completedToday ?? 0,
      todayOrders: ws.todayOrders ?? 0,
      avgTurnaroundMinutes: ws.avgTurnaroundMinutes ?? 0,
    },
    financialHealth: {
      outstandingPayments: fin.outstandingPayments ?? 0,
      outstandingCount: fin.outstandingCount ?? 0,
      inventoryValue: fin.inventoryValue ?? 0,
      lowStockCount: fin.lowStockCount ?? 0,
      outOfStockCount: fin.outOfStockCount ?? 0,
      dailyCashFlow: fin.dailyCashFlow ?? [],
    },
    businessGoals: {
      revenueGoal: goals.revenueGoal ?? EMPTY_GOAL,
      profitGoal: goals.profitGoal ?? EMPTY_GOAL,
      vehicleGoal: goals.vehicleGoal ?? EMPTY_GOAL,
      customerGoal: goals.customerGoal ?? EMPTY_GOAL,
    },
    alerts: d.alerts ?? [],
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("dashboard", {
        startDate: range.startDate,
        endDate: range.endDate,
        compareStartDate: range.compareStartDate,
        compareEndDate: range.compareEndDate,
      });
      setData(normalize(response.data));
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchDashboard };
}
