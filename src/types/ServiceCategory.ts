export interface ServiceCategoryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceCategoryRequest {
  name: string;
  code: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}
