"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { CreditCard, QrCode, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomerInfoSection from "../../create/components/customer-info-section";
import OrderDetailForm from "../../create/components/order-detail-form";
import OrderInfoForm from "../../create/components/order-info-form";
import InvoiceSummary from "../../create/components/invoice-summary";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  CustomerDTO,
  OrderDetailDTO,
  OrderResponseDTO,
} from "@/types/OrderResponse";
import { useCustomerManager } from "@/services/useCustomerManager";
import { addToast } from "@heroui/react";
import calculateTotal from "../../utils/calculateTotal";
import InformationPayment from "./components/information-payment";

export default function EditInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const { loading, getOrderById } = useOrderManager();
  const [customerData, setCustomerData] = useState<CustomerDTO | null>(null);
  const [formData, setFormData] = useState<OrderResponseDTO | null>(null);
  const [fetchedOrder, setFetchedOrder] = useState<OrderResponseDTO | null>(
    null
  );

  const { updateOrder, cancelOrderById } = useOrderManager();
  const { getCustomersByPhone } = useCustomerManager();
  const router = useRouter();

  useEffect(() => {
    const fetchOrderData = async () => {
      const data = await getOrderById(id);
      console.log("Fetched order data:", data);

      if (!data) {
        console.error("Order data not found for ID:", id);
        return;
      }

      let matchedCustomer: CustomerDTO | null = null;
      if (data.customer?.phone) {
        const found = await getCustomersByPhone(data.customer.phone);
        matchedCustomer = found?.[0] ?? null;
      }

      setFetchedOrder(data);
      setCustomerData(matchedCustomer);
    };
    fetchOrderData();
  }, [id, getOrderById]);

  useEffect(() => {
    if (fetchedOrder) {
      // Khởi tạo formData với fetchedOrder, đảm bảo tất cả các trường đều có mặt
      setFormData({
        ...fetchedOrder,
        // Đảm bảo các đối tượng lồng nhau không phải là null/undefined nếu form mong đợi chúng
        customer: customerData
          ? {
              id: customerData.id || "",
              name: customerData.name || "Khách lẻ",
              phone: customerData.phone || "Chưa có",
              vehicles: customerData.vehicles || [],
            }
          : fetchedOrder.customer
          ? {
              id: fetchedOrder.customer.id || "",
              name: fetchedOrder.customer.name || "Khách lẻ",
              phone: fetchedOrder.customer.phone || "Chưa có",
              vehicles: fetchedOrder.customer.vehicles || [],
            }
          : fetchedOrder.customer,
        orderDetails: fetchedOrder.orderDetails || [],
      });
    }
  }, [fetchedOrder]);

  const handleCustomerChange = (customer: CustomerDTO | null) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            customer: customer || {
              id: "",
              name: "",
              phone: "",
            },
          }
        : null
    );
  };

  // Hàm chung để cập nhật các trường trực tiếp của OrderDTO
  const handleOrderInfoChange = (field: string, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleOrderDetailsChange = (orderDetails: OrderDetailDTO[]) => {
    setFormData((prev) => (prev ? { ...prev, orderDetails } : null));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const updatedOrder: OrderResponseDTO = {
      ...formData,
      date: new Date(formData.date).toISOString(), //Chỉnh sửa ngày tháng năm tạo hóa đơn
      totalPrice: total, // Tính toán lại tổng tiền trước khi gửi
    };

    console.log("Submitting updated OrderDTO:", updatedOrder);
    // Gọi hàm updateOrder từ useOrderManager để gửi dữ liệu cập nhật
    updateOrder(updatedOrder, id)
      .then((response) => {
        console.log("Order updated successfully:", response);
        // Cập nhật formData với dữ liệu mới nếu cần
        setFormData(response);
        addToast({
          title: "Thành công",
          description: "Hóa đơn đã được cập nhật thành công!",
          color: "success",
        });
        router.push(`/order/table`);
      })
      .catch((error) => {
        console.error("Error updating order:", error);
        // alert("Đã xảy ra lỗi khi cập nhật hóa đơn. Vui lòng thử lại.");
        addToast({
          title: "Lỗi",
          description: "Không thể cập nhật hóa đơn. Vui lòng thử lại sau.",
          color: "danger",
        });
      });
  };

  if (loading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">
            Đang tải hóa đơn để chỉnh sửa...
          </h1>
          <p className="text-gray-700">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  const total = calculateTotal(formData as OrderResponseDTO);
  const currentTotalPrice = total;

  const handleCancel = async (id: string): Promise<void> => {
    try {
      await cancelOrderById(id);
      addToast({
        title: "Thành công",
        description: "Đơn hàng đã được hủy thành công!",
        color: "success",
      });
      router.push(`/order/table`);
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
        color: "danger",
      });
      console.error("Error canceling order:", error);
    }
  };

  const handlePayment = async () => {
    if (!formData) return;

    const updatedOrder: OrderResponseDTO = {
      ...formData,
      totalPrice: total,
    };

    try {
      console.log("Submitting updated OrderDTO:", updatedOrder);
      const response = await updateOrder(updatedOrder, id);

      setFormData(response);
      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được cập nhật thành công!",
        color: "success",
      });
      router.push(`/order/${id}/payment`);
    } catch (error) {
      console.error("Error updating order:", error);
      addToast({
        title: "Lỗi",
        description: "Không thể cập nhật hóa đơn. Vui lòng thử lại sau.",
        color: "danger",
      });
    }
  };

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
            <BreadcrumbItem>
              <BreadcrumbPage className="hidden md:block">
                Chỉnh sửa hóa đơn
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Chỉnh Sửa Hóa Đơn
            </h1>
            <p className="text-gray-600 mt-2">
              Cập nhật thông tin chi tiết của hóa đơn #{formData.code}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cột trái - Chi tiết đơn hàng */}
              <div className="lg:col-span-2 space-y-6">
                <CustomerInfoSection
                  customer={
                    !formData.customer.id
                      ? null
                      : {
                          id: formData.customer.id || "",
                          name: formData.customer.name,
                          phone: formData.customer.phone || "",
                          vehicles: (formData.customer as any).vehicles,
                        }
                  }
                  onCustomerChange={handleCustomerChange}
                />
                <OrderDetailForm
                  orderDetails={formData.orderDetails || []}
                  onOrderDetailsChange={handleOrderDetailsChange}
                  customer={formData.customer || undefined}
                />
              </div>

              {/* Cột phải - Thông tin hóa đơn & Thanh toán */}
              <div className="lg:col-span-1 space-y-6">
                <InformationPayment
                  orderData={formData}
                  currentTotalPrice={currentTotalPrice}
                  onSave={() =>
                    handleSubmit(
                      new Event("submit") as unknown as React.FormEvent
                    )
                  }
                  onCancel={() => handleCancel(id)}
                  onPayment={handlePayment}
                />
                <OrderInfoForm
                  orderDate={formData.date}
                  checkIn={formData.checkIn}
                  checkOut={formData.checkOut}
                  onOrderInfoChange={handleOrderInfoChange}
                />
                <InvoiceSummary
                  deleteFlag={formData.deleteFlag || false}
                  statusPayment={formData.paymentStatus || ""}
                  orderDetails={formData.orderDetails}
                  totalPrice={currentTotalPrice}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </SidebarInset>
  );
}
