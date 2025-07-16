export interface EmployeeDTO {
  id: number;
  employeeName: string;
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
  price: number;
  size: string;
}

export interface ServiceDTO {
  id: number;
  serviceName: string;
  serviceCatalog: ServiceCatalogDTO;
}

export interface OrderDetailDTO {
  employee: EmployeeDTO[];
  vehicle: VehicleDTO;
  service: ServiceDTO;
  status: string;
  note: string | null;
}

export interface CustomerDTO {
  id: string;
  customerName: string;
  phone: string;
}

export interface OrderDTO {
  id: string;
  orderDate: string;
  checkIn: string;
  checkOut: string;
  paymentStatus: string;
  vat: number;
  discount: number;
  totalPrice: number;
  note: string | null;
  customer: CustomerDTO;
  orderDetails: OrderDetailDTO[];
}
