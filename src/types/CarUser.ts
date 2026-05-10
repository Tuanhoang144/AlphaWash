export interface ServiceUsedDTO {
  licensePlate: string;
  vehicleName: string;
  serviceUsage: string;
  checkinTime: string;
  customerName: string;
  customerId:string;
  phone: string;
  note: string;
}

export interface ServiceDetailResponse {
  customerId: string;
  customerName: string;
  phone: string;

  licensePlate: string;
  vehicleName: string;

  services: {
    name: string;
    checkinTime: string;  // ISO datetime
  }[];
}