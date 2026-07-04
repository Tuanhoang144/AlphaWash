export type ProductImportRow = {
  rowNumber: number;
  productCode: string;
  productName: string;
  categoryName: string;
  brand: string;
  description: string;
  unit: string;
  costPrice: string;
  sellingPrice: string;
  minPrice: string;
  barcode: string;
  currentStock: string;
  minStock: string;
  location: string;
  supplierName: string;
  status: string;
  valid: boolean;
  errors: string[];
};

export type ProductImportPreview = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ProductImportRow[];
};

export type ProductImportResult = {
  importHistoryId: number;
  totalRows: number;
  importedRows: number;
  updatedRows: number;
  skippedRows: number;
  failedRows: number;
  failedDetails: ProductImportRow[];
};

export type ProductImportHistory = {
  id: number;
  fileName: string;
  importedBy: string;
  importedAt: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  updatedRows: number;
  skippedRows: number;
  status: string;
  importMode: string;
  errorFilePath?: string;
};

export type ImportMode = "SKIP_DUPLICATES" | "UPDATE_EXISTING" | "CREATE_ONLY";
