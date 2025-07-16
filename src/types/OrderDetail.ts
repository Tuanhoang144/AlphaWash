import { Vehicle } from './Vehicle';
import { ServiceCatalog } from './ServiceCatalog';
import { Order } from './Order';

export interface OrderDetail {
  id: string; 
  order?: Order;
  employeeId: string; 
  serviceCatalog?: ServiceCatalog;
  status?: string;
  note?: string;
  vehicle?: Vehicle;
}
