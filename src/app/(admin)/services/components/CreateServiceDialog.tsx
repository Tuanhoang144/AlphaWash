"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useServiceManager } from "@/services/useServiceAll";
import { ServiceType } from "@/types/ServiceAll";
import { addToast } from "@heroui/toast";
import { formatNumber, handleNumericInput, parseFormattedNumber, validateNumericInput } from "@/shared/utils/formatMoney";
interface CreateServiceRequest {
  serviceTypeCode: string;
  serviceName: string;
  duration: string;
  size: string;
  price: number;
  note: string;
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: CreateServiceRequest) => void;
}

export function CreateServiceDialog({ isOpen, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<CreateServiceRequest>({
    serviceTypeCode: "",
    serviceName: "",
    duration: "",
    size: "",
    price: 0,
    note: "",
  });

  const { getAllServiceType } = useServiceManager();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadServiceTypes = async () => {
        try {
          setIsLoading(true);
          const types = await getAllServiceType();
          setServiceTypes(types || []);
        } catch (error) {
          console.error("Lỗi khi tải danh sách loại dịch vụ:", error);
          setServiceTypes([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadServiceTypes();
    }
  }, [isOpen, getAllServiceType]);

  const handleChange = (key: keyof CreateServiceRequest, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (
      !form.serviceTypeCode ||
      !form.serviceName ||
      !form.duration ||
      !form.size ||
      form.price <= 0
    ) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc!",
        color: "danger",
      });
      return;
    }

    onSave(form);
    onOpenChange(false);
    // Reset form
    setForm({
      serviceTypeCode: "",
      serviceName: "",
      duration: "",
      size: "",
      price: 0,
      note: "",
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setForm({
      serviceTypeCode: "",
      serviceName: "",
      duration: "",
      size: "",
      price: 0,
      note: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo mới dịch vụ</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo một dịch vụ mới trong hệ thống.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Mã loại dịch vụ */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Loại dịch vụ <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.serviceTypeCode}
              onValueChange={(value) => handleChange("serviceTypeCode", value)}
              disabled={isLoading}
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue
                  placeholder={
                    isLoading ? "Đang tải..." : "-- Chọn loại dịch vụ --"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.serviceTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tên dịch vụ */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Tên dịch vụ <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.serviceName}
              onChange={(e) => handleChange("serviceName", e.target.value)}
              placeholder="Nhập tên dịch vụ"
              className="col-span-3"
            />
          </div>

          {/* Thời lượng */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Thời lượng <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              placeholder="VD: 30m, 1h, 2h30m"
              className="col-span-3"
            />
          </div>

          {/* Kích thước xe */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Kích thước xe <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.size}
              onValueChange={(value) => handleChange("size", value)}
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="-- Chọn kích thước xe --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="L">L</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Giá tiền */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Giá tiền (VNĐ) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={form.price > 0 ? formatNumber(form.price) : ""}
              onKeyDown={handleNumericInput}
              onChange={(e) => {
                const inputValue = e.target.value;

                // Validate chỉ cho phép số và dấu chấm
                if (!validateNumericInput(inputValue)) {
                  return;
                }

                const value = parseFormattedNumber(inputValue);
                // Chỉ cho phép số dương hoặc 0
                if (value >= 0) {
                  handleChange("price", value);
                }
              }}
              onBlur={(e) => {
                // Double check khi blur
                const value = parseFormattedNumber(e.target.value);
                if (value < 0) {
                  handleChange("price", 0);
                }
              }}
              placeholder="Nhập giá tiền"
              className="col-span-3"
            />
          </div>

          {/* Ghi chú */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ghi chú</Label>
            <Textarea
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Mô tả chi tiết về dịch vụ..."
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Tạo dịch vụ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
