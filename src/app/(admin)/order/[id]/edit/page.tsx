"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
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
import InformationPayment from "./components/information-payment";
import { calculateTotal } from "../../utils/calculateTotal";
import Loading from "@/components/common/loading";

export default function EditInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const { getOrderById, updateOrder, cancelOrderById } = useOrderManager();
  const [loading, setLoading] = useState(true);
  const { getCustomersByPhone } = useCustomerManager();
  const [formData, setFormData] = useState<OrderResponseDTO | null>(null);
  const router = useRouter();

  const mapCustomer = (c?: CustomerDTO | CustomerDTO[] | null): CustomerDTO => {
    const customer = Array.isArray(c) ? c[0] : c;
    return {
      id: customer?.id || "",
      name: customer?.name || "Khách lẻ",
      phone: customer?.phone || "Chưa có",
      vehicles: customer?.vehicles || [],
    };
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(id);
        if (!data) return;

        let matchedCustomer: CustomerDTO | null = null;
        if (data.customer?.phone) {
          const found = await getCustomersByPhone(data.customer.phone);
          matchedCustomer = found && found.length > 0 ? found[0] : null;
        }
        const mappedData: OrderResponseDTO = {
          ...data,
          customer: await mapCustomer(matchedCustomer || data.customer),
        };
        setFormData(mappedData);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderData();
  }, [id, getOrderById, getCustomersByPhone]);

  const handleCustomerChange = (customer: CustomerDTO | null) => {
    setFormData((prev) =>
      prev ? { ...prev, customer: mapCustomer(customer) } : null
    );
  };

  const handleOrderInfoChange = (field: string, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleOrderDetailsChange = (orderDetails: OrderDetailDTO[]) => {
    setFormData((prev) => (prev ? { ...prev, orderDetails } : null));
  };

  const createDateTimeString = (dateStr: string, timeStr = "00:00:00") =>
    `${dateStr}T${timeStr}`;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData) return;

    try {
      const updatedOrder: OrderResponseDTO = {
        ...formData,
        date: createDateTimeString(formData.date),
        totalPrice: calculateTotal(formData),
      };

      const response = await updateOrder(updatedOrder, id);
      setFormData(response);

      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được cập nhật thành công!",
        color: "success",
      });
      router.push(`/order/table`);
    } catch {
      addToast({
        title: "Lỗi",
        description: "Không thể cập nhật hóa đơn. Vui lòng thử lại sau.",
        color: "danger",
      });
    }
  };

  const handleCancel = async () => {
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

    try {
      const updatedOrder: OrderResponseDTO = {
        ...formData,
        date: createDateTimeString(formData.date),
        totalPrice: calculateTotal(formData),
      };

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

  if (loading || !formData) {
    return <Loading />;
  }

  const total = calculateTotal(formData);

  return (
    <SidebarInset>
      <header className="sticky z-10 top-0 flex items-center gap-2 border-b bg-background p-4">
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
              {/* Cột trái */}
              <div className="lg:col-span-2 space-y-6">
                <CustomerInfoSection
                  customer={mapCustomer(formData.customer)}
                  onCustomerChange={handleCustomerChange}
                />
                <OrderDetailForm
                  orderDetails={formData.orderDetails || []}
                  onOrderDetailsChange={handleOrderDetailsChange}
                  customer={formData.customer}
                />
              </div>

              {/* Cột phải */}
              <div className="lg:col-span-1 space-y-6">
                <InformationPayment
                  orderData={formData}
                  currentTotalPrice={total}
                  onSave={() => handleSubmit()}
                  onCancel={handleCancel}
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
                  totalPrice={total}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </SidebarInset>
  );
}
