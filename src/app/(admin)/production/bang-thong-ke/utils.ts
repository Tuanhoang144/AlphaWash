import { Production } from "@/types/Production";
 // Type definition cho dữ liệu
export interface WashRecord {
  id: number;
  stt: string;
  date: string;
  timeIn: string;
  timeOut: string;  
  plateNumber: string;
  customerName: string;
  sdt: string;
  carCompany: string;
  vehicleLine: string;
  service: string;
  carSize: "S" | "M" | "L";
  status: string;
  statusPayment: string;
  voucher: string;
  employee: string[]; // Changed from string to string[]
}

export const mappedData = (result : Production[]  ) => {
      const mappedData: WashRecord[] = result.map((item, idx) => ({
        id: item.id,
        stt: (idx + 1).toString(),
        date: item.date ?? "",  
        timeIn: item.timeIn ?? "",
        timeOut: item.timeOut ?? "",
        plateNumber: item.plateNumber ?? "",
        customerName: item.customerName ?? "",
        sdt: item.sdt ?? "",
        carCompany: item.carCompany ?? "",
        vehicleLine: item.vehicleLine ?? "",
        service: item.service ?? "",
        carSize: item.carSize as "S" | "M" | "L",
        status: item.status ?? "",
        statusPayment: item.statusPayment ?? "",
        voucher: item.voucher ?? "",
        employee: Array.isArray(item.employees)
          ? item.employees
          : item.employees
          ? [item.employees]
          : [],
      }));
      return mappedData;
} 