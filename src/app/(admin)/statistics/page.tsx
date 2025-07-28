"use client";

import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useRevenue } from "@/services/useRevenue";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
} from "date-fns";
import { useEffect, useState } from "react";

export type RevenueRequest = {
  startDate: string;
  endDate: string;
  orderStatus?: string;
};

export type RevenueData = {
  orderDate?: string;
  serviceTypeCode?: string;
  serviceName?: string;
  serviceTypeName?: string;
  netRevenue?: string;
  grossRevenue?: string;
};

export default function Statistics() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [lastMonthRevenue, setLastMonthRevenue] = useState<number>(0);
  const [dailyRevenue, setDailyRevenue] = useState<number>(0);
  const [yesterdayRevenue, setYesterdayRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [status, setStatus] = useState("DONE");

  const { getRevenue } = useRevenue();

  const currentMonthLabel = format(new Date(), "MM/yyyy");
  const todayLabel = format(new Date(), "dd/MM/yyyy");

  // Fetch MONTHLY revenue
  useEffect(() => {
    const fetchMonthRevenues = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const prev = subMonths(now, 1);

        const requestCurrent: RevenueRequest = {
          startDate: format(startOfMonth(now), "yyyyMMdd"),
          endDate: format(endOfMonth(now), "yyyyMMdd"),
          orderStatus: status,
        };

        const requestPrev: RevenueRequest = {
          startDate: format(startOfMonth(prev), "yyyyMMdd"),
          endDate: format(endOfMonth(prev), "yyyyMMdd"),
          orderStatus: status,
        };

        const [currentData, prevData] = await Promise.all([
          getRevenue(requestCurrent),
          getRevenue(requestPrev),
        ]);

        const currentTotal = currentData.reduce(
          (acc: number, item: RevenueData) => acc + parseFloat(item.grossRevenue || "0"),
          0
        );
        const prevTotal = prevData.reduce(
          (acc: number, item: RevenueData) => acc + parseFloat(item.grossRevenue || "0"),
          0
        );

        setMonthlyRevenue(currentTotal);
        setLastMonthRevenue(prevTotal);
      } catch (err) {
        console.error("Lỗi khi load doanh thu tháng:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthRevenues();
  }, [getRevenue, status]);

  // Fetch DAILY revenue
  useEffect(() => {
    const fetchDailyRevenue = async () => {
      try {
        const today = new Date();
        const yesterday = subDays(today, 1);

        const requestToday: RevenueRequest = {
          startDate: format(today, "yyyyMMdd"),
          endDate: format(today, "yyyyMMdd"),
          orderStatus: status,
        };

        const requestYesterday: RevenueRequest = {
          startDate: format(yesterday, "yyyyMMdd"),
          endDate: format(yesterday, "yyyyMMdd"),
          orderStatus: status,
        };

        const [todayData, yesterdayData] = await Promise.all([
          getRevenue(requestToday),
          getRevenue(requestYesterday),
        ]);

        const todayTotal = todayData.reduce(
          (acc: number, item: RevenueData) => acc + parseFloat(item.grossRevenue || "0"),
          0
        );
        const yesterdayTotal = yesterdayData.reduce(
          (acc: number, item: RevenueData) => acc + parseFloat(item.grossRevenue || "0"),
          0
        );

        setDailyRevenue(todayTotal);
        setYesterdayRevenue(yesterdayTotal);
      } catch (err) {
        console.error("Lỗi khi load doanh thu ngày:", err);
      }
    };

    fetchDailyRevenue();
  }, [getRevenue, status]);

  const calcPercent = (current: number, previous: number): string => {
    if (previous === 0) return "+100%";
    const percent = ((current - previous) / previous) * 100;
    const symbol = percent >= 0 ? "+" : "";
    return symbol + percent.toFixed(1) + "%";
  };

  const colorClass = (current: number, previous: number) =>
    current >= previous ? "text-green-600" : "text-red-600";

  return (
    <SidebarInset>
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6">
          {/* Daily Revenue Card */}
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm dark:bg-card">
            <CardHeader>
              <CardDescription>Doanh thu ngày {todayLabel}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
                {isLoading
                  ? <Skeleton className="h-8 w-[160px] rounded-md" />
                  : `${dailyRevenue.toLocaleString("en-US")} VNĐ`}
              </CardTitle>
              <div className="mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="size-4" />
                  <span className={`${colorClass(dailyRevenue, yesterdayRevenue)} font-semibold`}>
                    {calcPercent(dailyRevenue, yesterdayRevenue)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Thống kê ngày {todayLabel}
                <TrendingUp className="size-4" />
                <span className={`${colorClass(dailyRevenue, yesterdayRevenue)} font-semibold`}>
                  {calcPercent(dailyRevenue, yesterdayRevenue)}
                </span>
              </div>
              <div className="text-muted-foreground">So với hôm qua</div>
            </CardFooter>
          </Card>
          {/* Monthly Revenue Card */}
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm dark:bg-card">
            <CardHeader>
              <CardDescription>Doanh thu tháng {currentMonthLabel}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
                {isLoading
                  ? <Skeleton className="h-8 w-[160px] rounded-md" />
                  : `${monthlyRevenue.toLocaleString("en-US")} VNĐ`}
              </CardTitle>
              <div className="mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="size-4" />
                  <span className={`${colorClass(monthlyRevenue, lastMonthRevenue)} font-semibold`}>
                    {calcPercent(monthlyRevenue, lastMonthRevenue)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Thống kê tháng {currentMonthLabel}
                <TrendingUp className="size-4" />
                <span className={`${colorClass(monthlyRevenue, lastMonthRevenue)} font-semibold`}>
                  {calcPercent(monthlyRevenue, lastMonthRevenue)}
                </span>
              </div>
              <div className="text-muted-foreground">So với tháng trước</div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
