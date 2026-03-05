"use client";

import { OrderServiceDTO } from "@/types/order/OrderServiceDTO";
import { VehicleDTO } from "@/types/vehicle/VehicleDTO";
import { Label } from "@/components/ui/label";
import { Select } from "antd";
import { formatPrice } from "@/shared/utils/checkValidate";
import useHandleCombo from "@/hooks/createOrder/orderDetail/orderService/useHandleCombo";

interface Props {
  orderService: OrderServiceDTO;
  handleOrderServiceChange: (service: OrderServiceDTO) => void;
  vehicle: VehicleDTO;
}

export default function ComboSelection({
  orderService,
  handleOrderServiceChange,
  vehicle,
}: Props) {
  const {
    optionComboServices,
    selectedComboService,
    handleSelectCombo,
    optionComboCatalogs,
    selectedComboCatalog,
  } = useHandleCombo(vehicle, orderService, handleOrderServiceChange);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Chọn combo dịch vụ *</Label>
          <Select
            showSearch
            placeholder="Chọn combo dịch vụ"
            optionFilterProp="label"
            onChange={(value: any) => {
              handleSelectCombo(value);
            }}
            value={selectedComboService?.comboCode || undefined}
            style={{ width: "100%" }}
            size="large"
          >
            {optionComboServices.map((opt) => {
              return (
                <Select.Option
                  key={opt.comboCode}
                  value={opt.comboCode}
                  label={opt.comboName}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`font-medium`}>{opt.comboName}</span>
                    {opt.durationDays && (
                      <span className="text-xs text-gray-500">
                        {opt.durationDays} ngày
                      </span>
                    )}
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Bảng giá theo kích thước</Label>
          <Select
            placeholder={
              !selectedComboService?.comboCode ? "Chọn combo dịch vụ trước" : "Chọn kích thước"
            }
            value={selectedComboCatalog?.catalogCode || undefined}
            style={{ width: "100%" }}
            size="large"
          >
            {optionComboCatalogs.map((c) => (
              <Select.Option key={c.catalogCode} value={c.catalogCode} label={c.size}>
                <div className="flex justify-between items-center w-full">
                  <span className="flex items-center">{c.size}</span>
                  <span className="font-medium text-green-600 ml-2">
                    {formatPrice(c.price)}đ
                  </span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
