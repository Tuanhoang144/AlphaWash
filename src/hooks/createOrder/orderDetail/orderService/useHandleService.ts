"use client";

import { useServiceCatalogManager } from "@/services/userServiceCatalogManager";
import { useServiceManager } from "@/services/useServiceAll";
import { OrderServiceDTO } from "@/types/order/OrderServiceDTO";
import { ServiceCatalogDTO, ServiceDTO } from "@/types/service/ServiceDTO";
import { VehicleDTO } from "@/types/vehicle/VehicleDTO";
import { useCallback, useEffect, useState } from "react";

export default function useHandleService(
  vehicle: VehicleDTO,
  orderServiceDTO: OrderServiceDTO,
  handleOrderServiceChange: (service: OrderServiceDTO) => void
) {
  const [optionServices, setOptionServices] = useState<ServiceDTO[]>([]);
  const [optionServiceCatalogs, setOptionServiceCatalogs] = useState<
    ServiceCatalogDTO[]
  >([]);
  const [selectedService, setSelectedService] = useState<ServiceDTO>();
  const [selectedServiceCatalog, setSelectedServiceCatalog] =
    useState<ServiceCatalogDTO>();
  const { getAllServiceCode } = useServiceManager();
  const { getServiceCatalogByServiceId } = useServiceCatalogManager();

  useEffect(() => {
    (async () => {
      try {
        const listServices: ServiceDTO[] = await getAllServiceCode();
        const filteredServices = listServices.sort((a, b) => {
          const serviceTypeCodeA = parseInt(
            a.serviceTypeCode.replace("ST", ""),
            10
          );
          const serviceTypeCodeB = parseInt(
            b.serviceTypeCode.replace("ST", ""),
            10
          );
          return serviceTypeCodeA - serviceTypeCodeB;
        });
        setOptionServices(filteredServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    })();
  }, []);

  const handleSelectService = useCallback(
    (serviceCode: string) => {
      const service = optionServices.find((svc) => svc.code === serviceCode);
      setSelectedService(service);
      if (service) {
        handleOrderServiceChange({
          ...orderServiceDTO,
          orderType: "SERVICE",
          name: service.serviceName,
          serviceCatalog: {
            service: {
              id: service.id,
              code: service.code,
              serviceName: service.serviceName,
              duration: service.duration,
              serviceTypeCode: service.serviceTypeCode,
            },
          } as ServiceCatalogDTO,
        });
      }
    },
    [optionServices, orderServiceDTO, handleOrderServiceChange]
  );

  useEffect(() => {
    (async () => {
      if (selectedService == null) return;
      try {
        const listServiceCatalogs = await getServiceCatalogByServiceId(
          selectedService?.id
        );
        setOptionServiceCatalogs(() =>
          listServiceCatalogs.map((catalog: any) => ({
            id: catalog.id,
            code: catalog.code,
            listedPrice: catalog.price,
            size: catalog.size,
            service: {
              id: catalog.serviceId,
            },
          }))
        );
      } catch (error) {
        console.error("Error fetching service catalogs:", error);
      }
    })();
  }, [selectedService]);


  useEffect(() => {
    const serviceCatalog = optionServiceCatalogs.find(
      (catalog) =>
        catalog.size === vehicle.size &&
        catalog.service?.id === selectedService?.id
    );
    setSelectedServiceCatalog(serviceCatalog);
    handleOrderServiceChange({
      ...orderServiceDTO,
      serviceCatalog: {
        id: serviceCatalog?.id || 0,
        code: serviceCatalog?.code || "",
        name: serviceCatalog?.name || "",
        listedPrice: serviceCatalog?.listedPrice || 0,
        size: serviceCatalog?.size || "",
        service: serviceCatalog?.service,
      },
      adjustedPrice: serviceCatalog?.listedPrice || 0,
    });
  }, [optionServiceCatalogs, vehicle.size, selectedService?.id]);

  return {
    optionServices,
    selectedService,
    handleSelectService,
    optionServiceCatalogs,
    selectedServiceCatalog,
  };
}
