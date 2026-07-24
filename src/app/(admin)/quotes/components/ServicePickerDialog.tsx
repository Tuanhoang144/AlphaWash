"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { useServiceCatalog } from "@/services/useServiceCatalog";
import type { ServiceItem } from "@/types/Service";
import { formatShortVND } from "@/shared/utils/formatMoney";

type CarSize = "S" | "M" | "L" | "SEDAN" | "SUV" | "SUV Full Size";

function getPriceForSize(svc: ServiceItem, carSize?: CarSize): number | undefined {
  if (!carSize) return svc.priceM ?? svc.priceS ?? svc.priceL ?? svc.priceSEDAN ?? svc.priceSUV;
  switch (carSize) {
    case "S": return svc.priceS;
    case "M": return svc.priceM;
    case "L": return svc.priceL;
    case "SEDAN": return svc.priceSEDAN;
    case "SUV": return svc.priceSUV;
    case "SUV Full Size": return svc.priceOverSize ?? svc.priceSUV;
    default: return undefined;
  }
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carSize?: CarSize;
  bonusOnly?: boolean;
  onSelect: (svc: ServiceItem, price: number) => void;
}

const ALL_CAT = "Tất cả";

export function ServicePickerDialog({ open, onOpenChange, carSize, bonusOnly, onSelect }: Props) {
  const { getServices, getBonusServices } = useServiceCatalog();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CAT);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const fn = bonusOnly ? getBonusServices : getServices;
    fn().then(setServices).catch(() => setServices([])).finally(() => setLoading(false));
  }, [open, bonusOnly, getServices, getBonusServices]);

  const categories = useMemo(
    () => [ALL_CAT, ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))],
    [services]
  );

  const filtered = useMemo(
    () =>
      services.filter((s) => {
        const matchCat = category === ALL_CAT || s.category === category;
        const matchSearch =
          !search ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.brand ?? "").toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch && s.active;
      }),
    [services, category, search]
  );

  const handleSelect = (svc: ServiceItem) => {
    const price = getPriceForSize(svc, carSize) ?? 0;
    onSelect(svc, price);
    onOpenChange(false);
    setSearch("");
    setCategory(ALL_CAT);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {bonusOnly ? "Chọn dịch vụ tặng kèm" : "Chọn dịch vụ"}
            {carSize && (
              <Badge variant="outline" className="ml-2 text-xs">
                Kích cỡ: {carSize}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Tìm dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Không tìm thấy dịch vụ nào.
            </div>
          ) : (
            filtered.map((svc) => {
              const price = getPriceForSize(svc, carSize);
              return (
                <button
                  key={svc.id}
                  onClick={() => handleSelect(svc)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 hover:border-primary transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{svc.name}</div>
                    <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                      {svc.category && <span>{svc.category}</span>}
                      {svc.brand && <span>· {svc.brand}</span>}
                      {svc.typeDetail && <span>· {svc.typeDetail}</span>}
                      {svc.warranty && <span>· BH: {svc.warranty}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {price ? (
                      <span className="font-semibold text-emerald-700">
                        {formatShortVND(price)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
