"use client";

import type React from "react";
import { useState } from "react";
import { FileText, QrCode, Trash2, Plus } from "lucide-react";
import { addToast } from "@heroui/toast";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import LoadingPage from "@/app/loading";
import HeaderBreadcrumb from "@/shared/components/layout/Header";
import CustomerInfoSection from "@/shared/components/order/customerCollapsible/CustomerInfoSection";
import TimeInfoForm from "@/shared/components/order/timeInfoCollapsible/TimeInfoForm";
import ServiceForm from "@/shared/components/order/serviceCollapsible/ServiceForm";
import ProductSection from "@/shared/components/order/productCollapsible/ProductSection";
import InvoiceSummary from "@/shared/components/order/invoiceSummaryCollapsible/InvoiceSummary";
import VehicleInfoSection from "@/shared/components/order/vehicleInfoCollapsible/VehicleInfoBlock";
import type { ServiceDTO, VehicleDTO } from "@/types/OrderResponse";
import { useEditInvoice } from "@/shared/hooks/order/useEditOrder";
import { useProductForm } from "@/shared/hooks/order/useProductForm";

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
    // Multi-vehicle handlers
    addVehicle,
    removeVehicleAt,
    handleVehicleChangeAt,
    handleServiceChangeAt,
    addServiceAt,
    removeServiceAtDetail,
    handleInfoOrderDetailChangeAt,
    handleAddProductAt,
    handleRemoveProductAt,
    handleProductQuantityChangeAt,
    buildEmptyDetail,
    handleUpdateSubmit,
    handleCancel,
    handlePayment,
  } = useEditInvoice(id);

  const {
    products: allProducts,
    categories: productCategories,
    loadingProducts,
  } = useProductForm();

  const [blockedVehicleIndexes, setBlockedVehicleIndexes] = useState<Set<number>>(
    new Set()
  );

  const handleVehicleBlockChange = (index: number) => (blocked: boolean) => {
    setBlockedVehicleIndexes((prev) => {
      const next = new Set(prev);
      if (blocked) next.add(index);
      else next.delete(index);
      return next;
    });
  };

  const handleGuardedUpdateSubmit = (e: React.FormEvent) => {
    if (blockedVehicleIndexes.size > 0) {
      e.preventDefault();
      addToast({
        title: "Không thể cập nhật hóa đơn",
        description:
          "Có biển số xe đã thuộc về khách hàng khác. Vui lòng liên kết hoặc chuyển quyền sở hữu trước khi tiếp tục.",
        color: "danger",
      });
      return;
    }
    handleUpdateSubmit(e);
  };

  if (isLoading || isNavigating || !formData) return <LoadingPage />;

  return (
    <SidebarInset>
      <HeaderBreadcrumb
        title="Chỉnh sửa hóa đơn"
        parents={[{ label: "Quản lý hóa đơn", href: "/order/table" }]}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleGuardedUpdateSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CustomerInfoSection
                  customer={selectedCustomer}
                  onCustomerChange={handleCustomerChange}
                />

                {/* Danh sách xe – loop qua tất cả orderDetails */}
                {formData.orderDetails?.map((detail, index) => (
                  <div key={index} className="space-y-4">
                    {/* Header xe */}
                    <div className="flex items-center justify-between bg-white rounded-lg border p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Xe #{index + 1}
                      </h3>
                      {(formData.orderDetails?.length ?? 0) > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVehicleAt(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa xe
                        </Button>
                      )}
                    </div>

                    <VehicleInfoSection
                      value={detail.vehicle as VehicleDTO}
                      customer={selectedCustomer || undefined}
                      onChange={handleVehicleChangeAt(index)}
                      onBlockChange={handleVehicleBlockChange(index)}
                    />

                    <ServiceForm
                      orderDetail={detail}
                      onServiceChange={(sIndex, updated) =>
                        handleServiceChangeAt(index, sIndex, updated)
                      }
                      onInfoChange={handleInfoOrderDetailChangeAt(index)}
                      addService={() =>
                        addServiceAt(index)({
                          id: 0,
                          serviceCode: "",
                          serviceName: "",
                          serviceTypeCode: "",
                          adjustedPriceReason: "",
                          adjustedPrice: 0,
                          adjustedPriceFlag: false,
                          quantity: 1,
                          duration: undefined,
                          note: undefined,
                          serviceCatalog: {
                            code: "",
                            id: 0,
                            listedPrice: 0,
                            size: "",
                          },
                        } as ServiceDTO)
                      }
                      removeServiceAt={(sIndex) =>
                        removeServiceAtDetail(index, sIndex)
                      }
                      vehicleSize={detail.vehicle?.size ?? ""}
                    />

                    <ProductSection
                      products={detail.products || []}
                      allProducts={allProducts}
                      categories={productCategories}
                      loadingProducts={loadingProducts}
                      onAddProduct={(product) => handleAddProductAt(index, product)}
                      onRemoveProduct={(pIndex) => handleRemoveProductAt(index, pIndex)}
                      onQuantityChange={(pIndex, qty) =>
                        handleProductQuantityChangeAt(index, pIndex, qty)
                      }
                    />

                    {index < (formData.orderDetails?.length ?? 0) - 1 && (
                      <hr className="border-gray-300 my-6" />
                    )}
                  </div>
                ))}

                {/* Nút thêm xe */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addVehicle}
                  className="w-full py-6 border-dashed border-2"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Thêm xe
                </Button>
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
