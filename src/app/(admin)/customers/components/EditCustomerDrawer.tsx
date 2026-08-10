"use client";

import { useEffect, useState } from "react";
import { addToast } from "@heroui/react";
import { Loader2, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@radix-ui/react-separator";
import LicensePlateInput from "@/shared/components/vehicle/LicensePlateInput";
import { VehicleCard } from "./VehicleCard";
import { ConfirmDialog } from "./ConfirmDialog";
import { useCustomerService } from "@/services/useCustomerService";
import { useVehicleService } from "@/services/useVehicleService";
import { useBrandManager, type BrandResponse } from "@/services/useBrandManager";
import { useModelManager, type ModelWithoutBrand } from "@/services/useModelManager";
import { isValidVietnamesePhone } from "@/shared/utils/checkValidate";
import {
  CUSTOMER_GENDER_LABELS,
  CUSTOMER_STATUS_LABELS,
  type CustomerDetail,
  type CustomerGender,
  type CustomerStatus,
} from "@/types/Customer";
import type { VehicleDTO } from "@/types/OrderResponse";

interface EditCustomerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerDetail | null;
  onUpdated: (customer: CustomerDetail) => void;
}

const emptyForm = () => ({
  name: "",
  phone: "",
  email: "",
  gender: "" as CustomerGender | "",
  birthday: "",
  address: "",
  note: "",
  status: "ACTIVE" as CustomerStatus,
});

