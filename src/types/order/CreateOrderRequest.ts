export interface CreateOrderRequest {
  customerId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  paymentType: string;
  paymentStatus: string;
  vat: number;
  tip: number;
  discount: number;
  noteOrder: string;
  totalPrice: number;
  promotionId?: string;
  orderDetails: CreateOrderDetailRequest[];
}

export interface CreateOrderDetailRequest {
  employees: string[];
  statusProcess: string;
  licensePlate: string;
  brandCode: string;
  modelCode: string;
  imageUrl: string;
  noteDetail: string;
  services: CreateOrderServiceRequest[];
}

export interface CreateOrderServiceRequest {
  orderType: string;
  serviceCatalogeCode?: string;
  serviceComboCatalogCode?: string;
  adjustedPriceReason: string;
  adjustedPrice: number;
  noteService: string;
}
