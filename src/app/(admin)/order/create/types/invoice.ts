
export interface Customer {
  id: string
  customerName: string
  phone: string
  vehicles?: Vehicle[]
}

export interface Brand {
  id: number
  code: string
  brandName?: string
}

export interface Model {
  id: number
  code: string
  modelName: string
  size: string
  brand?: Brand
}

export interface Vehicle {
  id: string
  licensePlate: string
  brandId: number
  brandCode: string
  brandName: string
  modelId: number
  modelCode: string
  modelName: string
  size: string
  imageUrl: string
  customerId?: string
}

export interface Employee {
  id: string
  name: string
  note: string | null
}

export interface ServiceType {
  id: number
  code: string
  name: string
}

export interface Service {
  id: number
  code: string
  serviceName?: string
  duration?: string
  note?: string
  serviceTypeCode: string
  serviceType?: ServiceType
}

export interface ServiceCatalog {
  id: number
  code: string
  size: string
  price: number
  service?: Service
}

export interface OrderDetail {
  employees: Employee[]
  vehicle: Vehicle
  service: Service
  serviceCatalog: ServiceCatalog
  status: string
  note: string | null
}

export interface OrderDTO {
  orderDate: string
  checkIn: string
  checkOut: string
  tip: number
  paymentType: string
  paymentStatus: string
  vat: number
  discount: number
  totalPrice: number
  note: string | null
  customer: Customer
  orderDetails: OrderDetail[]
}
