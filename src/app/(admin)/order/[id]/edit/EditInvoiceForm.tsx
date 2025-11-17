"use client";

import { FileText, QrCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import LoadingPage from "@/app/loading";
import HeaderBreadcrumb from "@/shared/components/layout/Header";
import CustomerInfoSection from "@/shared/components/order/customerCollapsible/CustomerInfoSection";
import TimeInfoForm from "@/shared/components/order/timeInfoCollapsible/TimeInfoForm";
import ServiceForm from "@/shared/components/order/serviceCollapsible/ServiceForm";
import InvoiceSummary from "@/shared/components/order/invoiceSummaryCollapsible/InvoiceSummary";
import VehicleInfoSection from "@/shared/components/order/vehicleInfoCollapsible/VehicleInfoBlock";
import type { VehicleDTO } from "@/types/OrderResponse";
import { useEditInvoice } from "@/shared/hooks/order/useEditOrder";

type Props = { id: string };

export default function EditInvoiceContainer({ id }: Props) {
  const {
    isLoading,
    isNavigating,
    formData,
    selectedCustomer,
    currentTotalPrice,
    setFormData,
    handleCustomerChange,
    handleVehicleChange,
    handleServiceChange,
    handleInfoOrderDetailChange,
    addService,
    removeServiceAt,
    buildEmptyDetail,
    handleUpdateSubmit,
    handleCancel,
    handlePayment,
  } = useEditInvoice(id);

  if (isLoading || isNavigating || !formData) return <LoadingPage />;

  return (
    <SidebarInset>
      <HeaderBreadcrumb
        title="Chỉnh sửa hóa đơn"
        parents={[{ label: "Quản lý hóa đơn", href: "/order/table" }]}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleUpdateSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CustomerInfoSection
                  customer={selectedCustomer}
                  onCustomerChange={handleCustomerChange}
                />

                <VehicleInfoSection
                  value={formData.orderDetails?.[0]?.vehicle as VehicleDTO}
                  customer={selectedCustomer || undefined}
                  onChange={handleVehicleChange}
                />

                <ServiceForm
                  orderDetail={formData.orderDetails?.[0] ?? buildEmptyDetail()}
                  onServiceChange={handleServiceChange}
                  onInfoChange={handleInfoOrderDetailChange}
                  addService={addService}
                  removeServiceAt={removeServiceAt}
                  vehicleSize={formData.orderDetails?.[0]?.vehicle?.size ?? ""}
                />
              </div>

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
                        Cập Nhật Hóa Đơn
                      </Button>
                      {currentTotalPrice > 0 && (
                        <Button
                          onClick={handlePayment}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={!!formData.deleteFlag}
                          type="button"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Thanh Toán & In Hóa Đơn
                        </Button>
                      )}
                      <Button
                        onClick={handleCancel}
                        variant="destructive"
                        className="w-full"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hủy Đơn Hàng
                      </Button>
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
