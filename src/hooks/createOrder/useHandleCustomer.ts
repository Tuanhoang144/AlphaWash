"use client";

import { useState } from "react";
import { CustomerDTO } from "@/types/OrderResponse";
import { useCustomerManager } from "@/services/useCustomerManager";
import { addToast } from "@heroui/toast";
import { isValidVietnamesePhone } from "@/shared/utils/checkValidate";

export function useCustomerSearch(
  onCustomerSelect: (customer: CustomerDTO | null) => void,
  onClose?: () => void
) {
  const { getCustomersByPhoneOrPlate, createCustomer } = useCustomerManager();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerDTO[]>([]);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const [newCustomer, setNewCustomer] = useState<Partial<CustomerDTO>>({
    name: "",
    phone: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Hàm tìm kiếm khách hàng theo số điện thoại hoặc biển số xe
  const search = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const results = await getCustomersByPhoneOrPlate(searchTerm.trim());
      const processed = Array.isArray(results?.[0]) ? results[0] : results;
      if (!Array.isArray(processed)) return;
      setSearchResults(processed.slice(0, 20));
      setTotalSearchResults(processed.length);
    } catch (err: any) {
      console.error("Search error:", err);
      addToast({
        title: "Lỗi tìm kiếm",
        description: err.message || "Không tìm thấy khách hàng",
        color: "danger",
      });
      setSearchResults([]);
      setTotalSearchResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  // Hàm chọn khách hàng từ kết quả tìm kiếm
  const select = (customer: CustomerDTO | null) => {
    onCustomerSelect(customer);
    onClose?.();
    reset();
  };

  // Hàm tạo khách hàng mới
  const create = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      addToast({
        title: "Thiếu thông tin",
        description: "Nhập đầy đủ tên và số điện thoại.",
        color: "warning",
      });
      return;
    }

    if (!isValidVietnamesePhone(newCustomer.phone)) {
      setPhoneError("Số điện thoại không hợp lệ");
      return;
    }

    setIsCreating(true);
    try {
      const created = await createCustomer({
        customerName: newCustomer.name,
        phone: newCustomer.phone,
      });
      if (!created) throw new Error("Không thể tạo khách hàng");
      select({
        id: created.id,
        name: created.customerName,
        phone: created.phone,
        vehicles: created.vehicles || [],
      });
      addToast({
        title: "Thành công",
        description: `Khách hàng ${newCustomer.name} đã được tạo.`,
        color: "success",
      });
    } catch (err: any) {
      addToast({
        title: "Lỗi tạo khách hàng",
        description: err.message || "Vui lòng thử lại.",
        color: "danger",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Hàm đặt lại trạng thái tìm kiếm và tạo khách hàng
  const reset = () => {
    setSearchTerm("");
    setSearchResults([]);
    setTotalSearchResults(0);
    setNewCustomer({ name: "", phone: "" });
    setPhoneError(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    totalSearchResults,
    isSearching,
    search,
    newCustomer,
    setNewCustomer,
    phoneError,
    setPhoneError,
    isCreating,
    create,
    select,
    reset,
  };
}

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
