"use client";

import { OrderServiceDTO } from "@/types/order/OrderServiceDTO";
import { useEffect, useState } from "react";

export default function useHandlePickServiceType(
  orderService: OrderServiceDTO,
  handleOrderServiceChange: (service: OrderServiceDTO) => void
) {
  const [orderServiceType, setOrderServiceType] = useState<string>("SERVICE");

  const handleSelectServiceType = (serviceType: string) => {
    setOrderServiceType(serviceType);
    handleOrderServiceChange({ ...orderService, orderType: serviceType });
  };

  useEffect(() => {
    if (orderServiceType !== orderService.orderType) {
      if (orderServiceType === "SERVICE") {
        handleOrderServiceChange({
          orderType: orderServiceType,
          serviceCatalog: {
            id: 0,
            code: "",
            name: "",
            listedPrice: 0,
            size: "",
            service: undefined,
          },
          serviceComboCatalog: undefined,
          adjustedPriceReason: "",
          adjustedPrice: 0,
          adjustedPriceFlag: false,
          note: "",
        });
      } else if (orderServiceType === "COMBO") {
        handleOrderServiceChange({
          orderType: orderServiceType,
          serviceCatalog: undefined,
          serviceComboCatalog: {
            catalogCode: "",
            size: "",
            price: 0,
            priceIncludeTax: true,
            services: [],
          },
          adjustedPriceReason: "",
          adjustedPrice: 0,
          adjustedPriceFlag: false,
          note: "",
        });
      }
    }
  }, [orderServiceType]);

  return { orderServiceType, handleSelectServiceType };
}
