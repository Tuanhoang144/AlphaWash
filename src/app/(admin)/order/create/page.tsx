"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, QrCode } from "lucide-react"; // Import CreditCard and QrCode
import CustomerInfoSection from "./components/customer-info-section";
import OrderInfoForm from "./components/order-info-form";
import OrderDetailForm from "./components/order-detail-form";
import PaymentFormContent from "./components/payment-form"; // Renamed import
import InvoiceSummary from "./components/invoice-summary";
import type { Customer, OrderDTO } from "./types/invoice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useOrderManager } from "@/services/useOrderManager";

export default function CreateInvoiceForm() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false); // State for payment dialog

  const [formData, setFormData] = useState<Partial<OrderDTO>>({
    orderDate: new Date().toISOString().split("T")[0],
    checkIn: new Date().toISOString().split("T")[1].substring(0, 5),
    checkOut: "",
    tip: 0,
    paymentType: "Cash",
    paymentStatus: "Pending",
    vat: 0,
    discount: 0,
    totalPrice: 0,
    note: null,
    customer: undefined,
    orderDetails: [
      {
        employees: [],
        vehicle: {
          id: "",
          licensePlate: "",
          brandId: 0,
          brandCode: "",
          brandName: "",
          modelId: 0,
          modelCode: "",
          modelName: "",
          size: "",
          imageUrl: "",
        },
        service: {
          id: 0,
          code: "",
          serviceName: "",
          duration: "",
          note: "",
          serviceTypeCode: "",
        },
        serviceCatalog: {
          id: 0,
          code: "",
          size: "",
          price: 0,
        },
        status: "Chờ xử lý",
        note: null,
      },
    ],
  });

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({
      ...prev,
      customer: customer ?? undefined,
    }));
  };

  const calculateTotal = () => {
    const serviceTotalBeforeTaxAndDiscount =
      formData.orderDetails?.reduce(
        (sum, detail) => sum + (detail.serviceCatalog?.price || 0),
        0
      ) || 0;
    const vatAmount =
      (serviceTotalBeforeTaxAndDiscount * (formData.vat || 0)) / 100;
    const discountAmount =
      (serviceTotalBeforeTaxAndDiscount * (formData.discount || 0)) / 100;
    return Math.round(
      serviceTotalBeforeTaxAndDiscount + vatAmount - discountAmount
    );
  };

  const { createOrder } = useOrderManager();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData : OrderDTO = {
      ...formData,
      tip: formData.tip ?? 0,
      totalPrice: calculateTotal(),
      orderDate: formData.orderDate as string,
      checkIn: formData.checkIn as string,
      checkOut: formData.checkOut as string,
      paymentType: formData.paymentType ?? "Cash",
      paymentStatus: formData.paymentStatus ?? "Pending",
      vat: formData.vat ?? 0,
      discount: formData.discount ?? 0,
      note: formData.note ?? null, // Ensure note is string or null, never undefined
      customer: selectedCustomer as Customer, // Ensure customer is always a Customer
      orderDetails: formData.orderDetails ?? [], // Ensure orderDetails is always an array
    };
    console.log("Form submitted:", finalData);
    try {
      const response = await createOrder(finalData); 
      console.log("✅ Tạo hóa đơn thành công:", response);
      alert("Hóa đơn đã được tạo thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi tạo hóa đơn:", error);
      alert("Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại.");
    }
  };

  // Get the first vehicle's license plate for transfer info, if available
  const firstVehicleLicensePlate =
    formData.orderDetails?.[0]?.vehicle.licensePlate || null;
  const currentTotalPrice = calculateTotal();
  const baseServicePrice =
    formData.orderDetails?.reduce(
      (sum, detail) => sum + (detail.serviceCatalog?.price || 0),
      0
    ) || 0;

  return (
    <SidebarInset>
      <header className="sticky z-10 top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/order/table">
                Theo dõi xe ra vào xưởng
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbPage className="hidden md:block">
              <BreadcrumbLink href="#">Tạo mới phiếu rửa xe</BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <CustomerInfoSection
                  customer={selectedCustomer}
                  onCustomerChange={handleCustomerChange}
                />

                {/* Order Details */}
                <OrderDetailForm
                  orderDetails={formData.orderDetails || []}
                  onOrderDetailsChange={(orderDetails) =>
                    setFormData((prev) => ({ ...prev, orderDetails }))
                  }
                  customer={selectedCustomer || undefined}
                />
              </div>

              {/* Right Column - Invoice Info & Payment */}
              <div className="lg:col-span-1 space-y-6">
                {/* Order Information */}
                <OrderInfoForm
                  orderDate={formData.orderDate || ""}
                  checkIn={formData.checkIn || ""}
                  checkOut={formData.checkOut || ""}
                  onOrderInfoChange={(field, value) =>
                    setFormData((prev) => ({ ...prev, [field]: value }))
                  }
                />

                {/* Invoice Summary */}
                <InvoiceSummary
                  orderDetails={formData.orderDetails || []}
                  totalPrice={currentTotalPrice}
                />

                {/* Submit Buttons - Sticky */}
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
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        Lưu nháp
                      </Button>
                      {/* New Payment Button - Conditionally rendered */}
                      {currentTotalPrice > 0 && (
                        <Dialog
                          open={isPaymentDialogOpen}
                          onOpenChange={setIsPaymentDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              Thanh Toán
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="!max-w-none w-fit p-6 max-h-[90vh] overflow-y-auto ">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Thông Tin Thanh Toán & Mã QR
                              </DialogTitle>
                              <DialogDescription>
                                Kiểm tra thông tin và sử dụng mã QR để thanh
                                toán
                              </DialogDescription>
                            </DialogHeader>
                            <PaymentFormContent
                              paymentType={formData.paymentType || ""}
                              paymentStatus={formData.paymentStatus || ""}
                              vat={formData.vat || 0}
                              discount={formData.discount || 0}
                              tip={formData.tip || 0} // Vẫn truyền tip để hiển thị
                              note={formData.note ?? null}
                              totalPrice={currentTotalPrice} // totalPrice đã không bao gồm tip
                              baseServicePrice={baseServicePrice} // Truyền baseServicePrice mới
                              onPaymentChange={(field, value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [field]: value,
                                }))
                              }
                              customer={selectedCustomer}
                              licensePlate={firstVehicleLicensePlate}
                            />
                          </DialogContent>
                        </Dialog>
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
