export interface OrderCreateRequest {
  customerId?: string
  licensePlate: string
  brandCode: string
  modelCode: string
  imageUrl: string
  vehicleNote: string
  date: string          // LocalDateTime — "YYYY-MM-DDTHH:MM:SS"
  checkInTime: string   // LocalTime   — "HH:MM:SS"
  checkOutTime: string | null
  paymentType: string
  paymentStatus: string
  tip: number
  vat: number
  discount: number
  totalPrice: number
  note: string
  orderDetails: OrderDetail[]
}

export interface OrderDetail {
  employeeIds: number[]
  services: ServiceAdjust[]
  products?: ProductOrderItem[]
  status: string
  note: string
  licensePlate: string
  brandCode: string
  modelCode: string
  imageUrl: string
  vehicleNote: string
}

export interface ServiceAdjust {
  serviceCatalogCode?: string | null  // null cho new-system service (không có catalog entry)
  serviceItemId?: string              // ID từ GET /services — bắt buộc khi serviceCatalogCode null
  adjustedPrice: number
  adjustedPriceFlag: boolean
  adjustedPriceReason: string
  quantity: number
}

export interface ProductOrderItem {
  productCode: string
  quantity: number
  unitPrice: number
  adjustedPrice?: number
  adjustedPriceFlag?: boolean
  adjustedPriceReason?: string
  discount?: number
  note?: string
}
