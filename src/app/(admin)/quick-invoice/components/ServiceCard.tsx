"use client";

import React from "react";
import { Star } from "lucide-react";
import { QuickService } from "@/types/QuickInvoice";

interface ServiceCardProps {
  service: QuickService;
  vehicleSize: string;
  isSelected: boolean;
  isFavorite: boolean;
  onToggle: () => void;
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
  isFavorite,
  onToggle,
  onToggleFavorite,
}: ServiceCardProps) {
  const catalog =
    service.catalogs.find((c) => c.size === vehicleSize) ||
    service.catalogs.find((c) => c.size === "M") ||
    service.catalogs[0];

  if (!catalog) return null;

  return (
    <button
      onClick={onToggle}
      className={`relative w-full p-4 rounded-xl border-2 text-left transition-all active:scale-[0.97] ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-input bg-background hover:border-primary/50"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            onToggleFavorite();
          }
        }}
        className="absolute top-2 right-2 p-1"
      >
        <Star
          className={`h-4 w-4 ${
            isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"
          }`}
        />
      </div>
      <div className="pr-6">
        <div className="font-medium text-sm leading-tight line-clamp-2">
          {service.serviceName}
        </div>
        <div className="mt-2 text-base font-bold text-primary">
          {formatPrice(catalog.price)}
        </div>
        {service.duration && (
          <div className="text-xs text-muted-foreground mt-1">{service.duration} phút</div>
        )}
      </div>
    </button>
  );
}

const ServiceCard = React.memo(ServiceCardComponent);
export default ServiceCard;
