export interface EmployeeDTO {
  id: number;
  name: string;
}

export interface ServiceTypeDTO {
  id: number;
  code: string;
  name: string;
}

export interface VehicleDTO {
  id: string;
  licensePlate: string;
  brandId: number;
  brandCode: string;
  brandName: string;
  modelId: number;
  modelCode: string;
  modelName: string;
  size: string;
  imageUrl: string;
  customerId?: string;
}

export interface ServiceCatalogDTO {
  id: number;
  code: string;
  price: number;
  size: string;
  service?: ServiceDTO;
}

export interface BrandDTO {
  id: number;
  code: string;
  brandName?: string;
}

export interface ModelDTO {
  id: number;
  code: string;
  modelName: string;
  size: string;
  brand?: BrandDTO;
}

export interface ServiceDTO {
  id: number;
  code: string;
  serviceName: string;
  serviceTypeCode: string;
  serviceCatalog: ServiceCatalogDTO;
  duration?: string;
  note?: string;
}

export interface OrderDetailDTO {
  employees: EmployeeDTO[];
  vehicle: VehicleDTO;
  service: ServiceDTO;
  serviceCatalog: ServiceCatalogDTO;
  status: string;
  note: string | null;
}

export interface CustomerDTO {
  id: string;
  name: string;
  phone: string;
  vehicles?: VehicleDTO[];
}

export interface OrderResponseDTO {
  id: string;
  orderDate: string;
  checkIn: string;
  checkOut: string;
  tip: number;
  paymentType: string;
  paymentStatus: string;
  vat: number;
  deleteFlag: boolean;
  discount: number;
  totalPrice: number;
  note: string | null;
  customer: CustomerDTO;
  orderDetails: OrderDetailDTO[];
}
