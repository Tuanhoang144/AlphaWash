"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LayoutGrid, List, Plus, RefreshCw, Search } from "lucide-react";
import { addToast } from "@heroui/toast";

import { ServiceTableNew } from "./components/ServiceTableNew";
import { AddServiceDialog } from "./components/AddServiceDialog";
import { EditServiceDrawer } from "./components/EditServiceDrawer";
import { CategoryGrid, CATEGORY_META } from "./components/CategoryGrid";
import { useServiceCatalog } from "@/services/useServiceCatalog";
import { useServiceCategory } from "@/services/useServiceCategory";
import axiosInstance from "@/config/axiosInstance";
import type { ServiceItem } from "@/types/Service";

const ALL_TAB = "ALL";
const CATEGORIES_VIEW = "__CATEGORIES__";

const FALLBACK_TABS = [
  { value: ALL_TAB, label: "Tất cả" },
  ...CATEGORY_META.map((c) => ({ value: c.key, label: c.label })),
];

export default function ServicesPage() {
  const { getServices, getCategories, createService, updateService, deleteService, toggleActive } =
    useServiceCatalog();
  const { getAll: getAllCategories } = useServiceCategory();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryTabs, setCategoryTabs] = useState(FALLBACK_TABS);
  const [activeCategory, setActiveCategory] = useState(ALL_TAB);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "categories">("list");

  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [svcs, cats] = await Promise.all([
        getServices(),
        getCategories(),
      ]);
      setServices(svcs);
      setCategories(cats);
    } catch {
      // BE not ready — silently ignore, show empty state
    } finally {
      setLoading(false);
    }
  }, [getServices, getCategories]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getAllCategories()
      .then((items) => {
        setCategoryTabs([
          { value: ALL_TAB, label: "Tất cả" },
          ...items.map((c) => ({ value: c.code, label: c.name })),
        ]);
      })
      .catch(() => {
        setCategoryTabs(FALLBACK_TABS);
      });
  }, [getAllCategories]);

  const filtered = services.filter((s) => {
    const matchCat = activeCategory === ALL_TAB || s.category === activeCategory;
    // activeCategory is either ALL_TAB ("ALL") or a category code (e.g. "WASHING")
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.brand ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = async (data: Omit<ServiceItem, "id">) => {
    try {
      await createService(data);
      addToast({ title: "Đã thêm dịch vụ", color: "success" });
      await load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Lỗi không xác định";
      addToast({ title: "Lỗi tạo dịch vụ", description: msg, color: "danger" });
      throw err;
    }
  };

  const handleEdit = (svc: ServiceItem) => {
    setEditService(svc);
    setEditOpen(true);
  };

  const handleSave = async (id: string, data: Partial<ServiceItem>) => {
    try {
      await updateService(id, data);
      addToast({ title: "Đã cập nhật dịch vụ", color: "success" });
      await load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Lỗi không xác định";
      addToast({ title: "Lỗi cập nhật dịch vụ", description: msg, color: "danger" });
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    await deleteService(id);
    addToast({ title: "Đã xóa dịch vụ", color: "success" });
    await load();
  };

  const handleToggleActive = async (svc: ServiceItem, active: boolean) => {
    try {
      await toggleActive(svc.id, active);
      setServices((prev) =>
        prev.map((s) => (s.id === svc.id ? { ...s, active } : s))
      );
    } catch {
      addToast({ title: "Lỗi khi đổi trạng thái", color: "danger" });
    }
  };

  const handleBackfillCategory = async () => {
    setSyncing(true);
    try {
      await axiosInstance.post("/services/backfill-category-code");
      addToast({ title: "Đã đồng bộ danh mục thành công", color: "success" });
      await load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Lỗi không xác định";
      addToast({ title: "Lỗi đồng bộ danh mục", description: msg, color: "danger" });
    } finally {
      setSyncing(false);
    }
  };

  // Click a category card → switch to list view filtered by that category
  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    setView("list");
  };

  return (
    <SidebarInset className="relative w-full">
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/services">Bảng Giá Dịch Vụ</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-6 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bảng Giá Dịch Vụ</h1>
            <p className="text-muted-foreground text-sm">
              {view === "categories"
                ? `${categories.length} danh mục`
                : `${services.length} dịch vụ`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8 px-2.5"
                onClick={() => setView("list")}
                title="Danh sách dịch vụ"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "categories" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8 px-2.5"
                onClick={() => setView("categories")}
                title="Danh mục"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackfillCategory}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
              Đồng bộ danh mục
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm dịch vụ
            </Button>
          </div>
        </div>

        {view === "categories" ? (
          /* ── Categories Grid View ── */
          <CategoryGrid
            categories={categories}
            services={services}
            onSelectCategory={handleSelectCategory}
          />
        ) : (
          /* ── Services List View ── */
          <>
            {/* Search + Category tabs */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Tìm dịch vụ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="flex-wrap h-auto">
                  {categoryTabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Table */}
            <ServiceTableNew
              services={filtered}
              loading={loading}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
            />
          </>
        )}
      </div>

      {/* Dialogs */}
      <AddServiceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={handleAdd}
      />
      <EditServiceDrawer
        open={editOpen}
        service={editService}
        onOpenChange={setEditOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </SidebarInset>
  );
}
