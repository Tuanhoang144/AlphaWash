"use client";

import { OrderServiceDTO } from "@/types/order/OrderServiceDTO";

export default function useHandleOrderService(
  orderServices: OrderServiceDTO[],
  handleOrderServicesChange: (services: OrderServiceDTO[]) => void,
) {
  const addOrderService = (newService: OrderServiceDTO) => {
    const updatedServices = [...orderServices, newService];
    handleOrderServicesChange(updatedServices);
  };

  const updateOrderService = (
    index: number,
    updatedService: OrderServiceDTO,
  ) => {
    const updatedServices = orderServices.map((service, i) =>
      i === index
        ? {
            ...service,
            name: updatedService.name,
            orderType: updatedService.orderType,
            serviceCatalog: updatedService.serviceCatalog,
            serviceComboCatalog: updatedService.serviceComboCatalog,
            adjustedPriceReason: updatedService.adjustedPriceReason,
            adjustedPrice: updatedService.adjustedPrice,
            adjustedPriceFlag: updatedService.adjustedPriceFlag,
            note: updatedService.note,
          }
        : service,
    );
    handleOrderServicesChange(updatedServices);
  };

  const removeOrderService = (index: number) => {
    const updatedServices = orderServices.filter((_, i) => i !== index);
    handleOrderServicesChange(updatedServices);
  };
  return {
    addOrderService,
    updateOrderService,
    removeOrderService,
  };
}
