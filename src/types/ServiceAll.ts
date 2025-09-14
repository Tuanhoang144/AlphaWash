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