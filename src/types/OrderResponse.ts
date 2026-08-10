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
  listedPrice: number;
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
  serviceCode: string;
  serviceName: string;
  serviceTypeCode?: string | null;   // null cho service thuộc danh mục mới (enum-based)
  category?: string;                 // category code mới — field thật BE trả về (service-categories)
  categoryCode?: string;             // alias dự phòng
  serviceCatalog: ServiceCatalogDTO;
  adjustedPriceReason: string;
  adjustedPrice: number;
  adjustedPriceFlag: boolean;
  quantity: number;
  duration?: string;
  note?: string;
  // Embedded prices từ new system (ServiceItem) — dùng để build synthetic catalogs
  priceS?: number;
  priceM?: number;
  priceL?: number;
  priceSEDAN?: number;
  priceSUV?: number;
  priceOverSize?: number;
}

export interface OrderProductDTO {
  id: number;
  productCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  adjustedPrice: number;
  adjustedPriceFlag: boolean;
  adjustedPriceReason: string;
  discount: number;
  note: string;
  currentStock?: number;
  unit?: string;
}

export interface OrderDetailDTO {
  code: string;
  employees: EmployeeDTO[];
  vehicle: VehicleDTO;
  service: ServiceDTO[];
  products?: OrderProductDTO[];
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
  code: string;
  date: string;
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
  customer?: CustomerDTO;
  orderDetails: OrderDetailDTO[];
}
