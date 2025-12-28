"use client";
import { useEffect, useState } from "react";
import type React from "react";

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
import { CreditCard, Printer, Save, Package } from "lucide-react";
import { useOrderManager } from "@/services/useOrderManager";
import type { OrderResponseDTO, ServiceDTO } from "@/types/OrderResponse";
import { addToast } from "@heroui/react";
import PaymentFormContent from "./components/payment-form-content-combo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  calculateBaseServicePrice,
  calculateTotal,
} from "@/shared/utils/order/calculatePrice";
import { Badge } from "@/components/ui/badge";
import { handleComboInvoicePrint } from "./utils/handle-combo-invoice-print";
import ComboInvoiceTemplate from "./components/combo-invoice-template";
import { useServiceManager } from "@/services/useServiceAll";

export default function ComboPaymentAndInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getOrderById, updateOrder, loading } = useOrderManager();
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [order, setOrder] = useState<OrderResponseDTO | null>(null);
  const [activeTab, setActiveTab] = useState<"payment" | "invoice">("payment");

  const { getAllServiceCode } = useServiceManager();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(id);
        if (orderData) {
          const isCombo = orderData.orderDetails.some(
            (detail: any) => detail.orderType === "COMBO"
          );

          if (!isCombo) {
            addToast({
              title: "Lỗi",
              description: "Đây không phải là đơn hàng combo",
              color: "warning",
            });
            router.push("/order/table");
            return;
          }

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
  }, [id, getOrderById, router]);

  const handlePaymentChange = (field: string, value: string | number) => {
    if (!order) return;
    setOrder((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const createDateTimeString = (dateStr: string, timeStr?: string): string => {
    if (dateStr.includes("T")) {
      const datePart = dateStr.split("T")[0];
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
      date: createDateTimeString(order.date),
      totalPrice: calculateTotal(order as OrderResponseDTO),
    };

    // updateOrder(updatedOrder, id)
    //   .then(async (response) => {
    //     setOrder(response);
    //     addToast({
    //       title: "Thành công",
    //       description: "Hóa đơn combo đã được cập nhật thành công!",
    //       color: "success",
    //     });
    //     const orderData = await getOrderById(id);
    //     setOrder(orderData);
    //     onPrintInvoice();
    //   })
    //   .catch((error) => {
    //     console.error("Error updating order:", error);
    //     addToast({
    //       title: "Lỗi",
    //       description:
    //         "Không thể cập nhật hóa đơn combo. Vui lòng thử lại sau.",
    //       color: "danger",
    //     });
    //   });

    Promise.resolve()
      .then(() => {
        setOrder(updatedOrder);
        addToast({
          title: "Thành công",
          description: "Đã chuẩn bị dữ liệu hóa đơn combo!",
          color: "success",
        });
        onPrintInvoice();
      })
      .catch((error) => {
        console.error("Error:", error);
        addToast({
          title: "Lỗi",
          description: "Không thể chuẩn bị hóa đơn. Vui lòng thử lại sau.",
          color: "danger",
        });
      });
  };

  if (loading || !order) {
    return (
      <SidebarInset>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <Package className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-600 mb-4">
              Đang tải thông tin thanh toán combo...
            </h1>
            <p className="text-gray-700">Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  const baseServicePrice = calculateBaseServicePrice(order);

  const totalPrice = calculateTotal(order);
  console.log(totalPrice);

  order.totalPrice = totalPrice;
  const firstVehicleLicensePlate =
    order.orderDetails?.[0]?.vehicle.licensePlate || null;

  const onPrintInvoice = async () => {
    if (!order) return;

    const licensePlate = order.orderDetails[0].vehicle.licensePlate;
    const comboNames =
      order.orderDetails[0].service[0].serviceComboCatalog?.comboName || "";

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
      licensePlate + " - COMBO: " + comboNames
    )}&accountName=${encodeURIComponent(paymentConfig.accountName)}`;

    try {
      await handleComboInvoicePrint({
        order,
        baseServicePrice,
        qrUrl,
      });
      addToast({
        title: "Thành công",
        description: "Hóa đơn combo đã được in thành công!",
        color: "success",
      });
      setTimeout(() => {
        router.push(`/order/table`);
      }, 1000);
    } catch (error) {
      console.error("Error printing combo invoice:", error);
      addToast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi in hóa đơn combo",
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
            <BreadcrumbPage>Thanh toán Combo & In hóa đơn</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-orange-500" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Thanh Toán Gói Combo
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-orange-500 text-white text-sm"
                >
                  COMBO
                </Badge>
              </div>
              <p className="text-gray-600 mt-2">
                Quản lý thanh toán và in hóa đơn combo cho đơn hàng #
                {order.code}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto">
                <Button
                  variant={activeTab === "payment" ? "default" : "outline"}
                  onClick={() => setActiveTab("payment")}
                  className={`whitespace-nowrap ${
                    activeTab === "payment"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-transparent"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Thanh Toán
                </Button>
                <Button
                  variant={activeTab === "invoice" ? "default" : "outline"}
                  onClick={() => setActiveTab("invoice")}
                  className={`whitespace-nowrap ${
                    activeTab === "invoice"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-transparent"
                  }`}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Xem Trước Hóa Đơn
                </Button>
              </div>

              {activeTab === "payment" && (
                <div className="">
                  <Button
                    onClick={handleSavePayment}
                    className="bg-orange-600 hover:bg-orange-700 shadow-lg w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu Thông Tin Thanh Toán
                  </Button>
                </div>
              )}
            </div>
          </div>

          {activeTab === "payment" && (
            <Card className="border-orange-200">
              <CardHeader className="flex items-center justify-between bg-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  Thông Tin Thanh Toán Combo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PaymentFormContent
                  paymentType={order.paymentType || "Transfer"}
                  paymentStatus={order.paymentStatus || ""}
                  vat={order.vat || 0}
                  discount={order.discount || 0}
                  tip={order.tip || 0}
                  note={order.note ?? null}
                  totalPrice={totalPrice}
                  baseServicePrice={baseServicePrice}
                  onPaymentChange={handlePaymentChange}
                  customer={order.customer}
                  licensePlate={firstVehicleLicensePlate}
                  order={order}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "invoice" && (
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-orange-500" />
                  Xem Trước & In Hóa Đơn Combo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ComboInvoiceTemplate
                  order={order}
                  baseServicePrice={baseServicePrice}
                />
              </CardContent>
            </Card>
          )}

          <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bạn có muốn in hóa đơn combo không?</DialogTitle>
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
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  In Hóa Đơn Combo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarInset>
  );
}
