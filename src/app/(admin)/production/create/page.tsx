"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  ArrowLeft,
  Car,
  User,
  Calendar,
  Wrench,
  Phone,
  X,
  Clock,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Production } from "@/types/Production";
import { useRouter } from "next/navigation";
import { useProductionManager } from "@/services/production-manager";
import { addToast } from "@heroui/react";

interface WashServiceFormProps {
  record?: Production | null;
  mode: "create" | "edit";
  onSave?: (data: Partial<Production>) => void;
  onCancel?: () => void;
}

export default function WashServiceForm({
  record,
  mode,
  onSave,
  onCancel,
}: WashServiceFormProps) {
  const [formData, setFormData] = useState<Partial<Production>>({
    stt: record?.stt || "",
    date: record?.date || new Date().toISOString().split("T")[0],
    timeIn: record?.timeIn || "",
    timeOut: record?.timeOut || "",
    plateNumber: record?.plateNumber || "",
    customerName: record?.customerName || "",
    sdt: record?.sdt || "",
    carCompany: record?.carCompany || "",
    vehicleLine: record?.vehicleLine || "",
    service: record?.service || "",
    carSize: record?.carSize || "M",
    status: record?.status || "Chờ xử lý",
    employees: record?.employees || [], // Changed from employee
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof Production, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.plateNumber?.trim()) {
      newErrors.plateNumber = "Biển số xe là bắt buộc";
    }
    if (!formData.customerName?.trim()) {
      newErrors.customerName = "Tên khách hàng là bắt buộc";
    }
    if (!formData.sdt?.trim()) {
      newErrors.sdt = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.sdt.replace(/\s/g, ""))) {
      newErrors.sdt = "Số điện thoại không hợp lệ";
    }
    if (!formData.carCompany?.trim()) {
      newErrors.carCompany = "Hãng xe là bắt buộc";
    }
    if (!formData.vehicleLine?.trim()) {
      newErrors.vehicleLine = "Dòng xe là bắt buộc";
    }
    if (!formData.service?.trim()) {
      newErrors.service = "Dịch vụ là bắt buộc";
    }
    if (!formData.employees?.length) {
      newErrors.employees = "Phải chọn ít nhất một nhân viên phụ trách";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const router = useRouter();
  const { createProduction, updateProduction } = useProductionManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        let result;
        if (mode === "create") {
          result = await createProduction(formData); // gọi API tạo mới
          addToast({
            title: "Tạo phiếu rửa xe thành công",
            description: "Phiếu rửa xe đã được tạo thành công.",
            color: "success",
          });
          onSave?.(result);
          router.push("/production/bang-thong-ke");
        } else if (mode === "edit" && record?.id) {
          result = await updateProduction(record.id, formData); // gọi API cập nhật
          addToast({
            title: "Cập nhật phiếu rửa xe thành công",
            description: "Phiếu rửa xe đã được cập nhật.",
            color: "success",
          });
          onSave?.(result);
          router.push("/production/bang-thong-ke");
        }
      } catch (error) {
        console.error("Lỗi khi lưu production:", error);
        addToast({
          title: mode === "create" ? "Tạo phiếu thất bại" : "Cập nhật thất bại",
          description: "Vui lòng thử lại.",
          color: "danger",
        });
      }
    }
  };

  const carSizeOptions = [
    { value: "S", label: "Nhỏ (S)", description: "" },
    { value: "M", label: "Vừa (M)", description: "" },
    { value: "L", label: "Lớn (L)", description: "" },
  ];

  const statusOptions = ["Chờ xử lý", "Đang xử lý", "Hoàn thành"];

  const serviceOptions = [
    "Rửa Nhanh | Quick Wash",
    "Rửa Tiêu Chuẩn | Standard Wash",
    "Rửa Chuyên Sâu | Deep Wash",
  ];

  const employeeOptions = ["Vinh", "An", "Huy"];

  const handleEmployeeToggle = (employee: string, checked: boolean) => {
    setFormData((prev) => {
      const currentEmployees = prev.employees || [];
      if (checked) {
        return { ...prev, employees: [...currentEmployees, employee] };
      } else {
        return {
          ...prev,
          employees: currentEmployees.filter((e) => e !== employee),
        };
      }
    });
    // Clear error when user selects employees
    if (errors.employees) {
      setErrors((prev) => ({ ...prev, employees: "" }));
    }
  };

  const removeEmployee = (employeeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      employees: (prev.employees || []).filter((e) => e !== employeeToRemove),
    }));
  };

  return (
    <SidebarInset>
      <header className="sticky z-10 top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/production/bang-thong-ke">
                Theo dõi xe ra vào xưởng
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbPage className="hidden md:block">
              <BreadcrumbLink href="#">Tạo mới phiếu rửa xe</BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {mode === "create"
                  ? "Tạo phiếu rửa xe mới"
                  : "Chỉnh sửa phiếu rửa xe"}
              </h1>
              <p className="text-muted-foreground">
                {mode === "create"
                  ? "Nhập thông tin để tạo phiếu rửa xe mới"
                  : `Chỉnh sửa thông tin phiếu ${record?.stt}`}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin khách hàng
                  </CardTitle>
                  <CardDescription>
                    Nhập thông tin liên hệ của khách hàng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">
                        Tên khách hàng <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customerName"
                        value={formData.customerName || ""}
                        onChange={(e) =>
                          handleInputChange("customerName", e.target.value)
                        }
                        placeholder="Nhập tên khách hàng"
                        className={errors.customerName ? "border-red-500" : ""}
                      />
                      {errors.customerName && (
                        <p className="text-sm text-red-500">
                          {errors.customerName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sdt">
                        Số điện thoại <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="sdt"
                          value={formData.sdt || ""}
                          onChange={(e) =>
                            handleInputChange("sdt", e.target.value)
                          }
                          placeholder="0901234567"
                          className={`pl-10 ${
                            errors.sdt ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.sdt && (
                        <p className="text-sm text-red-500">{errors.sdt}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Thông tin xe
                  </CardTitle>
                  <CardDescription>
                    Nhập thông tin chi tiết về xe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plateNumber">
                        Biển số xe <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="plateNumber"
                        value={formData.plateNumber || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "plateNumber",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="30A-12345"
                        className={`font-mono ${
                          errors.plateNumber ? "border-red-500" : ""
                        }`}
                      />
                      {errors.plateNumber && (
                        <p className="text-sm text-red-500">
                          {errors.plateNumber}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Kích thước xe <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.carSize}
                        onValueChange={(value) =>
                          handleInputChange("carSize", value)
                        }
                        className="flex gap-4"
                      >
                        {carSizeOptions.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                            />
                            <Label
                              htmlFor={option.value}
                              className="cursor-pointer"
                            >
                              <div>
                                <div className="font-medium">
                                  {option.value}
                                </div>
                                {/* <div className="text-xs text-muted-foreground">{option.description}</div> */}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carCompany">
                        Hãng xe <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="carCompany"
                        value={formData.carCompany || ""}
                        onChange={(e) =>
                          handleInputChange("carCompany", e.target.value)
                        }
                        placeholder="Toyota, Honda, Ford..."
                        className={errors.carCompany ? "border-red-500" : ""}
                      />
                      {errors.carCompany && (
                        <p className="text-sm text-red-500">
                          {errors.carCompany}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleLine">
                        Dòng xe <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="vehicleLine"
                        value={formData.vehicleLine || ""}
                        onChange={(e) =>
                          handleInputChange("vehicleLine", e.target.value)
                        }
                        placeholder="Camry, CR-V, Ranger..."
                        className={errors.vehicleLine ? "border-red-500" : ""}
                      />
                      {errors.vehicleLine && (
                        <p className="text-sm text-red-500">
                          {errors.vehicleLine}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Thông tin dịch vụ
                  </CardTitle>
                  <CardDescription>
                    Chọn dịch vụ và nhân viên phụ trách
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">
                        Dịch vụ <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.service}
                        onValueChange={(value) =>
                          handleInputChange("service", value)
                        }
                      >
                        <SelectTrigger
                          className={errors.service ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Chọn dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceOptions.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.service && (
                        <p className="text-sm text-red-500">{errors.service}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Nhân viên phụ trách{" "}
                        <span className="text-red-500">*</span>
                      </Label>

                      {/* Selected employees display */}
                      {formData.employees && formData.employees.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.employees.map((employee) => (
                            <Badge
                              key={employee}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {employee}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => removeEmployee(employee)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Employee selection checkboxes */}
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {employeeOptions.map((employee) => (
                          <div
                            key={employee}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={employee}
                              checked={
                                formData.employees?.includes(employee) || false
                              }
                              onCheckedChange={(checked) =>
                                handleEmployeeToggle(
                                  employee,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={employee}
                              className="cursor-pointer flex-1"
                            >
                              {employee}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {errors.employees && (
                        <p className="text-sm text-red-500">
                          {errors.employees}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Status and Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Thời gian & Trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Ngày thực hiện</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date || ""}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeIn">
                      Thời gian vào <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="timeIn"
                        type="time"
                        value={formData.timeIn || ""}
                        onChange={(e) =>
                          handleInputChange("timeIn", e.target.value)
                        }
                        className={`flex-1 ${
                          errors.timeIn ? "border-red-500" : ""
                        }`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
                          handleInputChange("timeIn", currentTime);
                        }}
                        className="px-3"
                        title="Lấy thời gian hiện tại"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.timeIn && (
                      <p className="text-sm text-red-500">{errors.timeIn}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeOut">Thời gian ra</Label>
                    <div className="flex gap-2">
                      <Input
                        id="timeOut"
                        type="time"
                        value={formData.timeOut || ""}
                        onChange={(e) =>
                          handleInputChange("timeOut", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
                          handleInputChange("timeOut", currentTime);
                        }}
                        className="px-3"
                        title="Lấy thời gian hiện tại"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy bỏ
              </Button>
            )}
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {mode === "create" ? "Tạo phiếu" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </SidebarInset>
  );
}
