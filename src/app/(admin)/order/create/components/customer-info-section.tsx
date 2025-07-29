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
import { useCustomerManager } from "@/services/useCustomerManager";
import { CustomerDTO } from "@/types/OrderResponse";
import { addToast } from "@heroui/toast";

interface CustomerInfoSectionProps {
  customer: CustomerDTO | null;
  onCustomerChange: (customer: CustomerDTO | null) => void;
}

export default function CustomerInfoSection({
  customer,
  onCustomerChange,
}: CustomerInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<CustomerDTO>>(
    {}
  );
  const [isOpen, setIsOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const { updateCustomer } = useCustomerManager();

  const isValidVietnamesePhone = (phone: string) => {
    const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return regex.test(phone.trim());
  };

  const handleEditStart = () => {
    setEditingCustomer(customer || {});
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (editingCustomer.name && editingCustomer.phone) {
      if (!editingCustomer.name || !editingCustomer.phone) {
        addToast({
          title: "Thiếu thông tin",
          description: "Vui lòng nhập tên và số điện thoại khách hàng.",
          color: "warning",
        });
        return;
      }

      if (!isValidVietnamesePhone(editingCustomer.phone)) {
        setPhoneError("Số điện thoại không hợp lệ");
        return;
      }

      if (!customer?.id) {
        addToast({
          title: "Không tìm thấy khách hàng",
          description: "Không thể cập nhật thông tin khách hàng.",
          color: "warning",
        });
        return;
      }
      try {
        await updateCustomer(customer.id, {
          customerName: editingCustomer.name,
          phone: editingCustomer.phone,
        });

        onCustomerChange({
          id: customer.id,
          name: editingCustomer.name,
          phone: editingCustomer.phone,
          vehicles: customer.vehicles,
        });

        addToast({
          title: "Cập nhật thành công",
          description: "Thông tin khách hàng đã được cập nhật.",
          color: "success",
        });
      } catch (error) {
        console.error("Lỗi cập nhật khách hàng:", error);
        addToast({
          title: "Cập nhật thất bại",
          description: "Không thể cập nhật thông tin khách hàng.",
          color: "danger",
        });
      } finally {
        setIsEditing(false);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingCustomer({});
    setIsEditing(false);
  };

  const updateEditingCustomer = (field: keyof CustomerDTO, value: string) => {
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
                      <Button size="sm" type="button" onClick={handleEditSave}>
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
                        value={editingCustomer.name || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateEditingCustomer("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại *</Label>
                      <Input
                        placeholder="Nhập số điện thoại"
                        value={editingCustomer.phone || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateEditingCustomer("phone", value);

                          if (!value || isValidVietnamesePhone(value)) {
                            setPhoneError(null);
                          } else {
                            setPhoneError("Số điện thoại không hợp lệ");
                          }
                        }}
                      />
                      {phoneError && (
                        <p className="text-sm text-red-600 mt-1">
                          {phoneError}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tên khách hàng</Label>
                      <div className="p-2 bg-gray-50 rounded-md">
                        {customer.name}
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
