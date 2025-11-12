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
import type { ServiceAll } from "@/types/ServiceAll";
import { useServiceManager } from "@/services/useServiceAll";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatNumber,
  handleNumericInput,
  parseFormattedNumber,
  validateNumericInput,
} from "@/shared/utils/formatMoney";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  services: ServiceAll[] | null | undefined;
  onSave: (services: {
    serviceTypeCode: string;
    serviceCode: string;
    serviceName: string;
    duration: string;
    note?: string;
    sizes: {
      S?: { price: number };
      M?: { price: number };
      L?: { price: number };
    };
  }) => void;
  onDelete: (serviceCode: string) => void;
}

interface ValidationErrors {
  serviceName?: string;
  serviceTypeName?: string;
  duration?: string;
  priceS?: string;
  priceM?: string;
  priceL?: string;
}

interface ServiceType {
  id: number;
  code: string;
  serviceTypeName: string;
}

export function ServiceDialog({
  isOpen,
  onOpenChange,
  services,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState({
    serviceCode: "",
    serviceName: "",
    duration: "",
    note: "",
    serviceTypeName: "",
    serviceTypeCode: "",
    priceS: 0,
    priceM: 0,
    priceL: 0,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getAllServiceType } = useServiceManager();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoadingServiceTypes, setIsLoadingServiceTypes] = useState(false);
  const fetchServiceTypes = async () => {
    setIsLoadingServiceTypes(true);
    try {
      const data = await getAllServiceType();
      setServiceTypes(data);
    } catch (error) {
      console.error("Error fetching service types:", error);
    } finally {
      setIsLoadingServiceTypes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchServiceTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (services && services.length > 0) {
      const firstService = services[0];
      const sizeS = services.find((s) => s.size === "S");
      const sizeM = services.find((s) => s.size === "M");
      const sizeL = services.find((s) => s.size === "L");

      setForm({
        serviceCode: firstService.serviceCode,
        serviceName: firstService.serviceName,
        duration: firstService.duration,
        note: firstService.note || "",
        serviceTypeName: firstService.serviceTypeName,
        serviceTypeCode: firstService.serviceTypeCode,
        priceS: sizeS ? sizeS.price : 0,
        priceM: sizeM ? sizeM.price : 0,
        priceL: sizeL ? sizeL.price : 0,
      });
    }
    setErrors({});
  }, [services, isOpen]);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleServiceTypeChange = (value: string) => {
    const selectedType = serviceTypes.find((type) => type.code === value);
    if (selectedType) {
      setForm((prev) => ({
        ...prev,
        serviceTypeCode: selectedType.code,
        serviceTypeName: selectedType.serviceTypeName,
      }));
      if (errors.serviceTypeName) {
        setErrors((prev) => ({ ...prev, serviceTypeName: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.serviceName.trim()) {
      newErrors.serviceName = "Tên dịch vụ là bắt buộc";
    }

    if (!form.duration.trim()) {
      newErrors.duration = "Thời lượng là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        serviceTypeCode: form.serviceTypeCode,
        serviceCode: form.serviceCode,
        serviceName: form.serviceName.trim(),
        duration: form.duration.trim(),
        note: form.note.trim(),
        sizes: {
          S: { price: form.priceS || 0 },
          M: { price: form.priceM || 0 },
          L: { price: form.priceL || 0 },
        },
      };
      await onSave(payload);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (serviceCode: string) => {
    onDelete(serviceCode);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin dịch vụ và giá cho các size xe khác nhau.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Tên loại DV */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Loại dịch vụ <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <Select
                value={form.serviceTypeCode}
                onValueChange={handleServiceTypeChange}
                disabled={isLoadingServiceTypes}
              >
                <SelectTrigger
                  className={
                    errors.serviceTypeName
                      ? "border-red-500  w-full"
                      : " w-full"
                  }
                >
                  <SelectValue
                    placeholder={
                      isLoadingServiceTypes
                        ? "Đang tải..."
                        : "Chọn loại dịch vụ"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.serviceTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceTypeName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.serviceTypeName}
                </p>
              )}
            </div>
          </div>

          {/* Tên DV */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Tên Dịch Vụ <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <Input
                value={form.serviceName}
                onChange={(e) => handleChange("serviceName", e.target.value)}
                className={errors.serviceName ? "border-red-500" : ""}
                placeholder="Nhập tên dịch vụ"
              />
              {errors.serviceName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.serviceName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Giá theo Size <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3 space-y-4">
              {/* Size S */}
              <div className="flex items-center gap-4">
                <div className="w-16 flex items-center justify-center bg-green-100 text-green-700 rounded-md py-2 px-3 font-semibold">
                  S
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    value={form.priceS > 0 ? formatNumber(form.priceS) : ""}
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
                        handleChange("priceS", value);
                      }
                    }}
                    onBlur={(e) => {
                      // Double check khi blur
                      const value = parseFormattedNumber(e.target.value);
                      if (value < 0) {
                        handleChange("priceS", 0);
                      }
                    }}
                    placeholder="Giá cho size S (VNĐ)"
                    className={errors.priceS ? "border-red-500" : ""}
                  />
                </div>
              </div>

              {/* Size M */}
              <div className="flex items-center gap-4">
                <div className="w-16 flex items-center justify-center bg-blue-100 text-blue-700 rounded-md py-2 px-3 font-semibold">
                  M
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    value={form.priceM > 0 ? formatNumber(form.priceM) : ""}
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
                        handleChange("priceM", value);
                      }
                    }}
                    onBlur={(e) => {
                      // Double check khi blur
                      const value = parseFormattedNumber(e.target.value);
                      if (value < 0) {
                        handleChange("priceM", 0);
                      }
                    }}
                    placeholder="Giá cho size M (VNĐ)"
                    className={errors.priceM ? "border-red-500" : ""}
                  />
                </div>
              </div>

              {/* Size L */}
              <div className="flex items-center gap-4">
                <div className="w-16 flex items-center justify-center bg-orange-100 text-orange-700 rounded-md py-2 px-3 font-semibold">
                  L
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    value={form.priceL > 0 ? formatNumber(form.priceL) : ""}
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
                        handleChange("priceL", value);
                      }
                    }}
                    onBlur={(e) => {
                      // Double check khi blur
                      const value = parseFormattedNumber(e.target.value);
                      if (value < 0) {
                        handleChange("priceL", 0);
                      }
                    }}
                    placeholder="Giá cho size L (VNĐ)"
                    className={errors.priceL ? "border-red-500" : ""}
                  />
                </div>
              </div>

              {errors.priceS && (
                <p className="text-sm text-red-500">{errors.priceS}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Nhập 0 hoặc để trống nếu size đó không áp dụng cho dịch vụ này
              </p>
            </div>
          </div>

          {/* Thời lượng */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Thời lượng <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              <Input
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className={errors.duration ? "border-red-500" : ""}
                placeholder="Ví dụ: 60 phút, 2 giờ"
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ghi chú</Label>
            <Textarea
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              className="col-span-3"
              placeholder="Nhập ghi chú thêm (tùy chọn)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <div>
              <Button
                variant="destructive"
                type="button"
                onClick={() => handleDelete(form.serviceCode)}
              >
                <span className="text-white">Xóa dịch vụ</span>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
