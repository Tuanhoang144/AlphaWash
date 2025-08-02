export interface Service {
  id: number;
  serviceCode: string;
  serviceName: string;
  price: number;
  size: string;
  duration: number;
  note?: string;
  serviceTypeCode: string;
  serviceTypeName: string;
}
