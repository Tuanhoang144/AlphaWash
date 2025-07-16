import { ServiceType } from './ServiceType';

export type Service = {
  id: number;
  code: string;
  serviceName?: string;
  duration?: string;
  note?: string;
  serviceType?: ServiceType;
}
