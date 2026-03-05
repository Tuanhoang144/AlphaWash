import { ComboCatalogDTO } from "../comboService/ComboDTO";
import { ServiceCatalogDTO } from "../service/ServiceDTO";

export interface OrderServiceDTO {
    code?: string;
    name: string;
    orderType: string;
    orderDetailCode?: string;
    serviceCatalog?: ServiceCatalogDTO;
    serviceComboCatalog?: ComboCatalogDTO;
    adjustedPriceReason?: string;
    adjustedPrice?: number;
    adjustedPriceFlag?: boolean;
    note?: string;
}