"use client";

import useHandleService from "@/hooks/createOrder/orderDetail/orderService/useHandleService";
import { OrderServiceDTO } from "@/types/order/OrderServiceDTO";
import { VehicleDTO } from "@/types/vehicle/VehicleDTO";
import { Label } from "@/components/ui/label";
import { Select } from "antd";
import { formatPrice } from "@/shared/utils/checkValidate";

interface Props {
  orderService: OrderServiceDTO;
  handleOrderServiceChange: (service: OrderServiceDTO) => void;
  vehicle: VehicleDTO;
}

export default function ServiceSelection({
  orderService,
  handleOrderServiceChange,
  vehicle,
}: Props) {
  const {
    optionServices,
    selectedService,
    handleSelectService,
    optionServiceCatalogs,
    selectedServiceCatalog,
  } = useHandleService(vehicle, orderService, handleOrderServiceChange);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Chọn dịch vụ *</Label>
          <Select
            showSearch
            placeholder="Chọn dịch vụ"
            optionFilterProp="label"
            onChange={(value: any) => {
              handleSelectService(value);
            }}
            value={selectedService?.code || undefined}
            style={{ width: "100%" }}
            size="large"
          >
            {optionServices.map((opt) => {
              return (
                <Select.Option
                  key={opt.id}
                  value={opt.code}
                  label={opt.serviceName}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`font-medium`}>{opt.serviceName}</span>
                    {opt.duration && (
                      <span className="text-xs text-gray-500">
                        {opt.duration}
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
              !selectedService?.code ? "Chọn dịch vụ trước" : "Chọn kích thước"
            }
            value={selectedServiceCatalog?.id || undefined}
            style={{ width: "100%" }}
            size="large"
          >
            {optionServiceCatalogs.map((c) => (
              <Select.Option key={c.id} value={c.id} label={c.size}>
                <div className="flex justify-between items-center w-full">
                  <span className="flex items-center">{c.size}</span>
                  <span className="font-medium text-green-600 ml-2">
                    {formatPrice(c.listedPrice)}đ
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
