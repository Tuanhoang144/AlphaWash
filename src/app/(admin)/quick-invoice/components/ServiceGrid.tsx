"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Search, X, Star, Clock } from "lucide-react";
import { QuickServiceGroup, QuickServiceItem, QuickService } from "@/types/QuickInvoice";
import ServiceCard from "./ServiceCard";

interface ServiceGridProps {
  serviceGroups: QuickServiceGroup[];
  vehicleSize: string;
  selectedServices: QuickServiceItem[];
  favorites: string[];
  recentServiceCodes: string[];
  onToggleService: (
    serviceCode: string,
    serviceName: string,
    catalogs: { catalogCode: string; size: string; price: number }[]
  ) => void;
  onUpdateQuantity: (serviceCode: string, delta: number) => void;
  onToggleFavorite: (serviceCode: string) => void;
}

const TAB_FAVORITES = "__favorites__";
const TAB_RECENT = "__recent__";

export default function ServiceGrid({
  serviceGroups,
  vehicleSize,
  selectedServices,
  favorites,
  recentServiceCodes,
  onToggleService,
  onUpdateQuantity,
  onToggleFavorite,
}: ServiceGridProps) {
  const [activeTab, setActiveTab] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAllCategories, setSearchAllCategories] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allServicesFlat = useMemo(
    () => serviceGroups.flatMap((g) => g.services),
    [serviceGroups]
  );

  const tabs = useMemo(() => {
    const list: { code: string; name: string; icon?: "star" | "clock" }[] = [];
    if (favorites.length > 0) {
      list.push({ code: TAB_FAVORITES, name: "Yêu thích", icon: "star" });
    }
    if (recentServiceCodes.length > 0) {
      list.push({ code: TAB_RECENT, name: "Gần đây", icon: "clock" });
    }
    serviceGroups.forEach((g) => {
      list.push({ code: g.serviceTypeCode, name: g.serviceTypeName });
    });
    return list;
  }, [serviceGroups, favorites, recentServiceCodes]);

  const effectiveTab = activeTab || tabs[0]?.code || "";

  const displayedServices = useMemo(() => {
    let services: QuickService[];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const source = searchAllCategories
        ? allServicesFlat
        : effectiveTab === TAB_FAVORITES
          ? allServicesFlat.filter((s) => favorites.includes(s.serviceCode))
          : effectiveTab === TAB_RECENT
            ? recentServiceCodes
                .map((code) => allServicesFlat.find((s) => s.serviceCode === code))
                .filter(Boolean) as QuickService[]
            : serviceGroups.find((g) => g.serviceTypeCode === effectiveTab)?.services ?? [];

      services = source.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(q) ||
          s.serviceCode.toLowerCase().includes(q)
      );
    } else if (effectiveTab === TAB_FAVORITES) {
      services = allServicesFlat.filter((s) => favorites.includes(s.serviceCode));
    } else if (effectiveTab === TAB_RECENT) {
      services = recentServiceCodes
        .map((code) => allServicesFlat.find((s) => s.serviceCode === code))
        .filter(Boolean) as QuickService[];
    } else {
      services = serviceGroups.find((g) => g.serviceTypeCode === effectiveTab)?.services ?? [];
    }

    // Sort: favorites first, then alphabetical
    const favSet = new Set(favorites);
    return [...services].sort((a, b) => {
      const aFav = favSet.has(a.serviceCode) ? 0 : 1;
      const bFav = favSet.has(b.serviceCode) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.serviceName.localeCompare(b.serviceName, "vi");
    });
  }, [searchQuery, searchAllCategories, effectiveTab, serviceGroups, allServicesFlat, favorites, recentServiceCodes]);

  const selectedMap = useMemo(() => {
    const map = new Map<string, QuickServiceItem>();
    selectedServices.forEach((s) => map.set(s.serviceCode, s));
    return map;
  }, [selectedServices]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchAllCategories(false);
    searchInputRef.current?.focus();
  }, []);

  if (serviceGroups.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Tìm dịch vụ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-10 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search all categories toggle */}
      {searchQuery.trim() && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none px-1">
          <input
            type="checkbox"
            checked={searchAllCategories}
            onChange={(e) => setSearchAllCategories(e.target.checked)}
            className="rounded border-input"
          />
          Tìm trong tất cả danh mục
        </label>
      )}

      {/* Category tabs - sticky on mobile */}
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur -mx-4 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.code}
              onClick={() => {
                setActiveTab(tab.code);
                setSearchQuery("");
                setSearchAllCategories(false);
              }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 min-h-[40px] ${
                effectiveTab === tab.code
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 active:bg-muted/60"
              }`}
            >
              {tab.icon === "star" && <Star className="h-3.5 w-3.5" />}
              {tab.icon === "clock" && <Clock className="h-3.5 w-3.5" />}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Service cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayedServices.map((service) => {
          const selected = selectedMap.get(service.serviceCode);
          return (
            <ServiceCard
              key={service.serviceCode}
              service={service}
              vehicleSize={vehicleSize}
              isSelected={!!selected}
              selectedQuantity={selected?.quantity ?? 0}
              isFavorite={favorites.includes(service.serviceCode)}
              onToggle={() =>
                onToggleService(service.serviceCode, service.serviceName, service.catalogs)
              }
              onUpdateQuantity={(delta) => onUpdateQuantity(service.serviceCode, delta)}
              onToggleFavorite={() => onToggleFavorite(service.serviceCode)}
            />
          );
        })}
      </div>

      {displayedServices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {searchQuery.trim()
            ? "Không tìm thấy dịch vụ phù hợp."
            : effectiveTab === TAB_FAVORITES
              ? "Chưa có dịch vụ yêu thích. Nhấn vào ⭐ để thêm."
              : effectiveTab === TAB_RECENT
                ? "Chưa có dịch vụ đã sử dụng gần đây."
                : "Không có dịch vụ trong nhóm này."}
        </div>
      )}
    </div>
  );
}
