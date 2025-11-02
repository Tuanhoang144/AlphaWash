export interface OrderCreateRequest {
  customerId: string
  licensePlate: string
  brandCode: string
  modelCode: string
  imageUrl: string
  vehicleNote: string
  date: string 
  checkInTime: string 
  checkOutTime: string 
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
  status: string
  note: string
}

export interface ServiceAdjust {
  serviceCatalogCode: string
  adjustedPrice: number
  adjustedPriceFlag: boolean
  adjustedPriceReason: string
}