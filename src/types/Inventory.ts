export type InventoryTransactionType =
  | "PURCHASE_RECEIVE"
  | "SALE"
  | "STOCK_IN"
  | "STOCK_OUT"
  | "ADJUSTMENT"
  | "RETURN";

export type InventoryTransaction = {
  id: number;
  code: string;
  productCode: string;
  productName?: string;
  quantity: number;
  beforeQty: number;
  afterQty: number;
  type: InventoryTransactionType;
  referenceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
};

export type InventoryDashboard = {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
};
