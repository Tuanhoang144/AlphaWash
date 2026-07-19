"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw, Loader2, Car, User, ClipboardPaste } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { useQuickInvoice } from "./hooks/useQuickInvoice";
import VehicleSearch from "./components/VehicleSearch";
import RecentVehicles from "./components/RecentVehicles";
import QuickCustomerModal from "./components/QuickCustomerModal";
import ServiceGrid from "./components/ServiceGrid";
import DiscountBar from "./components/DiscountBar";
import PaymentBar from "./components/PaymentBar";
import InvoiceSummary from "./components/InvoiceSummary";
import PrintBillModal from "./components/PrintBillModal";
import MessageParserModal from "./components/MessageParserModal";
import { QuickService } from "@/types/QuickInvoice";

interface PendingParsedService {
  service: QuickService;
}

export default function QuickInvoicePage() {
  const router = useRouter();
  const qi = useQuickInvoice();

  const [showMessageParser, setShowMessageParser] = useState(false);
  const pendingServiceRef = useRef<PendingParsedService | null>(null);

  // When step changes to "services", auto-apply any pending service from message parse
  useEffect(() => {
    if (qi.step === "services" && pendingServiceRef.current) {
      const { service } = pendingServiceRef.current;
      pendingServiceRef.current = null;
      qi.toggleService(service.serviceCode, service.serviceName, service.catalogs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi.step]);

  function handleMessageParseFill({
    plate,
    matchedService,
    rawServiceName,
    staff,
  }: {
    plate: string;
    matchedService: QuickService | null;
    rawServiceName: string;
    staff: string;
    brand: string;
    model: string;
  }) {
    // Store matched service to auto-apply after vehicle selection
    if (matchedService) {
      pendingServiceRef.current = { service: matchedService };
    }

    // Pre-fill the plate search field and trigger search
    qi.searchVehicle(plate);

    if (!matchedService && rawServiceName) {
      addToast({
        title: `Dịch vụ "${rawServiceName}" không khớp`,
        description: "Vui lòng chọn dịch vụ thủ công sau khi chọn xe.",
        color: "warning",
      });
    }

    if (staff) {
      addToast({
        title: `Nhân viên: ${staff}`,
        description: "Vui lòng gán nhân viên khi tạo hoá đơn.",
        color: "default",
      });
    }
  }

  async function handleCreate() {
    try {
      await qi.createInvoice();
    } catch {
      addToast({ title: "Lỗi khi tạo hóa đơn", color: "danger" });
    }
  }

  async function handleCreateAndNew() {
    try {
      await qi.createInvoice();
    } catch {
      addToast({ title: "Lỗi khi tạo hóa đơn", color: "danger" });
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/order/table")}
          className="p-2 -ml-2 rounded-lg hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1">Tạo nhanh</h1>
        <button
          onClick={() => setShowMessageParser(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium text-primary"
          title="Tạo từ tin nhắn nhóm"
        >
          <ClipboardPaste className="h-4 w-4" />
          <span className="hidden sm:inline">Từ tin nhắn</span>
        </button>
        {qi.step === "services" && (
          <button
            onClick={qi.goBackToVehicle}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-48 space-y-6">
        {/* Vehicle step */}
        {qi.step === "vehicle" && (
          <>
            <VehicleSearch
              searchQuery={qi.searchQuery}
              searchResults={qi.searchResults}
              searching={qi.searching}
              onSearch={qi.searchVehicle}
              onSelectVehicle={qi.selectVehicle}
              onClear={() => qi.setSearchQuery("")}
              onOpenNewVehicleModal={() => qi.setShowCustomerModal(true)}
            />
            <RecentVehicles
              vehicles={qi.recentVehicles}
              onSelect={qi.selectRecentVehicle}
            />
          </>
        )}

        {/* Services step */}
        {qi.step === "services" && qi.vehicle && (
          <>
            {/* Vehicle info card */}
            <div className="p-4 rounded-xl bg-muted/50 border border-input space-y-1">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{qi.vehicle.licensePlate}</span>
                <span className="text-sm text-muted-foreground">
                  {qi.vehicle.brandName} {qi.vehicle.modelName}
                </span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  Size {qi.vehicleSize}
                </span>
              </div>
              {qi.customer && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>{qi.customer.name}</span>
                  <span>-</span>
                  <span>{qi.customer.phone}</span>
                </div>
              )}
            </div>

            {/* Service selection */}
            <ServiceGrid
              serviceGroups={qi.serviceGroups}
              vehicleSize={qi.vehicleSize}
              selectedServices={qi.selectedServices}
              favorites={qi.favorites}
              recentServiceCodes={qi.recentServiceCodes}
              onToggleService={qi.toggleService}
              onUpdateQuantity={qi.updateServiceQuantity}
              onToggleFavorite={qi.toggleFavorite}
            />

            {/* Discount */}
            <DiscountBar discount={qi.discount} onSetDiscount={qi.setDiscount} />

            {/* Payment */}
            <PaymentBar
              paymentMethod={qi.paymentMethod}
              onSetPaymentMethod={qi.setPaymentMethod}
            />

            {/* Summary */}
            <InvoiceSummary
              selectedServices={qi.selectedServices}
              subtotal={qi.subtotal}
              discountAmount={qi.discountAmount}
              total={qi.total}
              discount={qi.discount}
            />
          </>
        )}
      </main>

      {/* Sticky bottom actions */}
      {qi.step === "services" && qi.selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t px-4 py-3 safe-area-bottom">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">
              {qi.selectedServices.length} dịch vụ
            </span>
            <span className="ml-auto text-lg font-bold text-primary">
              {qi.total.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={qi.creating}
              className="flex-1 h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.97] transition-transform"
            >
              {qi.creating && <Loader2 className="h-5 w-5 animate-spin" />}
              {qi.creating ? "Đang tạo..." : "Tạo hóa đơn"}
            </button>
            <button
              onClick={handleCreateAndNew}
              disabled={qi.creating}
              className="h-14 px-6 rounded-xl border-2 border-primary text-primary font-semibold text-sm flex items-center justify-center disabled:opacity-50 active:scale-[0.97] transition-transform"
            >
              Tạo & Mới
            </button>
          </div>
        </div>
      )}

      {/* Message parser modal */}
      <MessageParserModal
        open={showMessageParser}
        onClose={() => setShowMessageParser(false)}
        serviceGroups={qi.serviceGroups}
        onFillForm={handleMessageParseFill}
      />

      {/* Quick customer modal */}
      <QuickCustomerModal
        open={qi.showCustomerModal}
        defaultPlate={qi.searchQuery}
        onClose={() => qi.setShowCustomerModal(false)}
        onCreated={(vehicle, customer) => {
          qi.setShowCustomerModal(false);
          qi.selectVehicle(vehicle, customer);
        }}
      />

      {/* Print bill screen */}
      {qi.printBillData && (
        <PrintBillModal
          data={qi.printBillData}
          onClose={qi.closePrintBill}
          onNewInvoice={() => {
            qi.closePrintBill();
            qi.resetForm();
          }}
        />
      )}
    </div>
  );
}
