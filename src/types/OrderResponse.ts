export interface EmployeeDTO {
  id: number;
  name: string;
}

export interface VehicleDTO {
  id: string;
  licensePlate: string;
  brandId: number;
  brandName: string;
  modelId: number;
  modelName: string;
  size: string;
  imageUrl: string;
}

export interface ServiceCatalogDTO {
  id: number;
  code: string;
  price: number;
  size: string;
}

export interface ServiceDTO {
  id: number;
  code: string;
  serviceName: string;
  serviceTypeCode: string;
  serviceCatalog: ServiceCatalogDTO;
}

export interface OrderDetailDTO {
  employees: EmployeeDTO[];
  vehicle: VehicleDTO;
  service: ServiceDTO;
  status: string;
  note: string | null;
}

export interface CustomerDTO {
  id: string;
  customerName: string;
  phone: string;
  vehicles?: VehicleDTO[]; 
}

export interface OrderDTO {
  id: string;
  orderDate: string;
  checkIn: string;
  checkOut: string;
  tip: number;
  paymentType: string;
  paymentStatus: string;
  vat: number;
  discount: number;
  totalPrice: number;
  note: string | null;
  customer: CustomerDTO;
  orderDetails: OrderDetailDTO[];
}
