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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { addToast } from "@heroui/toast";

import { useServiceCategory } from "@/services/useServiceCategory";
import type { ServiceCategoryItem, ServiceCategoryRequest } from "@/types/ServiceCategory";

const emptyForm: ServiceCategoryRequest = {
  name: "",
  code: "",
  description: "",
  sortOrder: 0,
  active: true,
};

export default function ServiceCategoriesPage() {
  const { getAll, create, update, remove } = useServiceCategory();

  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceCategoryItem | null>(null);
  const [form, setForm] = useState<ServiceCategoryRequest>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategoryItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAll();
      setCategories(data);
    } catch {
      // silently ignore if BE not ready
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Form helpers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (cat: ServiceCategoryItem) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      code: cat.code,
      description: cat.description ?? "",
      sortOrder: cat.sortOrder,
      active: cat.active,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast({ title: "Tên danh mục không được để trống", color: "danger" });
      return;
    }
    if (!form.code.trim()) {
      addToast({ title: "Code không được để trống", color: "danger" });
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, form);
        addToast({ title: "Đã cập nhật danh mục", color: "success" });
      } else {
        await create(form);
        addToast({ title: "Đã thêm danh mục", color: "success" });
      }
      setFormOpen(false);
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Lỗi không xác định";
      addToast({ title: "Lỗi", description: msg, color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active inline ──────────────────────────────────────────────────

  const handleToggleActive = async (cat: ServiceCategoryItem, active: boolean) => {
    try {
      await update(cat.id, { active });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active } : c))
      );
    } catch {
      addToast({ title: "Lỗi khi đổi trạng thái", color: "danger" });
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const openDelete = (cat: ServiceCategoryItem) => {
    setDeleteTarget(cat);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      addToast({ title: `Đã xóa danh mục "${deleteTarget.name}"`, color: "success" });
      setDeleteOpen(false);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Lỗi không xác định";
      addToast({ title: "Không thể xóa", description: msg, color: "danger" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SidebarInset className="relative w-full">
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/service-categories">Danh mục dịch vụ</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-6 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Danh mục dịch vụ</h1>
            <p className="text-muted-foreground text-sm">{categories.length} danh mục</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm danh mục
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-20 text-center">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Trạng thái</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Chưa có danh mục nào
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat, idx) => (
                  <TableRow key={cat.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {cat.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {cat.description || "—"}
                    </TableCell>
                    <TableCell className="text-center">{cat.sortOrder}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={cat.active}
                        onCheckedChange={(v) => handleToggleActive(cat, v)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDelete(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                placeholder="VD: Rửa xe"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="VD: WASHING"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Dùng chữ IN HOA, không dấu, không cách (VD: WASHING)
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả danh mục..."
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={form.active ?? true}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
              <Label htmlFor="active">Hiển thị (active)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : editTarget ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa danh mục{" "}
            <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>?
            Hành động này không thể hoàn tác. Danh mục đang được dùng bởi dịch vụ sẽ không thể xóa.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
