"use client";

import { FileText, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import LoadingPage from "@/app/loading";
import HeaderBreadcrumb from "@/shared/components/layout/Header";
import CustomerInfoSection from "@/shared/components/order/customerCollapsible/CustomerInfoSection";
import TimeInfoForm from "@/shared/components/order/timeInfoCollapsible/TimeInfoForm";
import VehicleInfoSection from "@/shared/components/order/vehicleInfoCollapsible/VehicleInfoBlock";
import { VehicleDTO } from "@/types/OrderResponse";
import ServiceForm from "@/shared/components/order/serviceCollapsible/ServiceForm";
import InvoiceSummary from "@/shared/components/order/invoiceSummaryCollapsible/InvoiceSummary";
import { useCreateInvoice } from "@/shared/hooks/order/useCreateOrder";

export default function CreateOrderForm() {
  const {
    formData,
    setFormData,
    selectedCustomer,
    handleCustomerChange,
    handleVehicleChange,
    currentTotalPrice,
    isNavigating,
    handleSubmit,
    handleNavigateToPayment,
    buildEmptyDetail,
  } = useCreateInvoice();

  if (isNavigating) return <LoadingPage />;

  return (
    <SidebarInset>
      {/* Header */}
      <HeaderBreadcrumb
        title="Tạo mới hóa đơn"
        parents={[{ label: "Quản lý hóa đơn", href: "/order/table" }]}
      />

      {/* Form */}
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cột Trái */}
              <div className="lg:col-span-2 space-y-6">
                {/* Thông Tin Khách Hàng */}
                <CustomerInfoSection
                  customer={selectedCustomer}
                  onCustomerChange={handleCustomerChange}
                />

                {/* Thông Tin Xe */}
                <VehicleInfoSection
                  value={formData.orderDetails?.[0]?.vehicle as VehicleDTO}
                  customer={selectedCustomer || undefined}
                  onChange={handleVehicleChange}
                />

                {/* Thông Dịch Vụ & Nhân Viên Thi Công */}
                <ServiceForm
                  orderDetail={formData.orderDetails?.[0] ?? buildEmptyDetail()}
                  onOrderDetailChange={(nextDetail) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderDetails: [nextDetail],
                    }))
                  }
                  vehicleSize={formData.orderDetails?.[0]?.vehicle?.size ?? ""}
                />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 space-y-6">
                <TimeInfoForm
                  orderDate={formData.date || ""}
                  checkIn={formData.checkIn || ""}
                  checkOut={formData.checkOut || ""}
                  onOrderInfoChange={(field, value) =>
                    setFormData((prev) => ({ ...prev, [field]: value }))
                  }
                />

                <InvoiceSummary
                  statusPayment={formData.paymentStatus || "PENDING"}
                  orderDetails={formData.orderDetails || []}
                  totalPrice={currentTotalPrice}
                />

                {/* Submit */}
                <div className="sticky top-6 bg-white rounded-lg border p-4 shadow-sm">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Tổng tiền</div>
                      <div className="text-2xl font-bold text-green-600">
                        {currentTotalPrice.toLocaleString("vi-VN")} VNĐ
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Tạo Hóa Đơn
                      </Button>
                      {currentTotalPrice > 0 && (
                        <Button
                          onClick={handleNavigateToPayment}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={formData.deleteFlag}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Thanh Toán & In Hóa Đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SidebarInset>
  );
}
