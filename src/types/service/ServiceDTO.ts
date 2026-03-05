export interface ServiceCatalogDTO {
  id: number;
  code: string;
  name: string;
  listedPrice: number;
  size: string;
  service?: ServiceDTO;
}

export interface ServiceDTO {
  id: number;
  code: string;
  serviceName: string;
  duration: string;
  note?: string;
  serviceTypeCode: string;
  serviceCatalog?: ServiceCatalogDTO;
}
