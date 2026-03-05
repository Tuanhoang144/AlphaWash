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
  imageUrl: string | "";
  customerId?: string;
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
  type: string;
  brand?: BrandDTO;
}
