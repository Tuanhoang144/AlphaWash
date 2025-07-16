import { Customer } from './Customer';
import { Brand } from './Brand';
import { Model } from './Model';

export type Vehicle = {
  id: string; // UUID
  customer?: Customer;
  licensePlate: string;
  brand?: Brand;
  model?: Model;
  imageUrl?: string;
  note?: string;
}
