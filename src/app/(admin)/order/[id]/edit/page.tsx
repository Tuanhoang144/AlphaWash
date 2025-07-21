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
import PaymentFormContent from "../../components/payment-form";
import { SidebarInset } from "@/components/ui/sidebar";
import { CustomerDTO, OrderDetailDTO, OrderResponseDTO } from "@/types/OrderResponse";
import { useCustomerManager } from "@/services/useCustomerManager";

export default function EditInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const { loading, getOrderById } = useOrderManager();
  // State để giữ dữ liệu form, được khởi tạo từ fetchedOrder
  const [customerData, setCustomerData] = useState<CustomerDTO | null>(null);
  const [formData, setFormData] = useState<OrderResponseDTO | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<any | null>(null);

  const { updateOrder } = useOrderManager();
  const { getCustomersByPhone } = useCustomerManager();
  const router = useRouter();

  useEffect(() => {
    const fetchOrderData = async () => {
      const data = await getOrderById(id);
      const customerData = await getCustomersByPhone(data.customer.phone);
      if (!data) {
        console.error("Order data not found for ID:", id);
        return;
      }
      setFetchedOrder(data);
      setCustomerData(customerData && customerData.length > 0 ? customerData[0] : null);
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
              name: customerData.name || "",
              phone: customerData.phone || "",
              vehicles: customerData.vehicles || [],
            }
          : {
              id: "",
              name: "",
              phone: "",
              vehicles: [],
            },
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

  console.log("Fetched order data:", fetchedOrder);
  console.log("Form data state:", formData);

  // Hàm chung để cập nhật các trường trực tiếp của OrderDTO
  const handleOrderInfoChange = (field: string, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleOrderDetailsChange = (orderDetails: OrderDetailDTO[]) => {
    setFormData((prev) => (prev ? { ...prev, orderDetails } : null));
  };

  // Hàm chung để cập nhật các trường thanh toán của OrderDTO
  const handlePaymentChange = (field: string, value: string | number) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const calculateTotal = () => {
    if (!formData || !formData.orderDetails) return 0;
    const serviceTotalBeforeTaxAndDiscount =
      formData.orderDetails.reduce(
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const updatedOrder: OrderResponseDTO = {
      ...formData,
      totalPrice: calculateTotal(), // Tính toán lại tổng tiền trước khi gửi
    };

    // Gọi hàm updateOrder từ useOrderManager để gửi dữ liệu cập nhật
    updateOrder(updatedOrder, id)
      .then((response) => {
        console.log("Order updated successfully:", response);
        // Cập nhật formData với dữ liệu mới nếu cần
        setFormData(response);

        alert("Hóa đơn đã được cập nhật thành công!");
        router.push(`/order/${id}`);
      })
      .catch((error) => {
        console.error("Error updating order:", error);
        alert("Đã xảy ra lỗi khi cập nhật hóa đơn. Vui lòng thử lại.");
      });
    console.log("Submitting updated OrderDTO:", updatedOrder);
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

  const currentTotalPrice = calculateTotal();
  const baseServicePrice =
    formData.orderDetails?.reduce(
      (sum, detail) => sum + (detail.serviceCatalog?.price || 0),
      0
    ) || 0;
  const firstVehicleLicensePlate =
    formData.orderDetails?.[0]?.vehicle.licensePlate || null;

  return (
    <SidebarInset>
      <header className="sticky z-10 top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
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
              <BreadcrumbLink href={`/order/${id}`}>
                Chi tiết phiếu rửa xe
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
              Cập nhật thông tin chi tiết của hóa đơn
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
                  orderDetails={formData.orderDetails}
                  onOrderDetailsChange={handleOrderDetailsChange}
                  customer={formData.customer || undefined}
                />
              </div>

              {/* Cột phải - Thông tin hóa đơn & Thanh toán */}
              <div className="lg:col-span-1 space-y-6">
                <OrderInfoForm
                  orderDate={formData.orderDate}
                  checkIn={formData.checkIn}
                  checkOut={formData.checkOut}
                  onOrderInfoChange={handleOrderInfoChange}
                />
                <InvoiceSummary
                statusPayment={formData.paymentStatus || ""}
                  orderDetails={formData.orderDetails}
                  totalPrice={currentTotalPrice}
                />

                {/* Nút gửi - Sticky */}
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
                        <Save className="h-4 w-4 mr-2" />
                        Lưu Thay Đổi
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        Hủy
                      </Button>
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
                              Xem Thông Tin Thanh Toán
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="!max-w-none w-fit p-6 max-h-[90vh] overflow-y-auto">
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
                              tip={formData.tip || 0}
                              note={formData.note ?? null}
                              totalPrice={currentTotalPrice}
                              baseServicePrice={baseServicePrice}
                              onPaymentChange={handlePaymentChange}
                              customer={formData.customer}
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
