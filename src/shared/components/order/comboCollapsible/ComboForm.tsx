"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Package, AlertTriangle } from "lucide-react";
import type {
  EmployeeDTO,
  OrderDetailDTO,
  ServiceDTO,
} from "@/types/OrderResponse";
import type { ComboApiItem } from "@/shared/types/ComboApi";
import EmployeeSelector from "@/shared/components/order/serviceCollapsible/ui/EmployeeSelector";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CatalogOption = {
  catalogCode: string;
  label: string;
  size: string;
  price: number;
  comboCode: string;
  comboName: string;
  durationDays: number;
};

type Props = {
  orderDetail: OrderDetailDTO;
  // Chọn combo => set/replace service[0]
  onSetComboService: (next: ServiceDTO) => void;
  // Chỉnh giá/flag/reason => patch vào service[0]
  onUpdateComboService: (patch: Partial<ServiceDTO>) => void;
  // Clear combo
  onClearCombo?: () => void;
  onStatusChange?: (status: string) => void;
  onEmployeeChange?: (employees: EmployeeDTO[]) => void;
  onNoteChange?: (note: string) => void;

  vehicleSize: string;
  hasCustomer: boolean;
  allCombos: ComboApiItem[] | null;
  loadingCombos: boolean;
};

export default function ComboForm({
  orderDetail,
  onSetComboService,
  onUpdateComboService,
  onClearCombo,
  onStatusChange,
  onEmployeeChange,
  onNoteChange,
  vehicleSize,
  hasCustomer,
  allCombos,
  loadingCombos,
}: Props) {
  // ===== comboItem từ orderDetail.service[0] =====
  const comboItem: any = orderDetail.service?.[0] ?? null;

  const selectedComboCatalogCode: string | null =
    comboItem?.serviceComboCatalog?.catalogCode ?? null;

  const adjustedEnabled = !!comboItem?.adjustedPriceFlag;
  const adjustedReason: string = comboItem?.adjustedPriceReason ?? "";
  const adjustedPriceRaw: number | undefined = comboItem?.adjustedPrice;

  // ========== options combo template ==========
  const comboOptions = useMemo(() => {
    const list: ComboApiItem[] = Array.isArray(allCombos) ? allCombos : [];
    return list
      .filter((c) => (c.status || "").toUpperCase() === "ACTIVE")
      .map((c) => ({
        comboCode: c.comboCode,
        comboName: c.comboName,
        durationDays: c.durationDays,
        catalogs: c.catalogs ?? [],
      }));
  }, [allCombos]);

  // ========== catalog options theo size ==========
  const catalogOptions = useMemo(() => {
    const opts: CatalogOption[] = [];

    for (const combo of comboOptions) {
      for (const cat of combo.catalogs ?? []) {
        if (vehicleSize && cat.size !== vehicleSize) continue;

        opts.push({
          catalogCode: cat.catalogCode,
          label: `${combo.comboName} • Size ${cat.size} • ${Number(
            cat.price
          ).toLocaleString("vi-VN")}đ`,
          size: cat.size,
          price: cat.price,
          comboCode: combo.comboCode,
          comboName: combo.comboName,
          durationDays: combo.durationDays,
        });
      }
    }

    return opts;
  }, [comboOptions, vehicleSize]);

  const selectedCatalog = useMemo(() => {
    if (!selectedComboCatalogCode) return null;
    return (
      catalogOptions.find((x) => x.catalogCode === selectedComboCatalogCode) ??
      null
    );
  }, [selectedComboCatalogCode, catalogOptions]);

  const listedPrice = selectedCatalog?.price ?? 0;

  // Giá hiển thị:
  // - nếu bật chỉnh giá: dùng adjustedPrice (fallback listedPrice)
  // - nếu tắt: hiển thị listedPrice
  const adjustedPrice = adjustedEnabled
    ? Number.isFinite(adjustedPriceRaw as any)
      ? (adjustedPriceRaw as number)
      : listedPrice
    : listedPrice;

  const priceDiff = adjustedPrice - listedPrice;

  const validationError = useMemo(() => {
    if (!hasCustomer) return "Mua combo yêu cầu chọn khách hàng trước.";
    if (!vehicleSize) return "Vui lòng chọn xe để xác định kích thước trước.";
    if (!selectedComboCatalogCode) return "Vui lòng chọn combo (theo size).";
    if (!adjustedEnabled) return "";

    if (!adjustedPrice || adjustedPrice <= 0) return "Giá ngoại lệ phải > 0.";
    if (!adjustedReason || adjustedReason.trim().length < 3)
      return "Vui lòng nhập lý do chỉnh giá (tối thiểu 3 ký tự).";
    return "";
  }, [
    hasCustomer,
    vehicleSize,
    selectedComboCatalogCode,
    adjustedEnabled,
    adjustedPrice,
    adjustedReason,
  ]);

  const onToggleAdjusted = (enabled: boolean) => {
    // bật => default = listedPrice, giữ reason nếu có
    // tắt => clear reason + set adjustedPrice = listedPrice
    onUpdateComboService({
      adjustedPriceFlag: enabled as any,
      adjustedPrice: enabled ? adjustedPriceRaw ?? listedPrice : listedPrice,
      adjustedPriceReason: enabled ? adjustedReason : "",
    } as any);
  };

  //Dùng đẻ update status
  const updateStatus = (status: string) => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };
  //Dùng để update nhân viên
  const updateEmployees = (employees: EmployeeDTO[]) => {
    if (onEmployeeChange) {
      onEmployeeChange(employees);
    }
  };
  //Dùng để update ghi chú
  const updateNote = (note: string) => {
    if (onNoteChange) {
      onNoteChange(note);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Mua Combo
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ====== chọn combo catalog theo size ====== */}
        <div className="space-y-2">
          <Label>Combo theo kích thước xe *</Label>

          <Select
            value={selectedComboCatalogCode ?? ""}
            onValueChange={(value) => {
              const code = value?.trim() || null;

              const cat =
                catalogOptions.find((x) => x.catalogCode === code) ?? null;
              if (!cat) {
                // clear combo
                onClearCombo?.();
                return;
              }

              // Khi chọn combo: set service[0] (combo item)
              // serviceComboCatalog: tối thiểu phải có catalogCode
              // (Nếu bạn muốn show comboName/price/services ngay, có thể gắn thêm các field vào đây)
              onSetComboService({
                serviceCatalog: null as any,
                serviceComboCatalog: {
                  catalogCode: cat.catalogCode,
                  comboName: cat.comboName,
                  size: cat.size,
                  price: cat.price,
                } as any,
                adjustedPrice: cat.price,
                adjustedPriceFlag: false,
                adjustedPriceReason: "",
              } as any);
            }}
            disabled={loadingCombos || !hasCustomer || !vehicleSize}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  !hasCustomer
                    ? "Chọn khách hàng trước"
                    : !vehicleSize
                    ? "Chọn xe để có size"
                    : loadingCombos
                    ? "Đang tải combo..."
                    : "Chọn combo"
                }
              />
            </SelectTrigger>

            <SelectContent>
              {catalogOptions.map((opt) => (
                <SelectItem key={opt.catalogCode} value={opt.catalogCode}>
                  {opt.label}
                </SelectItem>
              ))}

              {catalogOptions.length === 0 && !loadingCombos ? (
                <div className="p-3 text-sm text-gray-500">
                  Không có combo phù hợp với size: <b>{vehicleSize || "?"}</b>
                </div>
              ) : null}
            </SelectContent>
          </Select>

          {selectedCatalog ? (
            <div className="text-sm text-gray-600">
              <b>{selectedCatalog.comboName}</b> •{" "}
              {selectedCatalog.durationDays} ngày • Size{" "}
              <b>{selectedCatalog.size}</b> • Giá:{" "}
              <b>{Number(selectedCatalog.price).toLocaleString("vi-VN")}đ</b>
            </div>
          ) : null}
        </div>

        {/* ====== chỉnh giá ngoại lệ ====== */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <Label className="font-medium">Chỉnh giá ngoại lệ</Label>
            </div>
            <Switch
              checked={adjustedEnabled}
              onCheckedChange={onToggleAdjusted}
              disabled={!selectedCatalog || !hasCustomer}
            />
          </div>

          {adjustedEnabled ? (
            <div className="space-y-4 bg-orange-50 p-4 rounded-md border border-orange-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá ngoại lệ *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={String(adjustedPrice)}
                    onChange={(e) =>
                      onUpdateComboService({
                        adjustedPriceFlag: true as any,
                        adjustedPrice: Number(e.target.value || 0) as any,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chênh lệch</Label>
                  <div
                    className={`p-2 rounded-md font-medium ${
                      priceDiff < 0
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {priceDiff >= 0 ? "+" : "-"}
                    {Math.abs(priceDiff).toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lý do chỉnh giá *</Label>
                <Textarea
                  value={adjustedReason}
                  onChange={(e) =>
                    onUpdateComboService({
                      adjustedPriceFlag: true as any,
                      adjustedPriceReason: e.target.value as any,
                    })
                  }
                  placeholder="Ví dụ: VIP / giảm giá / thỏa thuận..."
                  rows={3}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* ====== lỗi validate ====== */}
        {validationError ? (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {validationError}
          </div>
        ) : null}

        {/* ====== employee/status/note ====== */}
        <div className="space-y-2">
          <EmployeeSelector
            selectedEmployees={orderDetail.employees}
            onEmployeesChange={updateEmployees}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trạng thái thi công</Label>
            <Select
              value={orderDetail.status || ""}
              onValueChange={(value) => updateStatus(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ thi công</SelectItem>
                <SelectItem value="PROCESSING">Đang thi công</SelectItem>
                <SelectItem value="DONE">Thi công xong</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              placeholder="Ghi chú thêm..."
              value={orderDetail.note || ""}
              onChange={(e) => updateNote(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
