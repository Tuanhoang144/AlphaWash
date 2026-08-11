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
  checkOutTime: string | null;
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
  orderDetailCode: string;  // rỗng = detail mới cần tạo
  licensePlate: string;     // vehicle riêng cho detail này
  brandCode: string;
  modelCode: string;
  imageUrl: string;
  vehicleNote: string;
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
  serviceCatalogCode?: string | null;  // null cho new-system service (không có catalog entry)
  serviceItemId?: string;              // ID từ GET /services — bắt buộc khi serviceCatalogCode null
  adjustedPrice: number;
  adjustedPriceFlag: boolean;
  adjustedPriceReason: string;
  quantity: number;
}