export function EditCustomerDrawer({ open, onOpenChange, customer, onUpdated }: EditCustomerDrawerProps) {
  const { updateCustomer, addVehicleToCustomer, updateVehicle, removeVehicle, getCustomerDetail } =
    useCustomerService();
  const { linkCustomerToVehicle, transferVehicleOwnership } = useVehicleService();
  const { getAllBrands } = useBrandManager();
  const { getModelsByBrandCode } = useModelManager();

  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);

  // Brand/model data
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [newModels, setNewModels] = useState<ModelWithoutBrand[]>([]);
  const [editModels, setEditModels] = useState<ModelWithoutBrand[]>([]);

  // Add vehicle state
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newLinkVehicleId, setNewLinkVehicleId] = useState<string | undefined>(undefined);
  const [newPlateBlocked, setNewPlateBlocked] = useState(false);
  const [newBrandId, setNewBrandId] = useState<number | undefined>(undefined);
  const [newModelId, setNewModelId] = useState<number | undefined>(undefined);
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Edit vehicle state
  const [editingVehicle, setEditingVehicle] = useState<VehicleDTO | null>(null);
  const [editPlate, setEditPlate] = useState("");
  const [editBrandId, setEditBrandId] = useState<number | undefined>(undefined);
  const [editModelId, setEditModelId] = useState<number | undefined>(undefined);
  const [removeTarget, setRemoveTarget] = useState<VehicleDTO | null>(null);
  const [removing, setRemoving] = useState(false);

  // Load brands once on open
  useEffect(() => {
    if (open && brands.length === 0) {
      getAllBrands().then(setBrands).catch(() => {});
    }
  }, [open, getAllBrands, brands.length]);

  const loadModelsFor = async (brandIdOrCode: number | string, target: "new" | "edit") => {
    let code: string;
    if (typeof brandIdOrCode === "string") {
      code = brandIdOrCode;
    } else {
      const brand = brands.find((b) => b.id === brandIdOrCode);
      if (!brand) return;
      code = brand.code;
    }
    try {
      const data = await getModelsByBrandCode(code);
      if (target === "new") setNewModels(data);
      else setEditModels(data);
    } catch {}
  };

  useEffect(() => {
    if (customer && open) {
      setForm({
        name: customer.name ?? "",
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        gender: customer.gender ?? "",
        birthday: customer.birthday?.substring(0, 10) ?? "",
        address: customer.address ?? "",
        note: customer.note ?? "",
        status: customer.status ?? "ACTIVE",
      });
      setErrors({});
      setAddingVehicle(false);
      setNewPlate("");
      setNewLinkVehicleId(undefined);
      setNewPlateBlocked(false);
      setNewBrandId(undefined);
      setNewModelId(undefined);
      setEditingVehicle(null);
      setEditBrandId(undefined);
      setEditModelId(undefined);
    }
  }, [customer, open]);

  const update = (field: keyof ReturnType<typeof emptyForm>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const refreshCustomer = async () => {
    if (!customer) return;
    const fresh = await getCustomerDetail(customer.id);
    if (fresh) onUpdated(fresh);
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Tên khách hàng là bắt buộc";
    if (!form.phone.trim()) next.phone = "Số điện thoại là bắt buộc";
    else if (!isValidVietnamesePhone(form.phone)) next.phone = "Số điện thoại không hợp lệ";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const updated = await updateCustomer(customer.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        gender: form.gender || undefined,
        birthday: form.birthday || undefined,
        address: form.address.trim() || undefined,
        note: form.note.trim() || undefined,
        status: form.status,
      });
      if (updated) {
        addToast({ title: "Thành công", description: "Đã cập nhật khách hàng.", color: "success" });
        onUpdated(updated);
        onOpenChange(false);
      }
    } catch (error: any) {
      addToast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật khách hàng.",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNewVehicle = async () => {
    if (!customer || !newPlate.trim()) return;
    setSavingVehicle(true);
    try {
      if (newLinkVehicleId) {
        await linkCustomerToVehicle(newLinkVehicleId, customer.id);
      } else {
        await addVehicleToCustomer(customer.id, {
          licensePlate: newPlate.trim(),
          brandId: newBrandId,
          modelId: newModelId,
        });
      }
      addToast({ title: "Thành công", description: "Đã thêm xe cho khách hàng.", color: "success" });
      setAddingVehicle(false);
      setNewPlate("");
      setNewLinkVehicleId(undefined);
      setNewPlateBlocked(false);
      setNewBrandId(undefined);
      setNewModelId(undefined);
      setNewModels([]);
      await refreshCustomer();
    } catch (error: any) {
      addToast({ title: "Lỗi", description: error?.message || "Không thể thêm xe.", color: "danger" });
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleTransferToThisCustomer = async (vehicleId: string) => {
    if (!customer) return;
    setSavingVehicle(true);
    try {
      await transferVehicleOwnership(vehicleId, customer.id);
      addToast({ title: "Thành công", description: "Đã chuyển quyền sở hữu xe.", color: "success" });
      setAddingVehicle(false);
      setNewPlate("");
      await refreshCustomer();
    } catch (error: any) {
      addToast({ title: "Lỗi", description: error?.message || "Không thể chuyển quyền sở hữu.", color: "danger" });
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleSaveEditVehicle = async () => {
    if (!customer || !editingVehicle || !editPlate.trim()) return;
    setSavingVehicle(true);
    try {
      await updateVehicle(customer.id, editingVehicle.id, {
        licensePlate: editPlate.trim(),
        brandId: editBrandId,
        modelId: editModelId,
      });
      addToast({ title: "Thành công", description: "Đã cập nhật xe.", color: "success" });
      setEditingVehicle(null);
      setEditBrandId(undefined);
      setEditModelId(undefined);
      setEditModels([]);
      await refreshCustomer();
    } catch (error: any) {
      addToast({ title: "Lỗi", description: error?.message || "Không thể cập nhật xe.", color: "danger" });
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!customer || !removeTarget) return;
    setRemoving(true);
    try {
      await removeVehicle(customer.id, removeTarget.id);
      addToast({ title: "Thành công", description: "Đã gỡ xe khỏi khách hàng.", color: "success" });
      setRemoveTarget(null);
      await refreshCustomer();
    } catch (error: any) {
      addToast({ title: "Lỗi", description: error?.message || "Không thể gỡ xe.", color: "danger" });
    } finally {
      setRemoving(false);
    }
  };

  if (!customer) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chỉnh sửa khách hàng</SheetTitle>
            <SheetDescription>Cập nhật thông tin và quản lý xe của khách hàng.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-4 pb-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium border-b pb-1.5">Thông tin khách hàng</h3>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Tên khách hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Giới tính</Label>
                  <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CUSTOMER_GENDER_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Ngày sinh</Label>
                  <Input type="date" value={form.birthday} onChange={(e) => update("birthday", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Trạng thái</Label>
                  <Select value={form.status} onValueChange={(v) => update("status", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Địa chỉ</Label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Ghi chú</Label>
                <Textarea
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            <Separator className="h-px bg-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Xe của khách hàng ({customer.vehicles.length})</h3>
                {!addingVehicle && (
                  <Button variant="outline" size="sm" onClick={() => setAddingVehicle(true)}>
                    <Plus className="size-3.5" /> Thêm xe
                  </Button>
                )}
              </div>

              {addingVehicle && (
                <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                  <LicensePlateInput
                    label=""
                    value={newPlate}
                    onChange={(v) => {
                      setNewPlate(v);
                      setNewLinkVehicleId(undefined);
                    }}
                    onVehicleLinked={(vehicleId) => setNewLinkVehicleId(vehicleId)}
                    onPlateConfirmed={() => setNewLinkVehicleId(undefined)}
                    onTransferRequested={(vehicleId) => handleTransferToThisCustomer(vehicleId)}
                    onBlockChange={setNewPlateBlocked}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Hãng xe</Label>
                      <Select
                        value={newBrandId ? String(newBrandId) : ""}
                        onValueChange={(v) => {
                          const id = Number(v);
                          setNewBrandId(id);
                          setNewModelId(undefined);
                          setNewModels([]);
                          loadModelsFor(id, "new");
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Chọn hãng" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.brandName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dòng xe</Label>
                      <Select
                        value={newModelId ? String(newModelId) : ""}
                        onValueChange={(v) => setNewModelId(Number(v))}
                        disabled={!newBrandId || newModels.length === 0}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={!newBrandId ? "Chọn hãng trước" : "Chọn dòng"} />
                        </SelectTrigger>
                        <SelectContent>
                          {newModels.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAddingVehicle(false);
                        setNewPlate("");
                        setNewLinkVehicleId(undefined);
                        setNewBrandId(undefined);
                        setNewModelId(undefined);
                        setNewModels([]);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNewVehicle}
                      disabled={savingVehicle || !newPlate.trim() || newPlateBlocked}
                    >
                      {savingVehicle && <Loader2 className="size-3.5 animate-spin" />}
                      Lưu
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {customer.vehicles.map((v) =>
                  editingVehicle?.id === v.id ? (
                    <div key={v.id} className="space-y-2 rounded-lg border bg-muted/20 p-3">
                      <LicensePlateInput
                        label=""
                        value={editPlate}
                        onChange={setEditPlate}
                        excludePlate={v.licensePlate}
                        onVehicleLinked={() => {}}
                        onPlateConfirmed={() => {}}
                        onTransferRequested={() => {}}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Hãng xe</Label>
                          <Select
                            value={editBrandId ? String(editBrandId) : ""}
                            onValueChange={(val) => {
                              const id = Number(val);
                              setEditBrandId(id);
                              setEditModelId(undefined);
                              setEditModels([]);
                              loadModelsFor(id, "edit");
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Chọn hãng" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>{b.brandName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Dòng xe</Label>
                          <Select
                            value={editModelId ? String(editModelId) : ""}
                            onValueChange={(val) => setEditModelId(Number(val))}
                            disabled={!editBrandId || editModels.length === 0}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder={!editBrandId ? "Chọn hãng trước" : "Chọn dòng"} />
                            </SelectTrigger>
                            <SelectContent>
                              {editModels.map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingVehicle(null);
                            setEditBrandId(undefined);
                            setEditModelId(undefined);
                            setEditModels([]);
                          }}
                        >
                          Hủy
                        </Button>
                        <Button size="sm" onClick={handleSaveEditVehicle} disabled={savingVehicle || !editPlate.trim()}>
                          {savingVehicle && <Loader2 className="size-3.5 animate-spin" />}
                          Lưu
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      onEdit={(vehicle) => {
                        setEditingVehicle(vehicle);
                        setEditPlate(vehicle.licensePlate);
                        setEditBrandId(vehicle.brandId || undefined);
                        setEditModelId(vehicle.modelId || undefined);
                        setEditModels([]);
                        if (vehicle.brandCode) {
                          loadModelsFor(vehicle.brandCode, "edit").then(() => {
                            if (vehicle.modelId) setEditModelId(vehicle.modelId);
                          });
                        }
                      }}
                      onRemove={(vehicle) => setRemoveTarget(vehicle)}
                    />
                  )
                )}
                {customer.vehicles.length === 0 && !addingVehicle && (
                  <p className="text-xs text-muted-foreground text-center py-3">Chưa có xe nào</p>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button className="flex-1" onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        title="Gỡ xe khỏi khách hàng"
        description={`Bạn có chắc muốn gỡ xe biển số ${removeTarget?.licensePlate} khỏi khách hàng này?`}
        confirmLabel="Gỡ xe"
        loading={removing}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
