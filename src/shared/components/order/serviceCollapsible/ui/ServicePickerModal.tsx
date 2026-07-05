"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Search, X, Star, Clock, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ServiceDTO } from "@/types/OrderResponse";

const FAVORITES_KEY = "order-service-favorites";
const RECENT_KEY = "order-service-recent";
const MAX_RECENT = 10;
const TAB_ALL = "__all__";
const TAB_FAVORITES = "__favorites__";
const TAB_RECENT = "__recent__";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

interface ServicePickerModalProps {
  open: boolean;
  onClose: () => void;
  allServices: ServiceDTO[];
  loadingServices: boolean;
  selectedServiceIds: number[];
  onSelectService: (serviceId: number) => void;
  serviceTypeNames?: Record<string, string>;
}

interface ServiceGroup {
  typeCode: string;
  typeName: string;
}

export default function ServicePickerModal({
  open,
  onClose,
  allServices,
  loadingServices,
  selectedServiceIds,
  onSelectService,
  serviceTypeNames = {},
}: ServicePickerModalProps) {
  const [activeTab, setActiveTab] = useState(TAB_ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAllCategories, setSearchAllCategories] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() =>
    loadFromStorage(FAVORITES_KEY, [])
  );
  const [recentIds, setRecentIds] = useState<number[]>(() =>
    loadFromStorage(RECENT_KEY, [])
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSearchQuery("");
    setSearchAllCategories(false);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [open]);

  const serviceGroups = useMemo<ServiceGroup[]>(() => {
    const map = new Map<string, string>();
    allServices.forEach((s) => {
      if (s.serviceTypeCode && !map.has(s.serviceTypeCode)) {
        map.set(
          s.serviceTypeCode,
          serviceTypeNames[s.serviceTypeCode] || s.serviceTypeCode
        );
      }
    });
    return Array.from(map, ([typeCode, typeName]) => ({ typeCode, typeName }));
  }, [allServices, serviceTypeNames]);

  const tabs = useMemo(() => {
    const list: { code: string; name: string; icon?: "star" | "clock" }[] = [
      { code: TAB_ALL, name: "Tất cả" },
    ];
    if (favorites.length > 0) {
      list.push({ code: TAB_FAVORITES, name: "Yêu thích", icon: "star" });
    }
    if (recentIds.length > 0) {
      list.push({ code: TAB_RECENT, name: "Gần đây", icon: "clock" });
    }
    serviceGroups.forEach((g) => {
      list.push({ code: g.typeCode, name: g.typeName });
    });
    return list;
  }, [serviceGroups, favorites, recentIds]);

  const displayedServices = useMemo(() => {
    let source: ServiceDTO[];

    if (activeTab === TAB_ALL) {
      source = allServices;
    } else if (activeTab === TAB_FAVORITES) {
      source = allServices.filter((s) => favorites.includes(s.id));
    } else if (activeTab === TAB_RECENT) {
      source = recentIds
        .map((id) => allServices.find((s) => s.id === id))
        .filter(Boolean) as ServiceDTO[];
    } else {
      source = allServices.filter((s) => s.serviceTypeCode === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const searchSource = searchAllCategories ? allServices : source;
      source = searchSource.filter(
        (s) =>
          s.serviceName?.toLowerCase().includes(q) ||
          s.serviceCode?.toLowerCase().includes(q)
      );
    }

    const favSet = new Set(favorites);
    return [...source].sort((a, b) => {
      const aFav = favSet.has(a.id) ? 0 : 1;
      const bFav = favSet.has(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return (a.serviceName ?? "").localeCompare(b.serviceName ?? "", "vi");
    });
  }, [activeTab, allServices, favorites, recentIds, searchQuery, searchAllCategories]);

  const toggleFavorite = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (service: ServiceDTO) => {
      if (selectedServiceIds.includes(service.id)) return;

      setRecentIds((prev) => {
        const next = [service.id, ...prev.filter((id) => id !== service.id)].slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        return next;
      });

      onSelectService(service.id);
      onClose();
    },
    [selectedServiceIds, onSelectService, onClose]
  );

  const disabledSet = useMemo(
    () => new Set(selectedServiceIds),
    [selectedServiceIds]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Chọn dịch vụ</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm theo tên hoặc mã dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {searchQuery.trim() && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchAllCategories}
                onChange={(e) => setSearchAllCategories(e.target.checked)}
                className="rounded border-input"
              />
              Tìm trong tất cả danh mục
            </label>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.code}
                onClick={() => {
                  setActiveTab(tab.code);
                  if (!searchAllCategories) setSearchQuery("");
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.code
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.icon === "star" && <Star className="h-3.5 w-3.5" />}
                {tab.icon === "clock" && <Clock className="h-3.5 w-3.5" />}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {loadingServices ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Đang tải danh sách dịch vụ...
            </div>
          ) : displayedServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchQuery.trim()
                ? "Không tìm thấy dịch vụ phù hợp."
                : activeTab === TAB_FAVORITES
                  ? "Chưa có dịch vụ yêu thích."
                  : activeTab === TAB_RECENT
                    ? "Chưa có dịch vụ gần đây."
                    : "Không có dịch vụ trong nhóm này."}
            </div>
          ) : (
            <div className="space-y-1">
              {displayedServices.map((service) => {
                const isDisabled = disabledSet.has(service.id);
                const isFav = favorites.includes(service.id);
                return (
                  <div
                    key={service.id}
                    role="button"
                    tabIndex={isDisabled ? -1 : 0}
                    onClick={() => handleSelect(service)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(service); } }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed bg-muted/50"
                        : "hover:bg-muted/80 active:bg-muted cursor-pointer"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(service.id, e)}
                      className="p-1 rounded-full hover:bg-muted/80 shrink-0"
                      tabIndex={-1}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          isFav
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {service.serviceName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{service.serviceCode || (service as any).code}</span>
                        {service.duration && (
                          <>
                            <span>·</span>
                            <span>{service.duration}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isDisabled && (
                      <div className="flex items-center gap-1 text-xs text-primary shrink-0">
                        <Check className="h-3.5 w-3.5" />
                        Đã chọn
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
