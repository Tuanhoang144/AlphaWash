"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboard } from "./hooks/useDashboard";
import type { DateRange } from "./types/dashboard";
import DashboardDateFilter, { getDefaultRange } from "./components/DashboardDateFilter";
import DashboardSkeleton from "./components/DashboardSkeleton";
import KpiCards from "./components/KpiCards";
import RevenueCharts from "./components/RevenueCharts";
import ProfitOverview from "./components/ProfitOverview";
import ServicePerformancePanel from "./components/ServicePerformancePanel";
import CustomerAnalyticsPanel from "./components/CustomerAnalyticsPanel";
import EmployeeLeaderboard from "./components/EmployeeLeaderboard";
import WorkshopOperationsPanel from "./components/WorkshopOperationsPanel";
import FinancialHealthPanel from "./components/FinancialHealthPanel";
import BusinessGoalsPanel from "./components/BusinessGoalsPanel";
import AlertsPanel from "./components/AlertsPanel";
import { LayoutDashboard, RefreshCw } from "lucide-react";

export default function Statistics() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange);
  const { data, loading, error, fetchDashboard } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard(dateRange);
  }, [dateRange, fetchDashboard]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard(dateRange).finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  }, [dateRange, fetchDashboard]);

  return (
    <SidebarInset>
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Executive Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-3">
          <DashboardDateFilter onRangeChange={setDateRange} currentRange={dateRange} />
          <button
            onClick={handleRefresh}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6">
        {loading && !data ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="rounded-full bg-red-500/10 p-4">
              <LayoutDashboard className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Thử lại
            </button>
          </div>
        ) : data ? (
          <div className={`space-y-8 ${loading ? "opacity-60 pointer-events-none" : ""} animate-in fade-in duration-300`}>
            {data.alerts.length > 0 && <AlertsPanel data={data.alerts} />}
            <KpiCards data={data.kpiSummary} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <WorkshopOperationsPanel data={data.workshopOperations} />
              </div>
              <ProfitOverview data={data.profitDashboard} />
            </div>
            <BusinessGoalsPanel data={data.businessGoals} />
            <RevenueCharts data={data.revenueDashboard} />
            <ServicePerformancePanel data={data.servicePerformance} />
            <CustomerAnalyticsPanel data={data.customerAnalytics} />
            <EmployeeLeaderboard data={data.employeePerformance} />
            <FinancialHealthPanel data={data.financialHealth} />
          </div>
        ) : null}
      </div>
    </SidebarInset>
  );
}
