export type PurchaseOrderStatus =
  | "DRAFT"
  | "ORDERED"
  | "PARTIAL_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export type PurchaseOrderItem = {
  id?: number;
  productCode: string;
  productName?: string;
  quantity: number;
  unitCost: number;
  totalCost?: number;
  receivedQuantity?: number;
};

export type PurchaseOrder = {
  id: number;
  code: string;
  supplierCode?: string;
  supplierName?: string;
  purchaseDate?: string;
  invoiceNumber?: string;
  totalAmount?: number;
  status: PurchaseOrderStatus;
  notes?: string;
  items?: PurchaseOrderItem[];
  createdBy?: string;
  createdAt?: string;
  exclusiveKey?: number;
};
