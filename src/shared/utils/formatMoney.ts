//Công cụ cho format số tiền
export const formatNumber = (value: number): string => {
  return value.toLocaleString("vi-VN");
};

export const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/\./g, "");
  return parseInt(cleaned) || 0;
};

export const validateNumericInput = (value: string): boolean => {
  // Chỉ cho phép số và dấu chấm
  return /^[\d.]*$/.test(value);
};

export const handleNumericInput = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  // Chặn các ký tự không phải số, dấu chấm, Backspace, Delete, Tab, Enter, Arrow keys
  if (
    !/[\d.]/.test(e.key) &&
    ![
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ].includes(e.key)
  ) {
    e.preventDefault();
  }
};

export const formatMoney = (v: number) => {
  return v.toLocaleString("vi-VN") + "đ";
}