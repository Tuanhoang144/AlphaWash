"use client";

import { Car, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VehicleDTO } from "@/types/OrderResponse";

interface VehicleCardProps {
  vehicle: VehicleDTO;
  onEdit?: (vehicle: VehicleDTO) => void;
  onRemove?: (vehicle: VehicleDTO) => void;
}

export function VehicleCard({ vehicle, onEdit, onRemove }: VehicleCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {vehicle.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vehicle.imageUrl} alt={vehicle.licensePlate} className="size-full object-cover" />
        ) : (
          <Car className="size-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{vehicle.licensePlate}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[vehicle.brandName, vehicle.modelName].filter(Boolean).join(" • ") || "Chưa rõ hãng xe"}
        </p>
      </div>

      {(onEdit || onRemove) && (
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(vehicle)}>
              <Pencil className="size-3.5" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              onClick={() => onRemove(vehicle)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
