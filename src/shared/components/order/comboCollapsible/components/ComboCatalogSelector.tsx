"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { Select } from "antd";
import { formatPrice } from "@/shared/utils/checkValidate";
import {
  formatNumber,
  handleNumericInput,
  parseFormattedNumber,
  validateNumericInput,
} from "@/shared/utils/formatMoney";
import type { OrderComboDTO } from "@/shared/types/ComboApi";

const { Option } = Select;

type Props = {
  combo: OrderComboDTO;
  comboOptions: any[];
  catalogOptions: any[];
  loadingCombos: boolean;
  loadingCatalogs: boolean;
  priceDiff: number;
  priceValidationError: string;

  onSelectCombo: (comboCode: string) => void;
  onSelectCatalog: (catalogCode: string) => void;

  onToggleAdjustedPrice: (enabled: boolean) => void;
  onSetAdjustedPrice: (price: number) => void;
  onSetAdjustedPriceReason: (reason: string) => void;
};

export default function ComboCatalogSelector({
  combo,
  comboOptions,
  catalogOptions,
  loadingCombos,
  loadingCatalogs,
  priceDiff,
  priceValidationError,
  onSelectCombo,
  onSelectCatalog,
  onToggleAdjustedPrice,
  onSetAdjustedPrice,
  onSetAdjustedPriceReason,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Chọn combo + catalog theo size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Chọn combo *</Label>
          <Select
            showSearch
            placeholder={loadingCombos ? "Đang tải..." : "Chọn combo"}
            optionFilterProp="label"
            onChange={(value: any) => onSelectCombo(String(value))}
            value={combo.comboCode || undefined}
            loading={loadingCombos}
            style={{ width: "100%" }}
            size="large"
          >
            {comboOptions.map((opt) => (
              <Option key={opt.id} value={opt.value} label={opt.label}>
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-gray-500">
                    {opt.durationDays} ngày
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Bảng giá theo kích thước</Label>
          <Select
            placeholder={
              !combo.comboCode
                ? "Chọn combo trước"
                : loadingCatalogs
                ? "Đang tải..."
                : "Chọn kích thước"
            }
            value={combo.catalogCode || undefined}
            disabled={!combo.comboCode || loadingCatalogs}
            loading={loadingCatalogs}
            style={{ width: "100%" }}
            size="large"
            onChange={(value: any) => onSelectCatalog(String(value))}
          >
            {catalogOptions.map((c) => (
              <Option key={c.id} value={c.value} label={c.label}>
                <div className="flex justify-between items-center w-full">
                  <span className="flex items-center">{c.label}</span>
                  <span className="font-medium text-green-600 ml-2">
                    {formatPrice(c.listedPrice)}đ
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* chỉnh giá ngoại lệ */}
      {combo.catalogCode ? (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <Label className="font-medium">Chỉnh sửa giá ngoại lệ</Label>
            </div>
            <Switch
              checked={combo.adjustedPriceFlag || false}
              onCheckedChange={onToggleAdjustedPrice}
            />
          </div>

          {combo.adjustedPriceFlag ? (
            <div className="space-y-4 bg-orange-50 p-4 rounded-md border border-orange-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá ngoại lệ *</Label>
                  <Input
                    type="text"
                    placeholder="Nhập giá mới"
                    value={formatNumber(combo.adjustedPrice ?? 0)}
                    onKeyDown={handleNumericInput}
                    className={`border-orange-300 focus:border-orange-500 ${
                      priceValidationError ? "border-red-500" : ""
                    }`}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (!validateNumericInput(inputValue)) return;
                      const v = parseFormattedNumber(inputValue);
                      if (v >= 0) onSetAdjustedPrice(v);
                    }}
                    onBlur={(e) => {
                      const v = parseFormattedNumber(e.target.value);
                      if (v < 0) onSetAdjustedPrice(0);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chênh lệch giá</Label>
                  <div
                    className={`p-2 rounded-md font-medium ${
                      priceDiff < 0
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {priceDiff >= 0 ? "+" : "-"}
                    {formatPrice(Math.abs(priceDiff))} VNĐ
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={priceValidationError ? "text-red-600" : ""}>
                  Lý do chỉnh sửa giá *
                </Label>
                <Textarea
                  value={combo.adjustedPriceReason || ""}
                  onChange={(e) => onSetAdjustedPriceReason(e.target.value)}
                  placeholder="Nhập lý do (khuyến mãi, VIP...)"
                  className={`border-orange-300 focus:border-orange-500 ${
                    priceValidationError ? "border-red-500" : ""
                  }`}
                  rows={3}
                />
                {priceValidationError ? (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{priceValidationError}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
