export interface OrderUpdateRequest {
  orderId: string;
  customerId: string;
  licensePlate: string;
  brandCode: string;
  modelCode: string;
  imageUrl: string;
  vehicleNote: string;
  date: string; 
  checkInTime: string; 
  checkOutTime: string; 
  paymentType: string;
  paymentStatus: string;
  tip: number;
  vat: number;
  discount: number;
  totalPrice: number;
  note: string;
  orderDetails: OrderDetail[];
}

export interface OrderDetail {
  orderDetailCode: string; // Optional, if you need to track the detail code
  employeeIds: number[]; 
  serviceCatalogCodes: string[];
  status: string;
  note: string;
}
