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
import { Employee } from "@/types/Employee";
import { addToast } from "@heroui/react";

interface EmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: Omit<Employee, "id"> & { id?: number }) => void;
}

export function EmployeeDialog({
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
  const [error, setError] = useState("");
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
      setWorkStatus("");
      setNote("");
    }
  }, [employee, isOpen]);

  const handleSubmit = () => {
    if (!name || !phone) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        color: "danger",
      });
      return;
    }

    const newEmployeeData = {
      name,
      phone,
      bankName,
      bankAccount,
      dateOfBirth,   // ép về string
      identityNumber,
      joinDate,         // ép về string
      workStatus,
      note: note || "",
    };

    onSave(newEmployeeData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Chỉnh sửa nhân viên" : "Tạo mới nhân viên"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Cập nhật thông tin nhân viên."
              : "Điền thông tin để thêm nhân viên mới."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tên</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          {/* Phone */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Điện thoại</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
              type="tel"
              required

            />
          </div>
          {/* Bank */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ngân hàng</Label>
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Số tài khoản</Label>
            <Input
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="col-span-3"
            />
          </div>
          {/* Date of birth */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ngày sinh</Label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="col-span-3"
            />
          </div>
          {/* Identity */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">CMND/CCCD</Label>
            <Input
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              className="col-span-3"
            />
          </div>
          {/* Join Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ngày vào làm</Label>
            <Input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          {/* Work Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Trạng thái</Label>
            <Input
              value={workStatus}
              onChange={(e) => setWorkStatus(e.target.value)}
              className="col-span-3"
            />
          </div>
          {/* Note */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ghi chú</Label>
            <Textarea
              value={note || ""}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
