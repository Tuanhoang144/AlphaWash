import { Service } from './Service';
import { Size } from './Size';


export type ServiceCatalog = {
  id: number;
  code: string;
  size: Size;
  price: number;
  service?: Service;
}
