import { ServiceType } from './ServiceType';

export interface Service {
  id: number;
  code: string;
  serviceName: string;
  price: number;
  size: string;
  duration: number;
  note?: string;
  serviceType: {
    code: string;
    serviceTypeName: string;
  };
}
