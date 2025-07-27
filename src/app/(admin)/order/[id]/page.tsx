"use client";

import { use, useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { CreditCard, Printer, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Reusing PaymentFormContent for display
import InvoiceSummary from "./components/invoice-summary";
import CustomerInfoDisplay from "./components/customer-info-display";
import OrderInfoDisplay from "./components/order-info-display";
import OrderDetailDisplay from "./components/order-detail-display";
import LoadingPage from "../../../loading";
import { useRouter } from "next/navigation";
import { OrderResponseDTO } from "@/types/OrderResponse";

export default function InvoiceClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getOrderById } = useOrderManager();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderResponseDTO | null>(null);
  // const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (!data) {
          console.error("Order data not found for ID:", id);
          return;
        }
        // const mapper = mapRawApiToOrderDTO(data);
        setOrderData(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id, getOrderById]);

  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const handleNavigate = () => {
    setIsNavigating(true);
    router.push(`/order/${id}/edit`);
  };

  const handleNavigateToPayment = () => {
    setIsNavigating(true);
    router.push(`/order/${id}/payment`);
  };

  if (loading || isNavigating) {
    return <LoadingPage />;
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Không tìm thấy hóa đơn
          </h1>
          <p className="text-gray-700">
            Hóa đơn với ID "{id}" không tồn tại hoặc có lỗi xảy ra.
          </p>
          <a
            href="/order/create"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Quay lại trang tạo hóa đơn
          </a>
        </div>
      </div>
    );
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
                Theo dõi xe ra vào xưởng
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="hidden md:block">
                <BreadcrumbLink href="#">Chi tiết phiếu rửa xe</BreadcrumbLink>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Chi Tiết Hóa Đơn
            </h1>
            <p className="text-gray-600 mt-2">
              Xem thông tin chi tiết của hóa đơn dịch vụ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details Display */}
            <div className="lg:col-span-2 space-y-6">
              <CustomerInfoDisplay
                customer={
                  orderData.customer && orderData.customer.id
                    ? orderData.customer
                    : null
                }
              />
              <OrderDetailDisplay orderDetails={orderData.orderDetails} />
            </div>

            {/* Right Column - Invoice Info & Payment Display */}
            <div className="lg:col-span-1 space-y-6">
              <OrderInfoDisplay
                orderDate={orderData.date}
                checkIn={orderData.checkIn}
                checkOut={orderData.checkOut}
              />
              <InvoiceSummary
                deleteFlag={orderData.deleteFlag || false}
                statusPayment={orderData.paymentStatus}
                orderDetails={orderData.orderDetails}
                totalPrice={orderData.totalPrice}
              />

              {/* Payment Info & Actions - Sticky */}
              <div className="sticky top-6 bg-white rounded-lg border p-4 shadow-sm">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">
                      Tổng tiền hóa đơn
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {orderData.totalPrice.toLocaleString("vi-VN")} VNĐ
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {/* Reusing PaymentFormContent for display in a dialog */}
                    <Button
                      onClick={handleNavigateToPayment}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={orderData.deleteFlag}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Thanh Toán & In Hóa Đơn
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent text-blue-600 hover:text-blue-700"
                      onClick={handleNavigate}
                      disabled={orderData.deleteFlag}
                    >
                      Chỉnh Sửa Hóa Đơn
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
