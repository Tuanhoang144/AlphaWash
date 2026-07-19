export interface OrderUpdateRequest {
  orderId: string;
  customerId: string | null;
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
  orderDetailCode: string;
  employeeIds: number[];
  services: ServiceUpdate[];
  products?: ProductOrderItem[];
  status: string;
  note: string;
}

export interface ProductOrderItem {
  productCode: string;
  quantity: number;
  unitPrice: number;
  adjustedPrice?: number;
  adjustedPriceFlag?: boolean;
  adjustedPriceReason?: string;
  discount?: number;
  note?: string;
}
export interface ServiceUpdate {
  serviceCatalogCode: string;
  adjustedPrice: number;
  adjustedPriceFlag: boolean;
  adjustedPriceReason: string;
  quantity: number;
}
