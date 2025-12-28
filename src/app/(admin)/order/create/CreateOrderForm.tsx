"use client";

import { FileText, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import LoadingPage from "@/app/loading";
import HeaderBreadcrumb from "@/shared/components/layout/Header";
import CustomerInfoSection from "@/shared/components/order/customerCollapsible/CustomerInfoSection";
import TimeInfoForm from "@/shared/components/order/timeInfoCollapsible/TimeInfoForm";
import VehicleInfoSection from "@/shared/components/order/vehicleInfoCollapsible/VehicleInfoBlock";
import { VehicleDTO } from "@/types/OrderResponse";
import ServiceForm from "@/shared/components/order/serviceCollapsible/ServiceForm";
import InvoiceSummary from "@/shared/components/order/invoiceSummaryCollapsible/InvoiceSummary";
import { useCreateInvoice } from "@/shared/hooks/order/useCreateOrder";
import PromotionPicker from "@/shared/components/order/promotion/PromotionPicker";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComboForm from "@/shared/components/order/comboCollapsible/ComboForm";
import { useComboForm } from "@/shared/services/useComboForm";

export default function CreateOrderForm() {
  const {
    // form
    formData,
    setFormData,
    currentTotalPrice,
    isNavigating,

    // customer/vehicle
    selectedCustomer,
    handleCustomerChange,
    handleVehicleChange,

    // service
    handleInfoOrderDetailChange,
    handleServiceChange,
    addService,
    removeServiceAt,
    buildEmptyDetail,

    // ✅ mode
    mode,
    setMode,

    // submit
    handleSubmit,
    handleNavigateToPayment,

    // promotion
    promotions,
    promoLoading,
    selectedPromotion,
    applyPromotion,
    canChoosePromotion,
  } = useCreateInvoice();

  const { combos: allCombos, loadingCombos } = useComboForm();

  if (isNavigating) return <LoadingPage />;

  return (
    <SidebarInset>
      <HeaderBreadcrumb
        title="Tạo mới hóa đơn"
        parents={[{ label: "Quản lý hóa đơn", href: "/order/table" }]}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit}>
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

                <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="SERVICE">Mua dịch vụ</TabsTrigger>
                    <TabsTrigger value="COMBO">Mua combo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="SERVICE" className="mt-4">
                    <ServiceForm
                      orderDetail={
                        formData.orderDetails?.[0] ?? buildEmptyDetail()
                      }
                      onServiceChange={handleServiceChange}
                      onInfoChange={handleInfoOrderDetailChange}
                      addService={addService}
                      removeServiceAt={removeServiceAt}
                      vehicleSize={
                        formData.orderDetails?.[0]?.vehicle?.size ?? ""
                      }
                    />
                  </TabsContent>

                  <TabsContent value="COMBO" className="mt-4">
                    <ComboForm
                      orderDetail={
                        formData.orderDetails?.[0] ?? buildEmptyDetail()
                      }
                      onSetComboService={(svc) => {
                        setMode("COMBO");
                        addService(svc);
                      }}
                      onUpdateComboService={(patch) => {
                        handleServiceChange(0, patch as any);
                      }}
                      onClearCombo={() => {
                        removeServiceAt(0);
                      }}
                      vehicleSize={
                        formData.orderDetails?.[0]?.vehicle?.size ?? ""
                      }
                      hasCustomer={!!selectedCustomer?.id}
                      onInfoChange={handleInfoOrderDetailChange}
                      allCombos={allCombos}
                      loadingCombos={loadingCombos}
                    />
                  </TabsContent>
                </Tabs>
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

                {!canChoosePromotion ? null : (
                  <PromotionPicker
                    promotions={promotions}
                    value={selectedPromotion}
                    onChange={(promo) =>
                      applyPromotion(promo, { skipUsableCheck: false })
                    }
                    disabled={promoLoading}
                  />
                )}

                <InvoiceSummary
                  statusPayment={formData.paymentStatus || "PENDING"}
                  orderDetails={formData.orderDetails || []}
                  totalPrice={currentTotalPrice ?? 0}
                  promotion={selectedPromotion}
                  combos={allCombos}
                />

                <div className="sticky top-6 bg-white rounded-lg border p-4 shadow-sm">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Tổng tiền</div>
                      <div className="text-2xl font-bold text-green-600">
                        {(currentTotalPrice ?? 0).toLocaleString("vi-VN")} VNĐ{" "}
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

                      {(currentTotalPrice ?? 0) > 0 && (
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
