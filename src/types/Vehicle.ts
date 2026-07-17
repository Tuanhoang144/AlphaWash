import { Customer } from './Customer';
import { Brand } from './Brand';
import { Model } from './Model';
import { CustomerDTO, VehicleDTO } from './OrderResponse';

export type Vehicle = {
  id: string; // UUID
  customer?: Customer;
  licensePlate: string;
  brand?: Brand;
  model?: Model;
  imageUrl?: string;
  note?: string;
}

export interface PlateCheckResult {
  exists: boolean;
  vehicle?: VehicleDTO;
  customer?: { id: string; name: string; phone: string } | null;
  hasCustomer: boolean;
}

export interface VehicleWithStats extends VehicleDTO {
  customer?: CustomerDTO | null;
  ordersCount: number;
  invoicesCount: number;
  lastServiceDate?: string | null;
}

export interface DuplicateVehicleGroup {
  normalizedPlate: string;
  vehicles: VehicleWithStats[];
}

export interface MergeDuplicateVehiclesRequest {
  primaryVehicleId: string;
  duplicateVehicleIds: string[];
}

export interface MergeDuplicateVehiclesResult {
  primaryVehicleId: string;
  mergedOrdersCount: number;
  mergedInvoicesCount: number;
}

export interface VehiclePreviewStats {
  vehicleId: string;
  licensePlate: string;
  customer: { id: string; name: string; phone: string } | null;
  invoiceCount: number;
  serviceHistoryCount: number;
  totalSpending: number;
  lastVisitDate: string | null;
  appointmentCount: number;
}

export interface MergePreviewResult {
  vehicles: VehiclePreviewStats[];
  totalInvoices: number;
  totalHistoryRecords: number;
}

export interface MergeVehicleRequest {
  primaryVehicleId: string;
  primaryCustomerId: string | null;
  duplicateVehicleIds: string[];
}

export interface MergeVehicleResult {
  invoicesMigrated: number;
  appointmentsMigrated: number;
  historyRecordsMigrated: number;
  notesMigrated: number;
  logId: number;
  primaryVehicle: VehicleDTO;
  primaryCustomer: CustomerDTO | null;
}

export interface MergeLog {
  id: number;
  mergeDate: string;
  operatorUsername: string;
  primaryCustomerName: string | null;
  primaryVehicleLicensePlate: string;
  duplicateCustomerName: string | null;
  duplicateLicensePlate: string;
  invoicesMigrated: number;
  appointmentsMigrated: number;
  historyRecordsMigrated: number;
  status: "SUCCESS" | "ROLLED_BACK";
}
