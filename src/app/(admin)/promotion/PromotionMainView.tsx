"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import HeaderBreadcrumb from "@/shared/components/layout/Header";
import { PromotionTable } from "@/shared/components/promotion/table/PromotionTable";

export default function PromotionMainView() {
  //   if (isNavigating) return <LoadingPage />;

  return (
    <SidebarInset>
      {/* Header */}
      <HeaderBreadcrumb title="Khuyến mãi của Tiệm" />

      {/* Form */}
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <PromotionTable />
        </div>
      </div>
    </SidebarInset>
  );
}
