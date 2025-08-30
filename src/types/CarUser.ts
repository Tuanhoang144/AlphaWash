export interface ServiceUsedDTO {
 id: number;
  licensePlate: string;
  vehicleName: string;
  customerName: string;
  customerId?: string | null;
  phone: string;
  serviceUsage: number;
  note?: string;
  checkinTime?: string; // nếu API có trả
}