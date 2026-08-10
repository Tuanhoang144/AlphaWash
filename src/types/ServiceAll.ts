export interface ServiceAll {
  id?: number;
  serviceTypeCode?: string | null;   // null cho service thuộc danh mục mới (service-categories)
  serviceTypeName?: string | null;
  category?: string;                 // category code mới — field thật BE trả về (service-categories)
  categoryCode?: string;             // alias dự phòng
  categoryName?: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  duration: string;
  size: string;
  note?: string;
}

export interface ServiceFormData {
  serviceCode: string;
  serviceName: string;
  duration: string;
  size: string;
  price: number;
  note?: string;
}

export interface ServiceType {
  code: string,
  serviceTypeName: string
}

export interface SizePrice {
  price: number;
}

export interface ServiceUpdateFormData {
  serviceCode: string;
  serviceName: string;
  duration: string;
  note?: string;
  sizes: {
    S?: SizePrice;
    M?: SizePrice;
    L?: SizePrice;
  };
}