import { VehicleDTO } from "../vehicle/VehicleDTO";

export interface CustomerDTO {
  id: string;
  name: string;
  phone: string;
  vehicles?: VehicleDTO[];
}