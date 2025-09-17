"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CreditCard, Printer, Save, ArrowLeft } from "lucide-react";
import { useOrderManager } from "@/services/useOrderManager";
import type { OrderResponseDTO } from "@/types/OrderResponse";
import { addToast } from "@heroui/react";
import PaymentFormContent from "./components/payment-form-content";
import InvoiceTemplate from "./components/invoice-template";
import {
  calculateTotal,
  calculateBaseServicePrice,
  calculateVatFromOrder,
  calculateDiscountFromOrder,
} from "../../utils/calculateTotal";
import { handleInvoicePrint } from "./utils/handle-invoice-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PaymentAndInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getOrderById, getOrderByCode, updateOrder, loading } =
    useOrderManager();
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [order, setOrder] = useState<OrderResponseDTO | null>(null);
  const [activeTab, setActiveTab] = useState<"payment" | "invoice">("payment");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        let orderData = await getOrderById(id);
        if (orderData) {
          setOrder(orderData);
        } else {
          addToast({
            title: "Lỗi",
            description: "Không tìm thấy đơn hàng",
            color: "danger",
          });
          router.push("/order/table");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        addToast({
          title: "Lỗi",
          description: "Không thể tải thông tin đơn hàng",
          color: "danger",
        });
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, getOrderById, getOrderByCode, router]);

  const handlePaymentChange = (field: string, value: string | number) => {
    if (!order) return;
    setOrder((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const createDateTimeString = (dateStr: string, timeStr?: string): string => {
    // Nếu dateStr đã có format đầy đủ (có T và timezone), chỉ lấy phần date
    if (dateStr.includes('T')) {
      const datePart = dateStr.split('T')[0]; 
      const time = timeStr || "00:00:00";
      return `${datePart}T${time}`;
    }
    const time = timeStr || "00:00:00";
    return `${dateStr}T${time}`;
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const updatedOrder: OrderResponseDTO = {
      ...order,
      date: createDateTimeString(order.date), // Format date theo LocalDateTime
      totalPrice: calculateTotal(order as OrderResponseDTO), // Tính toán lại tổng tiền trước khi gửi
    };
    // Gọi hàm updateOrder từ useOrderManager để gửi dữ liệu cập nhật
    updateOrder(updatedOrder, id)
      .then(async (response) => {
        // Cập nhật order với dữ liệu mới nếu cần
        setOrder(response);
        addToast({
          title: "Thành công",
          description: "Hóa đơn đã được cập nhật thành công!",
          color: "success",
        });
        let orderData = await getOrderById(id);
        console.log("Fetched updated order data:", orderData);
        setOrder(orderData);
        onPrintInvoice();
      })
      .catch((error) => {
        console.error("Error updating order:", error);
        addToast({
          title: "Lỗi",
          description: "Không thể cập nhật hóa đơn. Vui lòng thử lại sau.",
          color: "danger",
        });
      });
  };

  if (loading || !order) {
    return (
      <SidebarInset>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-blue-600 mb-4">
              Đang tải thông tin thanh toán...
            </h1>
            <p className="text-gray-700">Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  //Tính toán tiền
  const baseServicePrice = calculateBaseServicePrice(order);
  const totalPrice = calculateTotal(order);
  const vatAmount = calculateVatFromOrder(order);
  const discountAmount = calculateDiscountFromOrder(order);
  order.totalPrice = totalPrice;
  const firstVehicleLicensePlate =
    order.orderDetails?.[0]?.vehicle.licensePlate || null;

  const onPrintInvoice = async () => {
    if (!order) return;

    const services = order.orderDetails.flatMap((d) => d.service);
    const licensePlate = order.orderDetails[0].vehicle.licensePlate;

    const paymentConfig = {
      bankName: process.env.NEXT_PUBLIC_NAMEBANK || "TPBANK",
      accountNumber: process.env.NEXT_PUBLIC_ACCOUNTNUMBER || "0384605830",
      accountName: process.env.NEXT_PUBLIC_ACCOUNTNAME || "CONG TY RUA XE",
    };

    const qrUrl = `https://img.vietqr.io/image/${paymentConfig.bankName}-${
      paymentConfig.accountNumber
    }-compact2.jpg?amount=${Math.floor(
      order.totalPrice
    )}&addInfo=${encodeURIComponent(
      licensePlate + " - " + services.map((s) => s.serviceName).join(", ")
    )}&accountName=${encodeURIComponent(paymentConfig.accountName)}`;

    try {
      await handleInvoicePrint({
        order,
        baseServicePrice,
        qrUrl,
      });
      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được in thành công!",
        color: "success",
      });
      setTimeout(() => {
        router.push(`/order/table`);
      }, 1000);
    } catch (error) {
      console.error("Error printing invoice:", error);
      addToast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi in hóa đơn",
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
            <BreadcrumbPage>Thanh toán & In hóa đơn</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Thanh Toán & In Hóa Đơn
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý thanh toán và in hóa đơn cho đơn hàng #{order.code}
              </p>
            </div>
          </div>

          {/* Tab Navigation với Save Button */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto">
                <Button
                  variant={activeTab === "payment" ? "default" : "outline"}
                  onClick={() => setActiveTab("payment")}
                  className={`whitespace-nowrap ${
                    activeTab === "payment" ? "" : "bg-transparent"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Thanh Toán
                </Button>
                <Button
                  variant={activeTab === "invoice" ? "default" : "outline"}
                  onClick={() => setActiveTab("invoice")}
                  className={`whitespace-nowrap ${
                    activeTab === "invoice" ? "" : "bg-transparent"
                  }`}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Xem Trước Hóa Đơn
                </Button>
              </div>

              {/* Save Button - sticky và chỉ hiển thị khi activeTab === "payment" */}
              {activeTab === "payment" && (
                <div className="">
                  <Button
                    onClick={handleSavePayment}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu Thông Tin Thanh Toán
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {activeTab === "payment" && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Thông Tin Thanh Toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentFormContent
                  paymentType={order.paymentType || "Transfer"}
                  paymentStatus={order.paymentStatus || ""}
                  vat={order.vat || 0}
                  discount={order.discount || 0}
                  tip={order.tip || 0}
                  note={order.note ?? null}
                  totalPrice={totalPrice}
                  baseServicePrice={baseServicePrice}
                  vatAmount={vatAmount}
                  discountAmount={discountAmount}
                  onPaymentChange={handlePaymentChange}
                  customer={order.customer}
                  licensePlate={firstVehicleLicensePlate}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "invoice" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Xem Trước & In Hóa Đơn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceTemplate
                  order={order}
                  baseServicePrice={baseServicePrice}
                />
              </CardContent>
            </Card>
          )}

          <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bạn có muốn in hóa đơn không?</DialogTitle>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPrintDialog(false);
                    router.push(`/order/${id}/edit`);
                  }}
                  className="bg-transparent text-black border-1 hover:text-white hover:bg-black"
                >
                  Không
                </Button>
                <Button
                  onClick={() => {
                    setShowPrintDialog(false);
                    onPrintInvoice();
                  }}
                  className=""
                >
                  <Printer className="h-4 w-4 mr-2" />
                  In Hóa Đơn
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarInset>
  );
}
