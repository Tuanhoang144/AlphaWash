export type ProductCategory = {
  id: number;
  code: string;
  categoryName: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
  exclusiveKey?: number;
};

export type Supplier = {
  id: number;
  code: string;
  supplierName: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  isActive?: boolean;
  exclusiveKey?: number;
};

export type ProductImage = {
  id?: number;
  imageUrl: string;
  displayOrder?: number;
  isPrimary?: boolean;
};

export type Product = {
  id: number;
  code: string;
  barcode?: string;
  productName: string;
  categoryCode?: string;
  categoryName?: string;
  categoryColor?: string;
  brand?: string;
  description?: string;
  costPrice?: number;
  sellingPrice?: number;
  minPrice?: number;
  suggestedPrice?: number;
  currentStock?: number;
  minStock?: number;
  unit?: string;
  location?: string;
  trackInventory?: boolean;
  supplierCode?: string;
  supplierName?: string;
  supplierSku?: string;
  isActive?: boolean;
  images?: ProductImage[];
  exclusiveKey?: number;
};
