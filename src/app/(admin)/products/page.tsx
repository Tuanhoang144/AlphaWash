"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductManager } from "@/services/useProductManager";
import { useProductCategoryManager } from "@/services/useProductCategoryManager";
import { Product, ProductCategory } from "@/types/Product";
import { useEffect, useMemo, useState } from "react";
import { ProductTable } from "./components/ProductTable";
import { ProductDialog } from "./components/ProductDialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Search } from "lucide-react";

export default function ProductsPage() {
  const { getAll, create, update, remove } = useProductManager();
  const { getActive: getCategories } = useProductCategoryManager();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([getAll(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setOpenDialog(true);
  };

  const handleDelete = async (code: string) => {
    setLoading(true);
    await remove(code);
    await refreshData();
    setLoading(false);
  };

  const handleSubmit = async (data: Partial<Product>) => {
    setLoading(true);
    if (editing) {
      await update(editing.code, data);
    } else {
      await create(data);
    }
    await refreshData();
    setOpenDialog(false);
    setEditing(null);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.productName?.toLowerCase().includes(search.toLowerCase()) ||
        p.code?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || p.categoryCode === categoryFilter;
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "low" && p.trackInventory && (p.currentStock ?? 0) <= (p.minStock ?? 0) && (p.currentStock ?? 0) > 0) ||
        (stockFilter === "out" && p.trackInventory && (p.currentStock ?? 0) === 0);
      return matchSearch && matchCategory && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <SidebarInset>
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
          <Button onClick={() => { setEditing(null); setOpenDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, mã, barcode..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>{c.categoryName}</option>
            ))}
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value as "all" | "low" | "out"); setPage(1); }}
          >
            <option value="all">Tất cả tồn kho</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Hết hàng</option>
          </select>
        </div>

        <ProductTable
          products={paginated}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <ProductDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </SidebarInset>
  );
}
