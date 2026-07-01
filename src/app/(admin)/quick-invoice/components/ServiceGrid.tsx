"use client";

import { useState, useMemo } from "react";
import { QuickServiceGroup, QuickServiceItem } from "@/types/QuickInvoice";
import ServiceCard from "./ServiceCard";

interface ServiceGridProps {
  serviceGroups: QuickServiceGroup[];
  vehicleSize: string;
  selectedServices: QuickServiceItem[];
  favorites: string[];
  onToggleService: (
    serviceCode: string,
    serviceName: string,
    catalogs: { catalogCode: string; size: string; price: number }[]
  ) => void;
  onToggleFavorite: (serviceCode: string) => void;
}

export default function ServiceGrid({
  serviceGroups,
  vehicleSize,
  selectedServices,
  favorites,
  onToggleService,
  onToggleFavorite,
}: ServiceGridProps) {
  const tabs = useMemo(() => {
    const all: { code: string; name: string }[] = [];
    if (favorites.length > 0) {
      all.push({ code: "__favorites__", name: "Yêu thích" });
    }
    serviceGroups.forEach((g) => {
      all.push({ code: g.serviceTypeCode, name: g.serviceTypeName });
    });
    return all;
  }, [serviceGroups, favorites]);

  const [activeTab, setActiveTab] = useState<string>(() => tabs[0]?.code ?? "");

  const displayedServices = useMemo(() => {
    if (activeTab === "__favorites__") {
      return serviceGroups
        .flatMap((g) => g.services)
        .filter((s) => favorites.includes(s.serviceCode));
    }
    return serviceGroups.find((g) => g.serviceTypeCode === activeTab)?.services ?? [];
  }, [activeTab, serviceGroups, favorites]);

  const selectedCodes = useMemo(
    () => new Set(selectedServices.map((s) => s.serviceCode)),
    [selectedServices]
  );

  if (serviceGroups.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.code}
            onClick={() => setActiveTab(tab.code)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.code
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Service cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayedServices.map((service) => (
          <ServiceCard
            key={service.serviceCode}
            service={service}
            vehicleSize={vehicleSize}
            isSelected={selectedCodes.has(service.serviceCode)}
            isFavorite={favorites.includes(service.serviceCode)}
            onToggle={() =>
              onToggleService(service.serviceCode, service.serviceName, service.catalogs)
            }
            onToggleFavorite={() => onToggleFavorite(service.serviceCode)}
          />
        ))}
      </div>

      {displayedServices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {activeTab === "__favorites__"
            ? "Chưa có dịch vụ yêu thích. Nhấn vào ngôi sao để thêm."
            : "Không có dịch vụ trong nhóm này."}
        </div>
      )}
    </div>
  );
}
