export interface QuickCatalog {
  catalogCode: string;
  size: string;
  price: number;
}

export interface QuickService {
  serviceCode: string;
  serviceName: string;
  duration: string;
  catalogs: QuickCatalog[];
}

export interface QuickServiceGroup {
  serviceTypeCode: string;
  serviceTypeName: string;
  services: QuickService[];
}

export interface RecentVehicle {
  vehicleId: string;
  licensePlate: string;
  imageUrl: string | null;
  customerId: string;
  customerName: string;
  customerPhone: string;
  brandCode: string;
  brandName: string;
  modelCode: string;
  modelName: string;
  vehicleSize: string;
  lastOrderDate: string;
}

export interface QuickServiceItem {
  catalogCode: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  quantity: number;
  size: string;
}
