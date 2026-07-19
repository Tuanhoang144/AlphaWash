"use client";

import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tags, BarChart3 } from "lucide-react";
import SegmentList from "../components/segments/SegmentList";
import SegmentDashboard from "../components/segments/SegmentDashboard";

type Tab = "segments" | "dashboard";

export default function CustomerSegmentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("segments");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
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
              <BreadcrumbLink href="/customers">Quản Lý Khách Hàng</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbLink href="/customers/segments">Phân Khúc</BreadcrumbLink>
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

        {activeTab === "segments" && (
          <SegmentList onFilterBySegment={() => {}} activeSegment={null} />
        )}

        {activeTab === "dashboard" && <SegmentDashboard />}
      </div>
    </SidebarInset>
  );
}
