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
