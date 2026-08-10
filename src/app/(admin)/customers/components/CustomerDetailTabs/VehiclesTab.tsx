"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "../VehicleCard";
import { EditVehicleDialog } from "../EditVehicleDialog";
import type { CustomerDetail } from "@/types/Customer";
import type { VehicleDTO } from "@/types/OrderResponse";

interface VehiclesTabProps {
  customer: CustomerDetail;
  onManageVehicles: () => void;
  onVehicleUpdated?: () => void;
}

export function VehiclesTab({ customer, onManageVehicles, onVehicleUpdated }: VehiclesTabProps) {
  const [editingVehicle, setEditingVehicle] = useState<VehicleDTO | null>(null);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {customer.vehicles.length} xe
          </h4>
          <Button variant="outline" size="sm" onClick={onManageVehicles}>
            <Pencil className="size-3.5" /> Quản lý xe
          </Button>
        </div>

        <div className="space-y-2">
          {customer.vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onEdit={(vehicle) => setEditingVehicle(vehicle)}
            />
          ))}
          {customer.vehicles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Khách hàng chưa có xe nào. Nhấn &quot;Quản lý xe&quot; để thêm.
            </p>
          )}
        </div>
      </div>

      <EditVehicleDialog
        open={!!editingVehicle}
        onOpenChange={(v) => !v && setEditingVehicle(null)}
        customerId={customer.id}
        vehicle={editingVehicle}
        onUpdated={() => {
          setEditingVehicle(null);
          onVehicleUpdated?.();
        }}
      />
    </>
  );
}
