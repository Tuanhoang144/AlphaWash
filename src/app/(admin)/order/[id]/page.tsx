"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useOrderManager } from "@/services/useOrderManager";
import LoadingPage from "../../../loading";
import { useParams, useRouter } from "next/navigation";
import { OrderResponseDTO } from "@/types/OrderResponse";
import InvoiceSummary from "@/shared/components/order/viewOrder/InvoiceSummary";
import OrderDetailDisplay from "@/shared/components/order/viewOrder/OrderDetailDisplay";
import InformationPayment from "@/shared/components/order/viewOrder/InformationPayment";
import CustomerInfoDisplay from "@/shared/components/order/viewOrder/CustomerInfo";
import OrderInfoDisplay from "@/shared/components/order/viewOrder/OrderInfoDisplay";
import HeaderBreadcrumb from "@/shared/components/layout/Header";

export default function InvoiceClientPage() {
  const params = useParams();
  const id = params.id as string;
  const { getOrderById } = useOrderManager();

  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [orderData, setOrderData] = useState<OrderResponseDTO | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (mounted) setOrderData(data || null);
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu hóa đơn:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, getOrderById]);

  const router = useRouter();
  const handleNavigate = () => {
    setIsNavigating(true);
    router.push(`/order/${id}/edit`);
  };
  const handleNavigateToPayment = () => {
    setIsNavigating(true);
    router.push(`/order/${id}/payment`);
  };

  if (loading || isNavigating) return <LoadingPage />;

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
      <HeaderBreadcrumb
        title="Chi Tiết Hóa Đơn"
        parents={[{ label: "Quản lý hóa đơn", href: "/order/table" }]}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Chi Tiết Hóa Đơn
            </h1>
            <p className="text-gray-600 mt-2">
              Xem thông tin chi tiết của hóa đơn #{orderData.code}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            <div className="lg:col-span-1 space-y-6">
              <InformationPayment
                orderData={orderData}
                onNavigateToPayment={handleNavigateToPayment}
                onNavigateToEdit={handleNavigate}
              />
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
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
