export type Production = {
  id: number
  stt: string
  date: string
  timeIn: string
  timeOut: string
  plateNumber: string
  customerName: string
  sdt: string
  carCompany: string
  vehicleLine: string
  service: string
  carSize: "S" | "M" | "L"
  status: string
  statusPayment: string
  employees: string[] 
};