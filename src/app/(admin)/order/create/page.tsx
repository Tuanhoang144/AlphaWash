"use client";

import CreateOrderForm from "@/components/feature/order/CreateOrder";
import { SidebarInset } from "@/components/ui/sidebar";
import HeaderBreadcrumb from "@/shared/components/layout/Header";

export default function Page() {
  return (
    <SidebarInset>
      <HeaderBreadcrumb
        title="Tạo mới hóa đơn"
        parents={[{ label: "Quản lý hóa đơn", href: "/order/table" }]}
      />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <CreateOrderForm />
        </div>
      </div>
    </SidebarInset>
  );
}
