"use client";

import { Clock } from "lucide-react";
import { RecentVehicle } from "@/types/QuickInvoice";

interface RecentVehiclesProps {
  vehicles: RecentVehicle[];
  onSelect: (vehicle: RecentVehicle) => void;
}

export default function RecentVehicles({ vehicles, onSelect }: RecentVehiclesProps) {
  if (vehicles.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Xe gần đây</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {vehicles.map((rv) => (
          <button
            key={rv.vehicleId}
            onClick={() => onSelect(rv)}
            className="flex-shrink-0 min-w-[140px] p-3 rounded-xl border border-input bg-background hover:bg-accent hover:border-primary transition-colors text-left"
          >
            <div className="font-semibold text-sm truncate">{rv.licensePlate}</div>
            <div className="text-xs text-muted-foreground truncate">{rv.customerName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {rv.brandName} {rv.modelName}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
