"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Search,
  Printer,
  Save,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { addToast } from "@heroui/toast";

import { useQuoteService } from "@/services/useQuoteService";
import type { Quote, QuoteItem } from "@/types/Quote";
import type { ServiceItem } from "@/types/Service";
import { ServicePickerDialog } from "./ServicePickerDialog";
import { QuotePDFPreview } from "./QuotePDFPreview";

const CAR_SIZES = ["S", "M", "L", "SEDAN", "SUV", "SUV Full Size"] as const;
type CarSize = (typeof CAR_SIZES)[number];

interface CustomerSuggestion {
  id?: string;
  name: string;
  phone?: string;
  licensePlate?: string;
}

interface Props {
  initialQuote?: Quote;
}

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function QuoteBuilder({ initialQuote }: Props) {
  const router = useRouter();
  const { createQuote, updateQuote, searchCustomers } = useQuoteService();
  const pdfRef = useRef<HTMLDivElement>(null);

  // Form state
  const [customerName, setCustomerName] = useState(initialQuote?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialQuote?.customerPhone ?? "");
  const [licensePlate, setLicensePlate] = useState(initialQuote?.licensePlate ?? "");
  const [carModel, setCarModel] = useState(initialQuote?.carModel ?? "");
  const [carSize, setCarSize] = useState<CarSize | "">(
    (initialQuote?.carSize as CarSize) ?? ""
  );
  const [quoteDate, setQuoteDate] = useState(
    initialQuote?.quoteDate
      ? initialQuote.quoteDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [discount, setDiscount] = useState(initialQuote?.discount ?? 0);
  const [extraCharge, setExtraCharge] = useState(initialQuote?.extraCharge ?? 0);
  const [notes, setNotes] = useState(initialQuote?.notes ?? "");

  // Items
  const [mainItems, setMainItems] = useState<QuoteItem[]>(
    initialQuote?.items.filter((i) => !i.isBonus) ?? []
  );
  const [bonusItems, setBonusItems] = useState<QuoteItem[]>(
    initialQuote?.items.filter((i) => i.isBonus) ?? []
  );

  // Customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // UI state
  const [mainPickerOpen, setMainPickerOpen] = useState(false);
  const [bonusPickerOpen, setBonusPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");

  // Debounced customer search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!customerSearch.trim() || customerSearch.length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchCustomers(customerSearch);
        const list = Array.isArray(results) ? results : [];
        setSuggestions(
          list.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            licensePlate: c.vehicles?.[0]?.licensePlate,
          }))
        );
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [customerSearch, searchCustomers]);

  const selectCustomer = (c: CustomerSuggestion) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone ?? "");
    if (c.licensePlate) setLicensePlate(c.licensePlate);
    setCustomerSearch("");
    setSuggestions([]);
  };

  // Computed totals
  const subtotal = mainItems.reduce((s, i) => s + i.price, 0);
  const total = Math.max(0, subtotal - discount + extraCharge);

  // Service picker handlers
  const handleAddMain = (svc: ServiceItem, price: number) => {
    const item: QuoteItem = {
      serviceId: svc.id,
      serviceName: svc.name,
      brand: svc.brand,
      type: svc.type,
      warranty: svc.warranty,
      price,
      isBonus: false,
      sortOrder: mainItems.length,
    };
    setMainItems((prev) => [...prev, item]);
  };

  const handleAddBonus = (svc: ServiceItem, price: number) => {
    const item: QuoteItem = {
      serviceId: svc.id,
      serviceName: svc.name,
      brand: svc.brand,
      type: svc.type,
      warranty: svc.warranty,
      price, // reference price
      isBonus: true,
      sortOrder: bonusItems.length,
    };
    setBonusItems((prev) => [...prev, item]);
  };

  const removeMain = (idx: number) =>
    setMainItems((prev) => prev.filter((_, i) => i !== idx));

  const removeBonus = (idx: number) =>
    setBonusItems((prev) => prev.filter((_, i) => i !== idx));

  const updateMainPrice = (idx: number, price: number) =>
    setMainItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, price } : item))
    );

  const handleSave = async () => {
    if (!customerName.trim()) {
      addToast({ title: "Vui lòng nhập tên khách hàng", color: "danger" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerName,
        customerPhone: customerPhone || undefined,
        licensePlate: licensePlate || undefined,
        carModel: carModel || undefined,
        carSize: carSize || undefined,
        quoteDate,
        status: "DRAFT" as const,
        subtotal,
        discount,
        extraCharge,
        total,
        notes: notes || undefined,
        items: [...mainItems, ...bonusItems],
      };

      if (initialQuote?.id) {
        await updateQuote(initialQuote.id, payload);
        addToast({ title: "Đã cập nhật báo giá", color: "success" });
      } else {
        const created = await createQuote(payload);
        addToast({ title: "Đã tạo báo giá", color: "success" });
        router.push(`/quotes/${created.id}`);
      }
    } catch {
      addToast({ title: "Lỗi khi lưu báo giá", color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #quote-pdf-print-wrapper { display: block !important; }
      }
      #quote-pdf-print-wrapper { display: none; }
    `;
    document.head.appendChild(style);

    const wrapper = document.createElement("div");
    wrapper.id = "quote-pdf-print-wrapper";
    if (pdfRef.current) {
      wrapper.innerHTML = pdfRef.current.outerHTML;
    }
    document.body.appendChild(wrapper);

    window.print();

    setTimeout(() => {
      document.body.removeChild(wrapper);
      document.head.removeChild(style);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/quotes")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Xuất PDF
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {saving ? "Đang lưu..." : "Lưu báo giá"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Soạn thảo</TabsTrigger>
          <TabsTrigger value="preview">Xem trước PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6 mt-4">
          {/* Section 1: Khách & xe */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. Thông tin khách hàng & xe</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {/* Customer search */}
              <div className="col-span-2 space-y-1 relative">
                <Label>Tìm khách từ CRM</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Nhập tên hoặc SĐT..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((c, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-2 hover:bg-muted/50 flex items-center justify-between text-sm"
                        onClick={() => selectCustomer(c)}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground">
                          {[c.phone, c.licensePlate].filter(Boolean).join(" · ")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label>Tên khách hàng *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-1">
                <Label>Số điện thoại</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0901234567"
                />
              </div>
              <div className="space-y-1">
                <Label>Ngày báo giá</Label>
                <Input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Biển số xe</Label>
                <Input
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="51A-12345"
                />
              </div>
              <div className="space-y-1">
                <Label>Dòng xe</Label>
                <Input
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Toyota Camry 2023"
                />
              </div>
              <div className="space-y-1">
                <Label>Kích cỡ xe</Label>
                <Select
                  value={carSize}
                  onValueChange={(v) => setCarSize(v as CarSize)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kích cỡ" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {carSize && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ Giá sẽ tự động điền theo kích cỡ {carSize}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Dịch vụ chính */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">2. Dịch vụ chính</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMainPickerOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm dịch vụ
              </Button>
            </CardHeader>
            <CardContent>
              {mainItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" để chọn.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Tên dịch vụ</TableHead>
                      <TableHead className="w-28">Thương hiệu</TableHead>
                      <TableHead className="w-24">Loại</TableHead>
                      <TableHead className="w-24">Bảo hành</TableHead>
                      <TableHead className="w-32 text-right">Giá (đ)</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mainItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.serviceName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.brand || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{item.type || "—"}</TableCell>
                        <TableCell className="text-sm">{item.warranty || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            value={item.price}
                            onChange={(e) =>
                              updateMainPrice(idx, Number(e.target.value))
                            }
                            className="h-8 w-28 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeMain(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Dịch vụ tặng */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">3. Dịch vụ tặng kèm</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBonusPickerOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm tặng kèm
              </Button>
            </CardHeader>
            <CardContent>
              {bonusItems.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                  Chưa có dịch vụ tặng kèm.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-amber-50">
                      <TableHead>Tên dịch vụ</TableHead>
                      <TableHead className="w-28">Bảo hành</TableHead>
                      <TableHead className="w-36 text-right">Giá tham khảo</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bonusItems.map((item, idx) => (
                      <TableRow key={idx} className="bg-amber-50/30">
                        <TableCell className="font-medium">{item.serviceName}</TableCell>
                        <TableCell className="text-sm">{item.warranty || "—"}</TableCell>
                        <TableCell className="text-right text-amber-700 font-medium">
                          {item.price
                            ? formatVND(item.price) + "đ"
                            : "Tặng"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeBonus(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Tóm tắt */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">4. Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="space-y-1">
                  <Label>Giảm giá (đ)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phí phát sinh (đ)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={extraCharge}
                    onChange={(e) => setExtraCharge(Number(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-1 max-w-md">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng dịch vụ:</span>
                  <span>{formatVND(subtotal)}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Giảm giá:</span>
                    <span>-{formatVND(discount)}đ</span>
                  </div>
                )}
                {extraCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí phát sinh:</span>
                    <span>+{formatVND(extraCharge)}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-emerald-700">{formatVND(total)}đ</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Ghi chú</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Preview tab */}
        <TabsContent value="preview" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              In / Xuất PDF
            </Button>
          </div>
          <div className="overflow-x-auto border rounded-lg shadow">
            <QuotePDFPreview
              ref={pdfRef}
              quoteCode={initialQuote?.quoteCode}
              customerName={customerName}
              customerPhone={customerPhone}
              quoteDate={quoteDate}
              licensePlate={licensePlate}
              carModel={carModel}
              carSize={carSize || undefined}
              items={[...mainItems, ...bonusItems]}
              subtotal={subtotal}
              discount={discount}
              extraCharge={extraCharge}
              total={total}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Service pickers */}
      <ServicePickerDialog
        open={mainPickerOpen}
        onOpenChange={setMainPickerOpen}
        carSize={carSize as any}
        bonusOnly={false}
        onSelect={handleAddMain}
      />
      <ServicePickerDialog
        open={bonusPickerOpen}
        onOpenChange={setBonusPickerOpen}
        carSize={carSize as any}
        bonusOnly
        onSelect={handleAddBonus}
      />
    </div>
  );
}
