"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, Car } from "lucide-react";
import { addToast } from "@heroui/toast";
import { useBrandManager, type BrandResponse } from "@/services/useBrandManager";
import { useModelManager, type ModelWithoutBrand } from "@/services/useModelManager";

const SIZE_OPTIONS = ["S", "M", "L", "XL"];

// ── Confirm delete dialog ────────────────────────────────────────────────────
function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  loading: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Brands tab ───────────────────────────────────────────────────────────────
function BrandsTab() {
  const { getAllBrands, createBrand, updateBrand, deleteBrand } = useBrandManager();
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BrandResponse | null>(null);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BrandResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBrands();
      setBrands(data);
    } finally {
      setLoading(false);
    }
  }, [getAllBrands]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setFormName("");
    setFormOpen(true);
  };

  const openEdit = (brand: BrandResponse) => {
    setEditTarget(brand);
    setFormName(brand.brandName);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateBrand(editTarget.id, { brandName: formName.trim() });
        addToast({ title: "Thành công", description: "Đã cập nhật hãng xe.", color: "success" });
      } else {
        await createBrand({ brandName: formName.trim() });
        addToast({ title: "Thành công", description: "Đã thêm hãng xe.", color: "success" });
      }
      setFormOpen(false);
      await load();
    } catch {
      addToast({ title: "Lỗi", description: "Không thể lưu hãng xe.", color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBrand(deleteTarget.id);
      addToast({ title: "Thành công", description: "Đã xóa hãng xe.", color: "success" });
      setDeleteTarget(null);
      await load();
    } catch {
      addToast({ title: "Lỗi", description: "Không thể xóa hãng xe.", color: "danger" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{brands.length} hãng xe</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> Thêm hãng xe
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Tên hãng</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="size-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Chưa có hãng xe nào
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand, idx) => (
                <TableRow key={brand.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{brand.code}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{brand.brandName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(brand)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(brand)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Brand form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Sửa hãng xe" : "Thêm hãng xe"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tên hãng xe <span className="text-red-500">*</span></Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: Toyota, Honda..."
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            {editTarget && (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Mã hãng (tự động)</Label>
                <Input value={editTarget.code} disabled className="bg-muted" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editTarget ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Xóa hãng xe"
        description={`Bạn có chắc muốn xóa hãng "${deleteTarget?.brandName}"? Các dòng xe thuộc hãng này cũng sẽ bị ảnh hưởng.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ── Models tab ───────────────────────────────────────────────────────────────
function ModelsTab() {
  const { getAllBrands } = useBrandManager();
  const { getModelsByBrandCode, createModel, updateModel, deleteModel } = useModelManager();

  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponse | null>(null);
  const [models, setModels] = useState<ModelWithoutBrand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ModelWithoutBrand | null>(null);
  const [formName, setFormName] = useState("");
  const [formSize, setFormSize] = useState("M");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ModelWithoutBrand | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load brands once
  useEffect(() => {
    setLoadingBrands(true);
    getAllBrands()
      .then((data) => setBrands(data))
      .finally(() => setLoadingBrands(false));
  }, [getAllBrands]);

  const loadModels = useCallback(
    async (brand: BrandResponse) => {
      setLoadingModels(true);
      try {
        const data = await getModelsByBrandCode(brand.code);
        setModels(data);
      } finally {
        setLoadingModels(false);
      }
    },
    [getModelsByBrandCode]
  );

  const handleSelectBrand = (brandId: string) => {
    const brand = brands.find((b) => String(b.id) === brandId) ?? null;
    setSelectedBrand(brand);
    setModels([]);
    if (brand) loadModels(brand);
  };

  const openCreate = () => {
    setEditTarget(null);
    setFormName("");
    setFormSize("M");
    setFormOpen(true);
  };

  const openEdit = (model: ModelWithoutBrand) => {
    setEditTarget(model);
    setFormName(model.modelName);
    setFormSize(model.size);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !selectedBrand) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateModel(editTarget.id, {
          modelName: formName.trim(),
          size: formSize,
          brandId: selectedBrand.id,
        });
        addToast({ title: "Thành công", description: "Đã cập nhật dòng xe.", color: "success" });
      } else {
        await createModel({
          modelName: formName.trim(),
          size: formSize,
          brandId: selectedBrand.id,
        });
        addToast({ title: "Thành công", description: "Đã thêm dòng xe.", color: "success" });
      }
      setFormOpen(false);
      await loadModels(selectedBrand);
    } catch {
      addToast({ title: "Lỗi", description: "Không thể lưu dòng xe.", color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !selectedBrand) return;
    setDeleting(true);
    try {
      await deleteModel(deleteTarget.id);
      addToast({ title: "Thành công", description: "Đã xóa dòng xe.", color: "success" });
      setDeleteTarget(null);
      await loadModels(selectedBrand);
    } catch {
      addToast({ title: "Lỗi", description: "Không thể xóa dòng xe.", color: "danger" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Brand selector */}
      <div className="flex items-end gap-3">
        <div className="flex-1 max-w-xs space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Chọn hãng xe</Label>
          <Select onValueChange={handleSelectBrand} disabled={loadingBrands}>
            <SelectTrigger>
              <SelectValue placeholder={loadingBrands ? "Đang tải..." : "Chọn hãng xe..."} />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.brandName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedBrand && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> Thêm dòng xe
          </Button>
        )}
      </div>

      {/* Models table */}
      {!selectedBrand ? (
        <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
          Chọn hãng xe để xem danh sách dòng xe
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Tên dòng xe</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingModels ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="size-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Chưa có dòng xe nào cho hãng {selectedBrand.brandName}
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model, idx) => (
                  <TableRow key={model.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{model.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{model.modelName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{model.size}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(model)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(model)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Model form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Sửa dòng xe" : `Thêm dòng xe — ${selectedBrand?.brandName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Tên dòng xe <span className="text-red-500">*</span></Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: Vios, City, Mazda3..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Size xe <span className="text-red-500">*</span></Label>
              <Select value={formSize} onValueChange={setFormSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editTarget && (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Mã dòng xe</Label>
                <Input value={editTarget.code} disabled className="bg-muted font-mono text-sm" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editTarget ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Xóa dòng xe"
        description={`Bạn có chắc muốn xóa dòng xe "${deleteTarget?.modelName}"?`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function VehicleBrandsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "models" ? "models" : "brands";

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-foreground font-medium">Hãng & Dòng xe</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Car className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Hãng & Dòng xe</h1>
            <p className="text-sm text-muted-foreground">Quản lý danh sách hãng xe và dòng xe</p>
          </div>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="brands">Hãng xe</TabsTrigger>
            <TabsTrigger value="models">Dòng xe</TabsTrigger>
          </TabsList>
          <TabsContent value="brands" className="mt-4">
            <BrandsTab />
          </TabsContent>
          <TabsContent value="models" className="mt-4">
            <ModelsTab />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}
