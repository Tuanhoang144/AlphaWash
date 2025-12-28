export type ComboApiServiceLine = {
  serviceCatalogCode: string;
  quantity: number;
};

export type ComboApiCatalog = {
  catalogCode: string; // ví dụ: SCBC0001
  size: string;        // S/M/L
  price: number;
  priceIncludeTax: boolean;
  services: ComboApiServiceLine[];
};

export type ComboApiItem = {
  comboCode: string;   // ví dụ: SCB0001
  comboName: string;
  durationDays: number;
  status: string;      // ACTIVE...
  catalogs: ComboApiCatalog[];
};

// DTO combo đang chọn trong form (độc lập với ServiceDTO)
export type OrderComboDTO = {
  comboCode?: string;
  comboName?: string;

  // catalog đã chọn theo size
  catalogCode?: string;
  size?: string;
  listedPrice?: number;

  // ngoại lệ giá
  adjustedPriceFlag?: boolean;
  adjustedPrice?: number;
  adjustedPriceReason?: string;
};
