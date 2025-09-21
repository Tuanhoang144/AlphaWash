export interface ServiceAll {
  serviceTypeCode: string;
  serviceTypeName: string;
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