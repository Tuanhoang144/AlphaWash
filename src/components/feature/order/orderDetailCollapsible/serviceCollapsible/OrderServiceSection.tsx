"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderServiceDTO } from "@/types/order/OrderServiceDTO";
import ServiceSelection from "./service/ServiceSelection";
import { VehicleDTO } from "@/types/vehicle/VehicleDTO";
import useHandleOrderService from "@/hooks/createOrder/orderDetail/useHandleOrderService";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComboSelection from "./combo/ComboSelection";

interface Props {
  vehicle: VehicleDTO;
  orderServices: OrderServiceDTO[];
  handleOrderServicesChange: (services: OrderServiceDTO[]) => void;
}

export default function OrderServiceSection({
  vehicle,
  orderServices,
  handleOrderServicesChange,
}: Props) {
  const {
    addOrderService,
    updateOrderService,
    removeOrderService
  } = useHandleOrderService(orderServices, handleOrderServicesChange);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          Thông Tin Dịch Vụ
        </CardTitle>
        <Button
          variant="outline"
          onClick={() => {
            addOrderService({
              orderType: "SERVICE",
              name: "",
              serviceCatalog: undefined,
              serviceComboCatalog: undefined,
              adjustedPriceReason: "",
              adjustedPrice: 0,
              note: "",
            });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm Dịch Vụ
        </Button>
      </CardHeader>
      <CardContent>
        {orderServices.map((orderService, index) => (
          <div
            key={index}
            className="mb-6 last:mb-0 flex justify-between items-center gap-2"
          >
            <div className="w-full shadow-sm border border-gray-200 rounded-lg p-4">
              <Tabs defaultValue="service" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="service">Dịch vụ thường</TabsTrigger>
                  <TabsTrigger value="combo">Combo dịch vụ</TabsTrigger>
                </TabsList>

                <TabsContent value="service" className="space-y-4">
                  <ServiceSelection
                    orderService={orderService}
                    vehicle={vehicle}
                    handleOrderServiceChange={(updatedService) => {
                      updateOrderService(index, updatedService);
                    }}
                  />
                </TabsContent>

                <TabsContent value="combo" className="space-y-4">
                  <ComboSelection
                    orderService={orderService}
                    vehicle={vehicle}
                    handleOrderServiceChange={(updatedService) => {
                      updateOrderService(index, updatedService);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {orderServices.length > 1 && (
              <div className="">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeOrderService(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
