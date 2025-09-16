"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, QrCode } from "lucide-react"; // Import CreditCard and QrCode
import CustomerInfoSection from "./components/customer-info-section";
import OrderInfoForm from "./components/order-info-form";
import OrderDetailForm from "./components/order-detail-form";
import InvoiceSummary from "./components/invoice-summary";
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
import { useRouter } from "next/navigation";
import {
  CustomerDTO,
  OrderResponseDTO,
  VehicleDTO,
} from "@/types/OrderResponse";
import calculateTotal from "../utils/calculateTotal";
import { addToast } from "@heroui/toast";
import LoadingPage from "@/app/loading";

export default function CreateInvoiceForm() {
  const [formData, setFormData] = useState<Partial<OrderResponseDTO>>({
    date: new Date().toISOString().split("T")[0],
    checkIn: new Date().toISOString().split("T")[1].substring(0, 5),
    checkOut: "",
    tip: 0,
    paymentType: "Cash",
    paymentStatus: "PENDING",
    vat: 0,
    discount: 0,
    deleteFlag: false,
    totalPrice: 0,
    note: null,
    customer: {
      id: "",
      name: "",
      phone: "",
      vehicles: [],
    },
    orderDetails: [
      {
        code: "",
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
        service: [
          {
            id: 0,
            serviceCode: "",
            serviceName: "",
            serviceTypeCode: "",
            serviceCatalog: {
              id: 0,
              code: "",
              size: "",
              price: 0,
            },
          },
        ],
        status: "PENDING",
        note: null,
      },
    ],
  });
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(
    null
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const currentTotalPrice = calculateTotal(formData as OrderResponseDTO);
  const { createOrder } = useOrderManager();
  const route = useRouter();

  const handleCustomerChange = (customer: CustomerDTO | null) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({
      ...prev,
      customer: customer ?? undefined,
    }));
  };

  const createNewOrder = async (): Promise<string> => {
    // Return Promise<string>
    const finalData: OrderResponseDTO = {
      ...formData,
      id: formData.id ?? "",
      code: formData.code ?? "",
      tip: formData.tip ?? 0,
      totalPrice: currentTotalPrice,
      date: formData.date
        ? `${formData.date}T00:00:00`
        : new Date().toISOString(),
      checkIn: formData.checkIn as string,
      checkOut: formData.checkOut as string,
      paymentType: formData.paymentType ?? "Cash",
      paymentStatus: formData.paymentStatus ?? "PENDING",
      vat: formData.vat ?? 0,
      discount: formData.discount ?? 0,
      note: formData.note ?? null,
      customer: selectedCustomer as CustomerDTO,
      orderDetails:
        formData.orderDetails?.map((detail) => ({
          ...detail,
          vehicle: detail.vehicle as VehicleDTO,
          service:
            detail.service?.map((service) => ({
              ...service,
              serviceCatalog: {
                ...service.serviceCatalog,
                code: service.serviceCatalog?.code ?? "",
                price: service.serviceCatalog?.price ?? 0,
              },
            })) || [],
          note: detail.note ?? null,
        })) ?? [],
      deleteFlag: formData.deleteFlag ?? false,
    };

    console.log("Form submitted:", finalData);

    try {
      const response = await createOrder(finalData);
      console.log("Order created successfully:", response);

      const orderId = response;

      console.log("Order ID:", orderId);

      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được tạo thành công!",
        color: "success",
      });

      return orderId;
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn:", error);
      addToast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại.",
        color: "danger",
      });
      throw error;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsNavigating(true);

    try {
      await createNewOrder();
      route.push("/order/table");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setIsNavigating(false); 
    }
  };

  const handleNavigateToPayment = async () => {
    setIsNavigating(true);

    try {
      const orderId = await createNewOrder();
      console.log("Navigating to payment with ID:", orderId);

      if (orderId) {
        route.push(`/order/${orderId}/payment`);
      } else {
        throw new Error("Order ID is empty");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setIsNavigating(false);
    }
  };

  if (isNavigating) {
    return <LoadingPage />;
  }

  return (
    <SidebarInset>
      <header className="sticky z-10 top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/order/table">
                Quản lý hóa đơn
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbPage className="hidden md:block">
              <BreadcrumbLink href="#">Tạo mới hóa đơn</BreadcrumbLink>
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
                  onOrderDetailsChange={(
                    orderDetails: OrderResponseDTO["orderDetails"]
                  ) => setFormData((prev) => ({ ...prev, orderDetails }))}
                  customer={selectedCustomer || undefined}
                />
              </div>

              {/* Right Column - Invoice Info & Payment */}
              <div className="lg:col-span-1 space-y-6">
                {/* Order Information */}
                <OrderInfoForm
                  orderDate={formData.date || ""}
                  checkIn={formData.checkIn || ""}
                  checkOut={formData.checkOut || ""}
                  onOrderInfoChange={(field: string, value: any) =>
                    setFormData((prev) => ({ ...prev, [field]: value }))
                  }
                />

                {/* Invoice Summary */}
                <InvoiceSummary
                  statusPayment={formData.paymentStatus || "PENDING"}
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
