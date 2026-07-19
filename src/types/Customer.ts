import { VehicleDTO } from "./OrderResponse";
import { SegmentBadge } from "./Segment";

export type CustomerStatus = "ACTIVE" | "INACTIVE";
export type CustomerGender = "MALE" | "FEMALE" | "OTHER";

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Ngừng hoạt động",
};

export const CUSTOMER_GENDER_LABELS: Record<CustomerGender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  avatarUrl?: string | null;
  vehicles: { id: string; licensePlate: string }[];
  vehicleCount: number;
  totalVisits: number;
  totalSpending: number;
  lastVisitDate: string | null;
  tags: SegmentBadge[];
  status: CustomerStatus;
  createdAt: string;
}

export type CustomerSortField =
  | "name"
  | "totalSpending"
  | "totalVisits"
  | "lastVisitDate";

export type SortDirection = "asc" | "desc";

/** Quick preset filters shown as segment chips in the toolbar. */
export type CustomerQuickSegment = "VIP" | "NEW" | "INACTIVE" | (string & {});

export interface CustomerQueryParams {
  page: number;
  size: number;
  search?: string;
  status?: CustomerStatus;
  segment?: CustomerQuickSegment;
  minSpending?: number;
  maxSpending?: number;
  vehicleCount?: number;
  lastVisitFrom?: string;
  lastVisitTo?: string;
  sortBy?: CustomerSortField;
  sortDir?: SortDirection;
}

export type CustomerFilterValues = Pick<
  CustomerQueryParams,
  | "status"
  | "minSpending"
  | "maxSpending"
  | "vehicleCount"
  | "lastVisitFrom"
  | "lastVisitTo"
  | "sortBy"
  | "sortDir"
>;

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilterValues = {
  sortBy: "lastVisitDate",
  sortDir: "desc",
};

export interface CustomerStatsSpendingPoint {
  month: string;
  total: number;
}

export interface CustomerStatsServiceBreakdown {
  serviceName: string;
  count: number;
  total: number;
}

export interface CustomerStats {
  totalVisits: number;
  totalSpending: number;
  avgInvoice: number;
  firstVisitDate: string | null;
  lastVisitDate: string | null;
  spendingByMonth: CustomerStatsSpendingPoint[];
  serviceBreakdown: CustomerStatsServiceBreakdown[];
}

export interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  gender?: CustomerGender | null;
  birthday?: string | null;
  address?: string | null;
  note?: string | null;
  avatarUrl?: string | null;
  status: CustomerStatus;
  createdAt: string;
  vehicles: VehicleDTO[];
  tags: SegmentBadge[];
  stats: CustomerStats;
}

export interface CustomerInvoiceRow {
  id: string;
  code: string;
  date: string;
  totalPrice: number;
  paymentStatus: string;
  paymentType: string;
  licensePlate?: string | null;
}

export interface CustomerVehicleDraft {
  licensePlate: string;
  brandId?: number;
  modelId?: number;
  note?: string;
  /** Set when the plate check found an existing unowned vehicle to link instead of creating a new one. */
  linkVehicleId?: string;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  gender?: CustomerGender;
  birthday?: string;
  address?: string;
  note?: string;
  vehicle?: CustomerVehicleDraft;
}

export type UpdateCustomerPayload = Partial<
  Omit<CreateCustomerPayload, "vehicle">
> & { status?: CustomerStatus };

export type AddVehiclePayload = Omit<CustomerVehicleDraft, "linkVehicleId">;
export type UpdateVehiclePayload = Partial<AddVehiclePayload>;

export interface CustomerExportParams
  extends Omit<CustomerQueryParams, "page" | "size"> {
  ids?: string[];
}
