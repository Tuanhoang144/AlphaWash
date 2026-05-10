import { useState } from "react";
import { CustomerDTO } from "@/types/OrderResponse";
import { useCustomerManager } from "@/services/useCustomerManager";
import { addToast } from "@heroui/toast";
import { isValidVietnamesePhone } from "@/shared/utils/checkValidate";

export function useCustomerInfo(
  customer: CustomerDTO | null,
  onCustomerChange: (c: CustomerDTO | null) => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<CustomerDTO>>(
    {}
  );
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const { updateCustomer } = useCustomerManager();

  //Hàm bắt đầu chỉnh sửa thông tin khách hàng
  const handleEditStart = () => {
    setEditingCustomer(customer || {});
    setIsEditing(true);
  };

  //Hàm hủy chỉnh sửa thông tin khách hàng
  const handleEditCancel = () => {
    setEditingCustomer({});
    setIsEditing(false);
  };

  //Hàm cập nhật thông tin khách hàng khi chỉnh sửa
  const updateEditingCustomer = (field: keyof CustomerDTO, value: string) => {
    setEditingCustomer((prev) => ({ ...prev, [field]: value }));
    if (field === "phone") {
      setPhoneError(
        !value || isValidVietnamesePhone(value)
          ? null
          : "Số điện thoại không hợp lệ"
      );
    }
  };

  //Hàm lưu thông tin khách hàng sau khi chỉnh sửa
  const handleEditSave = async () => {
    if (!editingCustomer.name || !editingCustomer.phone) {
      addToast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên và số điện thoại",
        color: "warning",
      });
      return;
    }
    if (!isValidVietnamesePhone(editingCustomer.phone)) {
      setPhoneError("Số điện thoại không hợp lệ");
      return;
    }
    if (!customer?.id) return;

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
    } catch {
      addToast({
        title: "Cập nhật thất bại",
        description: "Không thể cập nhật thông tin khách hàng.",
        color: "danger",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return {
    isEditing,
    phoneError,
    editingCustomer,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    updateEditingCustomer,
  };
}
