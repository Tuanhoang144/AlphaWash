import dayjs, { Dayjs } from "dayjs";

/** HH:mm theo local, tránh giây */
export const getCurrentTime = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

/** Parse "YYYY-MM-DD" hoặc ISO có "T..." → Dayjs chỉ chứa phần ngày (không timezone) */
export const parseDateOnly = (dateString?: string): Dayjs | null => {
  if (!dateString) return null;
  const d = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  const [y, m, d2] = d.split("-").map(Number);
  if (!y || !m || !d2) return null;
  return dayjs().year(y).month(m - 1).date(d2);
};

/** Format Dayjs -> YYYY-MM-DD cho input BE */
export const toISODateInput = (d: Dayjs | null): string =>
  d ? d.format("YYYY-MM-DD") : "";

/** Loại bỏ phần .000+timezone khỏi chuỗi ISO datetime */
export const formatToLocalDateTime = (dateStr: string): string => {
  return dateStr.replace(/\.\d{3}.+$/, ''); 
}
