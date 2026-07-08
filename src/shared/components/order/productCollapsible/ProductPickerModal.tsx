"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Search, X, Star, Clock, Check, Package, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product, ProductCategory } from "@/types/Product";
import { formatPrice } from "@/shared/utils/checkValidate";

const FAVORITES_KEY = "order-product-favorites";
const RECENT_KEY = "order-product-recent";
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

interface ProductPickerModalProps {
  open: boolean;
  onClose: () => void;
  allProducts: Product[];
  categories: ProductCategory[];
  loadingProducts: boolean;
  selectedProductCodes: string[];
  onSelectProduct: (product: Product) => void;
}

export default function ProductPickerModal({
  open,
  onClose,
  allProducts,
  categories,
  loadingProducts,
  selectedProductCodes,
  onSelectProduct,
}: ProductPickerModalProps) {
  const [activeTab, setActiveTab] = useState(TAB_ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAllCategories, setSearchAllCategories] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() =>
    loadFromStorage(FAVORITES_KEY, [])
  );
  const [recentCodes, setRecentCodes] = useState<string[]>(() =>
    loadFromStorage(RECENT_KEY, [])
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSearchQuery("");
    setSearchAllCategories(false);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [open]);

  const tabs = useMemo(() => {
    const list: { code: string; name: string; icon?: "star" | "clock"; color?: string }[] = [
      { code: TAB_ALL, name: "Tất cả" },
    ];
    if (favorites.length > 0) {
      list.push({ code: TAB_FAVORITES, name: "Yêu thích", icon: "star" });
    }
    if (recentCodes.length > 0) {
      list.push({ code: TAB_RECENT, name: "Gần đây", icon: "clock" });
    }
    categories.forEach((c) => {
      list.push({ code: c.code, name: c.categoryName, color: c.color });
    });
    return list;
  }, [categories, favorites, recentCodes]);

  const displayedProducts = useMemo(() => {
    let source: Product[];

    if (activeTab === TAB_ALL) {
      source = allProducts;
    } else if (activeTab === TAB_FAVORITES) {
      source = allProducts.filter((p) => favorites.includes(p.code));
    } else if (activeTab === TAB_RECENT) {
      source = recentCodes
        .map((code) => allProducts.find((p) => p.code === code))
        .filter(Boolean) as Product[];
    } else {
      source = allProducts.filter((p) => p.categoryCode === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const searchSource = searchAllCategories ? allProducts : source;
      source = searchSource.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q)
      );
    }

    const favSet = new Set(favorites);
    return [...source].sort((a, b) => {
      const aFav = favSet.has(a.code) ? 0 : 1;
      const bFav = favSet.has(b.code) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return (a.productName ?? "").localeCompare(b.productName ?? "", "vi");
    });
  }, [activeTab, allProducts, favorites, recentCodes, searchQuery, searchAllCategories]);

  const toggleFavorite = useCallback((code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(code)
        ? prev.filter((f) => f !== code)
        : [...prev, code];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (product: Product) => {
      setRecentCodes((prev) => {
        const next = [product.code, ...prev.filter((c) => c !== product.code)].slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        return next;
      });

      onSelectProduct(product);
      onClose();
    },
    [onSelectProduct, onClose]
  );

  const selectedSet = useMemo(
    () => new Set(selectedProductCodes),
    [selectedProductCodes]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chọn sản phẩm
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm theo tên, mã sản phẩm hoặc barcode..."
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
                {tab.color && (
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tab.color }}
                  />
                )}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {loadingProducts ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Đang tải danh sách sản phẩm...
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchQuery.trim()
                ? "Không tìm thấy sản phẩm phù hợp."
                : activeTab === TAB_FAVORITES
                  ? "Chưa có sản phẩm yêu thích."
                  : activeTab === TAB_RECENT
                    ? "Chưa có sản phẩm gần đây."
                    : "Không có sản phẩm trong nhóm này."}
            </div>
          ) : (
            <div className="space-y-1">
              {displayedProducts.map((product) => {
                const isSelected = selectedSet.has(product.code);
                const isFav = favorites.includes(product.code);
                const isOutOfStock =
                  product.trackInventory &&
                  (product.currentStock ?? 0) <= 0;
                const isLowStock =
                  product.trackInventory &&
                  (product.currentStock ?? 0) > 0 &&
                  (product.currentStock ?? 0) <= (product.minStock ?? 0);

                return (
                  <div
                    key={product.code}
                    role="button"
                    tabIndex={isOutOfStock ? -1 : 0}
                    onClick={() => !isOutOfStock && handleSelect(product)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !isOutOfStock) {
                        e.preventDefault();
                        handleSelect(product);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isOutOfStock
                        ? "opacity-40 cursor-not-allowed bg-muted/50"
                        : isSelected
                          ? "opacity-60 cursor-not-allowed bg-muted/50"
                          : "hover:bg-muted/80 active:bg-muted cursor-pointer"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(product.code, e)}
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
                        {product.productName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{product.code}</span>
                        {product.barcode && (
                          <>
                            <span>·</span>
                            <span>{product.barcode}</span>
                          </>
                        )}
                        {product.unit && (
                          <>
                            <span>·</span>
                            <span>{product.unit}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {product.trackInventory && (
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? "bg-red-100 text-red-600"
                            : isLowStock
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                        }`}>
                          {isOutOfStock ? (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Hết hàng
                            </span>
                          ) : (
                            `Kho: ${product.currentStock}`
                          )}
                        </div>
                      )}

                      <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                        {formatPrice(product.sellingPrice ?? 0)}đ
                      </span>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
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
