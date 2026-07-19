"use client";

import { Search, X, Loader2, Car } from "lucide-react";
import { CustomerDTO, VehicleDTO } from "@/types/OrderResponse";

interface VehicleSearchProps {
  searchQuery: string;
  searchResults: CustomerDTO[];
  searching: boolean;
  onSearch: (query: string) => void;
  onSelectVehicle: (vehicle: VehicleDTO, customer: CustomerDTO) => void;
  onClear: () => void;
  onOpenNewVehicleModal?: () => void;
}

export default function VehicleSearch({
  searchQuery,
  searchResults,
  searching,
  onSearch,
  onSelectVehicle,
  onClear,
  onOpenNewVehicleModal,
}: VehicleSearchProps) {
  const trimmedQuery = searchQuery.trim();
  const showNoResults = !searching && trimmedQuery.length >= 2 && searchResults.length === 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Nhập biển số xe hoặc SĐT..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-12 text-lg rounded-xl border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearch("");
              onClear();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {searching && (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Đang tìm kiếm...</span>
        </div>
      )}

      {!searching && searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((customer) =>
            customer.vehicles?.map((vehicle) => (
              <button
                key={vehicle.id || vehicle.licensePlate}
                onClick={() => onSelectVehicle(vehicle, customer)}
                className="w-full p-4 rounded-xl border border-input bg-background hover:bg-accent hover:border-primary transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-base">{vehicle.licensePlate}</div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.brandName} {vehicle.modelName} - Size {vehicle.size}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* No results — open modal to add new vehicle */}
      {showNoResults && (
        <div className="space-y-3 p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            Không tìm thấy xe <span className="font-semibold text-foreground">"{trimmedQuery}"</span>
          </p>
          <button
            onClick={() => onOpenNewVehicleModal?.()}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.97] transition-transform"
          >
            <Car className="h-4 w-4" />
            Thêm xe mới
          </button>
        </div>
      )}
    </div>
  );
}
