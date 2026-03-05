export type QuantityServiceDTO = {
  serviceCatalogCode: string;
  quantity: number;
};

export type ComboCatalogDTO = {
  catalogCode: string; 
  size: string;       
  price: number;
  priceIncludeTax: boolean;
  services?: QuantityServiceDTO[];
  combo?: ComboDTO;
};

export type ComboDTO = {
  comboCode: string;  
  comboName: string;
  durationDays: number;
  status: string;      
  catalogs?: ComboCatalogDTO[];
};
