import { ServiceType } from './ServiceType';

export type Service = {
  id: number;
  code: string;
  serviceName?: string;
  duration?: string;
  note?: string;
  serviceType?: ServiceType;
}

export interface ServiceItem {
  id: string
  name: string
  category: string
  brand?: string
  typeDetail?: string
  warranty?: string
  priceS?: number
  priceM?: number
  priceL?: number
  priceSEDAN?: number
  priceSUV?: number
  priceOverSize?: number
  canBeBonus: boolean
  active: boolean
  description?: string
  sortOrder: number
}