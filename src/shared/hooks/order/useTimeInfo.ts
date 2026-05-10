"use client";

import { getCurrentTime, parseDateOnly, toISODateInput } from "@/shared/utils/formatDate";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";

type OnChange = (field: string, value: string) => void;

export function useOrderInfo(
  orderDate: string,
  checkIn: string,
  checkOut: string,
  onOrderInfoChange: OnChange
) {
  dayjs.locale("vi"); // đảm bảo locale

  const parsedDate = parseDateOnly(orderDate);

  const setDate = (d: Dayjs | null) => {
    onOrderInfoChange("date", toISODateInput(d));
  };

  const setTime = (field: "checkIn" | "checkOut", value: string) => {
    onOrderInfoChange(field, value);
  };

  const setNow = (field: "checkIn" | "checkOut") => {
    onOrderInfoChange(field, getCurrentTime());
  };

  return {
    parsedDate,
    setDate,
    setTime,
    setNow,
    values: { orderDate, checkIn, checkOut },
  };
}
