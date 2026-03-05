"use client";

import LoadingPage from "@/app/loading";
import CustomerInfoSection from "./customerCollapsible/CustomerInfoSection";
import { useOrderSubmit } from "@/hooks/createOrder/useOrderSubmit";
import TimeSection from "./timeInfoCollapsible/TimeSection";
import OrderDetailSection from "./orderDetailCollapsible/OrderDetailSection";
import { Button } from "@/components/ui/button";
import { FileText, QrCode } from "lucide-react";
import PromotionSection from "./promotionCollapsible/PromotionSection";
import OrderSummarySection from "./orderSummaryCollapsible/OrderSummarySection";

export default function CreateOrderForm() {
  const {
    selectedCustomer,
    handleCustomerChange,
    date,
    checkInTime,
    checkOutTime,
    orderDetails,
    selectedPromotion,
    handleDateChange,
    handleCheckInChange,
    handleCheckOutChange,
    handleOrderDetailsChange,
    handlePromotionChange,
    paymentType,
    handlePaymentTypeChange,
    paymentStatus,
    handlePaymentStatusChange,
    vat,
    handleVatChange,
    tip,
    handleTipChange,
    discount,
    handleDiscountChange,
    noteOrder,
    handleNoteOrderChange,
    totalPrice,
    subTotal,
    discountAmount,
    priceAfterDiscount,
    vatAmount,
    handleNavigateToPayment,
    handleSubmit,
  } = useOrderSubmit();

  // if (isNavigating) return <LoadingPage />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CustomerInfoSection
            customer={selectedCustomer}
            onCustomerChange={handleCustomerChange}
          />

          <OrderDetailSection
            customerSelected={selectedCustomer}
            orderDetails={orderDetails || []}
            handleOrderDetailChange={handleOrderDetailsChange}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <TimeSection
            date={date || ""}
            checkIn={checkInTime || ""}
            checkOut={checkOutTime || ""}
            onDateChange={handleDateChange}
            onCheckInChange={handleCheckInChange}
            onCheckOutChange={handleCheckOutChange}
          />

          <PromotionSection
            customer={selectedCustomer}
            selectedPromotion={selectedPromotion}
            onHandlePromotionChange={handlePromotionChange}
          />

          <OrderSummarySection
            orderDetails={orderDetails}
            subTotal={subTotal}
            discountAmount={discountAmount}
            priceAfterDiscount={priceAfterDiscount}
            vatAmount={vatAmount}
            totalPrice={totalPrice}
          />

          <div className="sticky top-6 bg-white rounded-lg border p-4 shadow-sm">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Tổng tiền</div>
                <div className="text-2xl font-bold text-green-600">
                  {(totalPrice ?? 0).toLocaleString("vi-VN")} VNĐ{" "}
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
                  onClick={handleNavigateToPayment}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Thanh Toán & In Hóa Đơn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
