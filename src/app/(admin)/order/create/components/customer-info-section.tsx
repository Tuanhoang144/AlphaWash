"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { User, Edit, Save, X, Plus, Minus } from "lucide-react";
import CustomerSearchDialog from "./customer-search-dialog";
import type { Customer } from "../types/invoice";
import { useCustomerManager } from "@/services/useCustomerManager";

interface CustomerInfoSectionProps {
  customer: Customer | null;
  onCustomerChange: (customer: Customer | null) => void;
}

export default function CustomerInfoSection({
  customer,
  onCustomerChange,
}: CustomerInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer>>({});
  const [isOpen, setIsOpen] = useState(false);
  const { updateCustomer } = useCustomerManager();

  const handleEditStart = () => {
    setEditingCustomer(customer || {});
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (editingCustomer.customerName && editingCustomer.phone) {
      if (!customer?.customerId) {
        alert("Không tìm thấy ID khách hàng");
        return;
      }

      try {
        await updateCustomer(customer.customerId, {
          customerName: editingCustomer.customerName,
          phone: editingCustomer.phone,
        });

        onCustomerChange({
          customerId: customer.customerId,
          customerName: editingCustomer.customerName,
          phone: editingCustomer.phone,
          vehicles: customer.vehicles,
        });

        alert("Cập nhật khách hàng thành công!");
      } catch (error) {
        console.error("Lỗi cập nhật khách hàng:", error);
        alert("Cập nhật khách hàng thất bại!");
      } finally {
        setIsEditing(false);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingCustomer({});
    setIsEditing(false);
  };

  const updateEditingCustomer = (field: keyof Customer, value: string) => {
    setEditingCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông Tin Khách Hàng
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Customer Search/Selection */}
            <CustomerSearchDialog
              onCustomerSelect={onCustomerChange}
              selectedCustomer={customer}
            />

            {/* Customer Details Form */}
            {customer && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Chi tiết khách hàng</h4>
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditStart}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleEditSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tên khách hàng *</Label>
                      <Input
                        placeholder="Nhập tên khách hàng"
                        value={editingCustomer.customerName || ""}
                        onChange={(e) =>
                          updateEditingCustomer("customerName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại *</Label>
                      <Input
                        placeholder="Nhập số điện thoại"
                        value={editingCustomer.phone || ""}
                        onChange={(e) =>
                          updateEditingCustomer("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tên khách hàng</Label>
                      <div className="p-2 bg-gray-50 rounded-md">
                        {customer.customerName}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <div className="p-2 bg-gray-50 rounded-md">
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!customer && (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  Hóa đơn sẽ được tạo không có thông tin khách hàng
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
