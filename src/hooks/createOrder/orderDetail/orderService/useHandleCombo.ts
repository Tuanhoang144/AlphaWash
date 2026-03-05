"use client";

import { useCreateOrder } from "@/services/order/useCreateOrder";
import { ComboCatalogDTO, ComboDTO } from "@/types/comboService/ComboDTO";
import { OrderServiceDTO } from "@/types/order/OrderServiceDTO";
import { VehicleDTO } from "@/types/vehicle/VehicleDTO";
import { useCallback, useEffect, useState } from "react";

export default function useHandleCombo(
  vehicle: VehicleDTO,
  orderServiceDTO: OrderServiceDTO,
  handleOrderServiceChange: (service: OrderServiceDTO) => void
) {
  const [optionComboServices, setOptionComboServices] = useState<ComboDTO[]>(
    []
  );
  const [selectedComboService, setSelectedComboService] = useState<ComboDTO>();
  const [optionComboCatalogs, setOptionComboCatalogs] = useState<ComboCatalogDTO[]>([]);
  const [selectedComboCatalog, setSelectedComboCatalog] = useState<ComboCatalogDTO>();
  const { getListComboService } = useCreateOrder();

  useEffect(() => {
    (async () => {
      try {
        const listComboServices: ComboDTO[] = await getListComboService();
        setOptionComboServices(listComboServices);
        setOptionComboCatalogs(
          listComboServices.flatMap((combo) =>
            combo.catalogs?.map((catalog) => ({
              catalogCode: catalog.catalogCode,
              size: catalog.size,
              price: catalog.price,
              priceIncludeTax: catalog.priceIncludeTax,
              services: catalog.services,
            })) ?? []
          )
        );
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    })();
  }, []);

  const handleSelectCombo = useCallback(
    (comboCode: string) => {
      const combo = optionComboServices.find(
        (svc) => svc.comboCode === comboCode
      );
      setSelectedComboService(combo);

      if (combo) {
        handleOrderServiceChange({
          ...orderServiceDTO,
          orderType: "COMBO",
          name: combo.comboName,
          serviceComboCatalog: {
            combo: {
              comboCode: combo.comboCode,
              comboName: combo.comboName,
              durationDays: combo.durationDays,
              status: combo.status,
            } as ComboDTO,
          } as ComboCatalogDTO,
        });
      }
    },
    [orderServiceDTO, handleOrderServiceChange, optionComboServices]
  );

  useEffect(() => {
    const comboCatalog = optionComboCatalogs.find(
      (catalog) =>
        catalog.size === vehicle.size
    );
    setSelectedComboCatalog(comboCatalog);
    handleOrderServiceChange({
      ...orderServiceDTO,
      serviceComboCatalog: {
        catalogCode: comboCatalog?.catalogCode || "",
        size: comboCatalog?.size || "",
        price: comboCatalog?.price || 0,
        priceIncludeTax: comboCatalog?.priceIncludeTax || true,
        services: comboCatalog?.services || [],
      },
      adjustedPrice: comboCatalog?.price || 0,
    });
  }, [vehicle.size, selectedComboService?.comboCode]);

  return {
    optionComboServices,
    selectedComboService,
    handleSelectCombo,
    optionComboCatalogs,
    selectedComboCatalog,
  };
}
