"use client";

import React from "react";
import { Star, Plus, Minus, Check } from "lucide-react";
import { QuickService } from "@/types/QuickInvoice";

interface ServiceCardProps {
  service: QuickService;
  vehicleSize: string;
  isSelected: boolean;
  selectedQuantity: number;
  isFavorite: boolean;
  onToggle: () => void;
  onUpdateQuantity: (delta: number) => void;
  onToggleFavorite: () => void;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return Number.isInteger(m) ? `${m}tr` : `${m.toFixed(1)}tr`;
  }
  return `${(price / 1000).toFixed(0)}k`;
}

function ServiceCardComponent({
  service,
  vehicleSize,
  isSelected,
  selectedQuantity,
  isFavorite,
  onToggle,
  onUpdateQuantity,
  onToggleFavorite,
}: ServiceCardProps) {
  const catalog =
    service.catalogs.find((c) => c.size === vehicleSize) ||
    service.catalogs.find((c) => c.size === "M") ||
    service.catalogs[0];

  if (!catalog) return null;

  return (
    <div
      className={`relative rounded-xl border-2 transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-input bg-background hover:border-primary/50"
      }`}
    >
      {/* Favorite star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted/80 z-10"
        aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
      >
        <Star
          className={`h-4 w-4 ${
            isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"
          }`}
        />
      </button>

      {/* Main card area - tap to add */}
      <button
        onClick={onToggle}
        className="w-full p-4 pb-2 text-left active:scale-[0.97] transition-transform"
      >
        <div className="pr-7">
          <div className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {service.serviceName}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-base font-bold text-primary">
              {formatPrice(catalog.price)}
            </span>
            {service.duration && (
              <span className="text-xs text-muted-foreground">{service.duration}p</span>
            )}
          </div>
        </div>
      </button>

      {/* Bottom action area */}
      <div className="px-4 pb-3 pt-1">
        {isSelected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(-1);
                }}
                className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm tabular-nums">
                {selectedQuantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(1);
                }}
                className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary active:scale-95 transition-all"
                aria-label="Tăng số lượng"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <Check className="h-3.5 w-3.5" />
              Đã chọn
            </div>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="w-full h-9 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-primary/20 active:scale-[0.97] transition-all"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        )}
      </div>
    </div>
  );
}

const ServiceCard = React.memo(ServiceCardComponent);
export default ServiceCard;
