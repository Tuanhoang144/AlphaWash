"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { User, Minus, Plus } from "lucide-react";
import { CustomerDTO } from "@/types/OrderResponse";
import CustomerInfoForm from "./ui/CustomerInfoForm";
import CustomerInfoView from "./ui/CustomerInfoView";
import { useCustomerInfo } from "@/shared/hooks/order/useCustomerInfo";
import CustomerSearchDialog from "./CustomerSearchDialog";

interface Props {
  customer?: CustomerDTO | null;
  onCustomerChange: (customer: CustomerDTO | null) => void;
}

//Component chính để hiển thị thông tin khách hàng
//Trong phần tạo hóa đơn, cần phải tìm kiếm thông tin khác hàng trước khi hiển thị thông tin chi tiết khách hàng
//Trong phần chỉnh sữa hóa đơn, thông tin khách hàng đã có sẵn và chỉ cần hiển thị chi tiết khách hàng (có thể chỉnh sữa thông tin khác hàng)
export default function CustomerInfoSection({
  customer,
  onCustomerChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const {
    isEditing,
    editingCustomer,
    phoneError,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    updateEditingCustomer,
  } = useCustomerInfo(customer ?? null, onCustomerChange);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Thông Tin Khách Hàng
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Mở dialog tìm kiếm/tao mới khách hàng */}
            <CustomerSearchDialog
              onCustomerSelect={onCustomerChange}
              selectedCustomer={customer}
            />

            {customer ? (
              isEditing ? (
                 // Hiển thị form chỉnh sửa khi có customer và đang ở chế độ edit
                <CustomerInfoForm
                  editingCustomer={editingCustomer}
                  phoneError={phoneError}
                  updateEditingCustomer={updateEditingCustomer}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                />
              ) : (
                // Hiển thị thông tin khách hàng khi có customer nhưng không ở chế độ edit
                <CustomerInfoView
                  customer={customer}
                  onEdit={handleEditStart}
                />
              )
            ) : (
              // Hiển thị placeholder khi chưa chọn customer
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                Hóa đơn sẽ được tạo không có thông tin khách hàng
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
