// Format ngắn gọn: 120000 → "120k", 2500000 → "2.5M"
export const formatShortVND = (amount?: number): string => {
  if (!amount) return '—'
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return m % 1 === 0 ? `${m}M` : `${parseFloat(m.toFixed(1))}M`
  }
  if (amount >= 1_000) {
    const k = amount / 1_000
    return k % 1 === 0 ? `${k}k` : `${parseFloat(k.toFixed(0))}k`
  }
  return `${amount}`
}

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
