"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Employee } from "@/types/Employee";
import { addToast } from "@heroui/react";
import { AlertCircle } from "lucide-react";

interface EmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: Omit<Employee, "id"> & { id?: number }) => void;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  bankAccount?: string;
  identityNumber?: string;
  dateOfBirth?: string;
  joinDate?: string;
  workStatus?: string;
}

// Helper component for field with error - di chuyển ra ngoài component
const FieldWithError = ({ 
  children, 
  error 
}: { 
  children: React.ReactNode; 
  error?: string; 
}) => (
  <div>
    {children}
    {error && (
      <div className="flex items-start gap-1 mt-1 text-xs text-red-600">
        <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
        <span className="break-words">{error}</span>
      </div>
    )}
  </div>
);

export const EmployeeDialog = React.memo(function EmployeeDialog({
  isOpen,
  onOpenChange,
  employee,
  onSave,
}: EmployeeDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [workStatus, setWorkStatus] = useState("");
  const [note, setNote] = useState<string | null>("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const workStatusOptions = [
    { value: "Working", label: "Đang làm việc" },
    { value: "OnLeave", label: "Nghỉ phép" },
    { value: "Resigned", label: "Đã nghỉ việc" },
  ];
  
  useEffect(() => {
    if (employee) {
      setName(employee.name ?? "");
      setPhone(employee.phone ?? "");
      setBankName(employee.bankName ?? "");
      setBankAccount(employee.bankAccount ?? "");
      setDateOfBirth(employee.dateOfBirth?.substring(0, 10) ?? "");
      setIdentityNumber(employee.identityNumber ?? "");
      setJoinDate(employee.joinDate?.substring(0, 10) ?? "");
      setWorkStatus(employee.workStatus ?? "");
      setNote(employee.note ?? "");
    } else {
      setName("");
      setPhone("");
      setBankName("");
      setBankAccount("");
      setDateOfBirth("");
      setIdentityNumber("");
      setJoinDate("");
      setWorkStatus("Working"); // Mặc định là "Working" khi tạo mới
      setNote("");
    }
    // Reset errors khi mở dialog mới
    setErrors({});
  }, [employee, isOpen]);

  // Validation functions
  const validateName = useCallback((value: string): string | undefined => {
    if (!value.trim()) return "Tên nhân viên là bắt buộc";
    if (value.length > 100) return "Tên nhân viên không được vượt quá 100 ký tự";
    return undefined;
  }, []);

  const validatePhone = useCallback((value: string): string | undefined => {
    if (!value.trim()) return "Số điện thoại là bắt buộc";
    if (!/^0\d{9}$/.test(value)) return "Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0";
    return undefined;
  }, []);

  const validateBankAccount = useCallback((value: string): string | undefined => {
    if (value && value.trim() && !/^\d{6,20}$/.test(value)) {
      return "Số tài khoản ngân hàng không hợp lệ (6-20 chữ số)";
    }
    return undefined;
  }, []);

  const validateIdentityNumber = useCallback((value: string): string | undefined => {
    if (value && value.trim() && !/^\d{12}$/.test(value)) {
      return "Số căn cước công dân phải gồm đúng 12 chữ số";
    }
    return undefined;
  }, []);

  const validateDateOfBirth = useCallback((value: string): string | undefined => {
    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

      if (birthDate > today) {
        return "Ngày sinh không được lớn hơn ngày hiện tại";
      }
      if (birthDate > eighteenYearsAgo) {
        return "Nhân viên phải đủ 18 tuổi trở lên";
      }
    }
    return undefined;
  }, []);

  const validateJoinDate = useCallback((value: string): string | undefined => {
    if (value) {
      const joinDateObj = new Date(value);
      const today = new Date();

      if (joinDateObj > today) {
        return "Ngày vào làm không được lớn hơn ngày hiện tại";
      }
      if (dateOfBirth && joinDateObj < new Date(dateOfBirth)) {
        return "Ngày vào làm không được nhỏ hơn ngày sinh";
      }
    }
    return undefined;
  }, [dateOfBirth]);

  const validateWorkStatus = useCallback((value: string): string | undefined => {
    if (value && !["Working", "OnLeave", "Resigned"].includes(value)) {
      return "Trạng thái làm việc không hợp lệ";
    }
    return undefined;
  }, []);

  const validateAllFields = useCallback((): boolean => {
    const newErrors: FieldErrors = {
      name: validateName(name),
      phone: validatePhone(phone),
      bankAccount: validateBankAccount(bankAccount),
      identityNumber: validateIdentityNumber(identityNumber),
      dateOfBirth: validateDateOfBirth(dateOfBirth),
      joinDate: validateJoinDate(joinDate),
      workStatus: validateWorkStatus(workStatus),
    };

    // Remove undefined errors
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key as keyof FieldErrors] === undefined) {
        delete newErrors[key as keyof FieldErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, phone, bankAccount, identityNumber, dateOfBirth, joinDate, workStatus, validateName, validatePhone, validateBankAccount, validateIdentityNumber, validateDateOfBirth, validateJoinDate, validateWorkStatus]);

  const handleSubmit = useCallback(() => {
    if (!validateAllFields()) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đã nhập.",
        color: "danger",
      });
      return;
    }

    const newEmployeeData = {
      ...(employee?.id && { id: employee.id }), // Thêm id nếu đang chỉnh sửa
      name,
      phone,
      bankName,
      bankAccount,
      dateOfBirth,
      identityNumber,
      joinDate,
      workStatus,
      note: note || "",
    };

    onSave(newEmployeeData);
  }, [validateAllFields, employee?.id, name, phone, bankName, bankAccount, dateOfBirth, identityNumber, joinDate, workStatus, note, onSave]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {employee ? "Chỉnh sửa nhân viên" : "Tạo mới nhân viên"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {employee
              ? "Cập nhật thông tin nhân viên."
              : "Các trường có dấu * là bắt buộc."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          {/* Section: Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium border-b pb-1">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Name */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">
                  Tên nhân viên <span className="text-red-500">*</span>
                </Label>
                <FieldWithError error={errors.name}>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên nhân viên"
                    className={`h-8 text-sm w-full ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </FieldWithError>
              </div>

              {/* Phone */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <FieldWithError error={errors.phone}>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678 (10 số)"
                    type="tel"
                    maxLength={10}
                    className={`h-8 text-sm w-full ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </FieldWithError>
              </div>

              {/* Work Status */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">Trạng thái làm việc</Label>
                <FieldWithError error={errors.workStatus}>
                  <Select value={workStatus} onValueChange={setWorkStatus} >
                    <SelectTrigger className={`h-8 text-sm w-full ${errors.workStatus ? "border-red-500 focus:ring-red-500" : ""}`}>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {workStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWithError>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Identity Number */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">Số CCCD/CMND</Label>
                <FieldWithError error={errors.identityNumber}>
                  <Input
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    placeholder="12 chữ số"
                    className={`h-8 text-sm w-full ${errors.identityNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </FieldWithError>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">Ngày sinh</Label>
                <FieldWithError error={errors.dateOfBirth}>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={`h-8 text-sm w-full ${errors.dateOfBirth ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </FieldWithError>
              </div>

              {/* Join Date */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">Ngày vào làm</Label>
                <FieldWithError error={errors.joinDate}>
                  <Input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className={`h-8 text-sm w-full ${errors.joinDate ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </FieldWithError>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Note */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Ghi chú</Label>
                <Textarea
                  value={note || ""}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú về nhân viên (tùy chọn)"
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Section: Bank Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium border-b pb-1">Thông tin ngân hàng</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
              {/* Bank Name */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">Tên ngân hàng</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ví dụ: Vietcombank, Techcombank..."
                  className="h-8 text-sm w-full"
                />
              </div>

              {/* Bank Account */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">Số tài khoản</Label>
                <FieldWithError error={errors.bankAccount}>
                  <Input
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="6-20 chữ số"
                    className={`h-8 text-sm w-full ${errors.bankAccount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </FieldWithError>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="mr-2 h-8 text-sm"
          >
            Hủy
          </Button>
          <Button type="submit" onClick={handleSubmit} className="h-8 text-sm">
            {employee ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
