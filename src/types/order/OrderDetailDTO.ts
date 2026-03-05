import { EmployeeDTO } from "../employee/EmployeeDTO";
import { VehicleDTO } from "../vehicle/VehicleDTO";
import { OrderServiceDTO } from "./OrderServiceDTO";

export interface OrderDetailDTO {
  code?: string;
  employees: EmployeeDTO[];
  vehicle: VehicleDTO;
  statusProcess: string;
  noteDetail: string;
  services: OrderServiceDTO[];
}
