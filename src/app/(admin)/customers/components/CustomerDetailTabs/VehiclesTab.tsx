"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "../VehicleCard";
import type { CustomerDetail } from "@/types/Customer";

interface VehiclesTabProps {
  customer: CustomerDetail;
  onManageVehicles: () => void;
}

export function VehiclesTab({ customer, onManageVehicles }: VehiclesTabProps) {
  return (
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
          <VehicleCard key={v.id} vehicle={v} />
        ))}
        {customer.vehicles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Khách hàng chưa có xe nào. Nhấn &quot;Quản lý xe&quot; để thêm.
          </p>
        )}
      </div>
    </div>
  );
}
