"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ServiceUsedDTO, ServiceDetailResponse } from "@/types/CarUser";
import { ServiceUsedTable } from "./components/ServiceUsedTable";
import { ServiceUsedDetailDialog } from "./components/ServiceUsedDetailDialog";
import { ServiceUsedDialog } from "./components/ServiceUsedDialog";
import { useServiceUsedManager } from "@/services/userCarManager";
import { useSegmentManager } from "@/services/useSegmentManager";
import { Pagination } from "./components/pagination";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
} from "@/components/ui/breadcrumb";
import SegmentList from "./components/SegmentList";
import SegmentBadges from "./components/SegmentBadges";
import SegmentDashboard from "./components/SegmentDashboard";
import { Users, Tags, BarChart3 } from "lucide-react";
import type { CustomerWithSegments } from "@/types/Segment";

type Tab = "customers" | "segments" | "dashboard";

export default function ServiceUsedPage() {
  const {
    servicesUsed,
    getAllServicesUsed,
    addServiceUsed,
    updateServiceUsed,
    deleteServiceUsed,
    getServiceUsedDetail,
  } = useServiceUsedManager();

  const { customers: customersWithSegments, getCustomersWithSegments } = useSegmentManager();

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<ServiceUsedDTO[]>([]);
  const [selected, setSelected] = useState<ServiceDetailResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("customers");
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    getAllServicesUsed();
    getCustomersWithSegments();
  }, [getAllServicesUsed, getCustomersWithSegments]);

  const segmentCustomerIds = useMemo(() => {
    if (!activeSegment || !customersWithSegments.length) return null;
    const ids = new Set<string>();
    for (const c of customersWithSegments) {
      if (c.segments.some((s) => s.code === activeSegment)) {
        ids.add(c.customerId);
      }
    }
    return ids;
  }, [activeSegment, customersWithSegments]);

  const customerSegmentMap = useMemo(() => {
    const map = new Map<string, CustomerWithSegments>();
    for (const c of customersWithSegments) {
      map.set(c.customerId, c);
    }
    return map;
  }, [customersWithSegments]);

  useEffect(() => {
    let f = servicesUsed.filter(
      (c) =>
        c.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
        c.customerName.toLowerCase().includes(search.toLowerCase())
    );

    if (segmentCustomerIds) {
      f = f.filter((c) => segmentCustomerIds.has(c.customerId));
    }

    setFiltered(f);
    setPage(1);
  }, [search, servicesUsed, segmentCustomerIds]);

  const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleViewDetail = async (c: ServiceUsedDTO) => {
    if (!c.customerId) {
      alert("Không có thông tin user");
      return;
    }
    const detailData = await getServiceUsedDetail(c.customerId);
    if (detailData) {
      setSelected(detailData);
      setDetailOpen(true);
    } else {
      alert("Không tìm thấy thông tin chi tiết của user");
    }
  };

  const handleSegmentFilter = (code: string | null) => {
    setActiveSegment(code);
    setPage(1);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "customers", label: "Khách Hàng", icon: <Users className="h-4 w-4" /> },
    { key: "segments", label: "Phân Khúc", icon: <Tags className="h-4 w-4" /> },
    { key: "dashboard", label: "Tổng Quan", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <SidebarInset>
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Quản Lý Khách Hàng</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "customers" && (
          <div className="space-y-4">
            <SegmentList onFilterBySegment={handleSegmentFilter} activeSegment={activeSegment} />

            <div className="flex items-center gap-2">
              <Input
                placeholder="Tìm theo biển số hoặc tên khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
              {activeSegment && (
                <span className="text-xs text-muted-foreground">
                  {filtered.length} khách hàng
                </span>
              )}
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">STT</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Biển số</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tên xe</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số lần SD</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">SĐT</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phân khúc</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((item, i) => {
                      const cws = customerSegmentMap.get(item.customerId);
                      return (
                        <tr key={item.licensePlate + i} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                          <td className="px-4 py-3 text-sm">{(page - 1) * pageSize + i + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.licensePlate}</td>
                          <td className="px-4 py-3 text-sm">{item.vehicleName}</td>
                          <td className="px-4 py-3 text-sm">{item.serviceUsage}</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.customerName}</td>
                          <td className="px-4 py-3 text-sm">{item.phone}</td>
                          <td className="px-4 py-3">
                            <SegmentBadges badges={cws?.segments || []} />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewDetail(item)}
                              className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {pagedData.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          {activeSegment ? "Không có khách hàng trong phân khúc này" : "Không tìm thấy khách hàng"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "segments" && (
          <SegmentList onFilterBySegment={(code) => { setActiveSegment(code); setActiveTab("customers"); }} activeSegment={null} />
        )}

        {activeTab === "dashboard" && <SegmentDashboard />}
      </div>

      <ServiceUsedDialog
        data={null}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(d) => addServiceUsed(d)}
      />

      <ServiceUsedDetailDialog
        data={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </SidebarInset>
  );
}
