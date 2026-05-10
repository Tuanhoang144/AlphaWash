import { ServiceDTO } from "@/types/OrderResponse";

/**
 * Validate số điện thoại Việt Nam
 * Hợp lệ: Bắt đầu bằng 0 hoặc +84, theo sau là 3,5,7,8,9 và 8 chữ số
 * Ví dụ hợp lệ: "0912345678", "+84912345678"
 * Ví dụ không hợp lệ: "1234567890", "098765432"
 * */
const isValidVietnamesePhone = (phone: string) =>
  /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone.trim());

/**
 * Validate biển số xe theo định dạng Việt Nam
 * Ví dụ hợp lệ: "29A-12345", "30F12345", "79C-99999.99"
 * Ví dụ không hợp lệ: "ABC-1234", "123-ABCD"
 * */
const isValidLicensePlate = (plate: string): boolean => {
  const regex = /^[0-9]{2}[A-Z]{1,2}[-]?[0-9]{3,5}(\.[0-9]{2})?$/i;
  return regex.test(plate.replace(/\s/g, "").toUpperCase());
};

/**
 * Định dạng biển số xe: loại bỏ khoảng trắng và chuyển thành chữ in hoa
 * Ví dụ: " 29a 12345 " => "29A12345"
 */
const formatLicensePlate = (plate: string): string => {
  return plate.replace(/\s/g, "").toUpperCase();
};

/**
 * Validate giá nhập vào (chỉ cho phép số dương)
 */
const validateNumericPrice = (value: string): boolean => {
  if (!value) return true;
  const num = Number.parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Format số tiền theo định dạng Việt Nam
 */
const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) return "0";
  return price.toLocaleString("vi-VN");
};

/**
 * Parse số tiền từ chuỗi định dạng
 */
const parsePrice = (value: string): number => {
  const cleaned = value.replace(/\D/g, "");
  return Number.parseInt(cleaned, 10) || 0;
};

const isValidAdjustedPrice = (service: ServiceDTO): boolean => {
  if (!service.adjustedPriceFlag) {
    return true;
  }
  return (
    service.adjustedPrice !== undefined &&
    service.adjustedPrice >= 0 &&
    service.adjustedPriceReason?.trim().length > 0
  );
};

export {
  isValidVietnamesePhone,
  isValidLicensePlate,
  isValidAdjustedPrice,
  formatLicensePlate,
  validateNumericPrice,
  formatPrice,
  parsePrice,
};
