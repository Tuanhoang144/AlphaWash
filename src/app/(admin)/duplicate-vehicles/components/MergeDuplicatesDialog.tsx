"use client";

import { useEffect, useMemo, useState } from "react";
import { addToast } from "@heroui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GitMerge, AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useVehicleService } from "@/services/useVehicleService";
import type {
  DuplicateVehicleGroup,
  MergePreviewResult,
  MergeVehicleResult,
  VehiclePreviewStats,
} from "@/types/Vehicle";

const NO_CUSTOMER_VALUE = "__none__";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: DuplicateVehicleGroup | null;
  onMerged: () => void;
}

function formatVND(value: number): string {
  return value.toLocaleString("vi-VN") + " đ";
}

export default function MergeDuplicatesDialog({
  open,
  onOpenChange,
  group,
  onMerged,
}: Props) {
  const { mergeDuplicateVehicles, getMergePreview } = useVehicleService();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [primaryVehicleId, setPrimaryVehicleId] = useState<string>("");
  const [primaryCustomerId, setPrimaryCustomerId] = useState<string | null>(null);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<MergePreviewResult | null>(null);
  const [previewError, setPreviewError] = useState("");

  const [merging, setMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeVehicleResult | null>(null);

  useEffect(() => {
    if (open && group) {
      const firstVehicle = group.vehicles[0];
      setStep(1);
      setPrimaryVehicleId(firstVehicle?.id ?? "");
      setPrimaryCustomerId(firstVehicle?.customer?.id ?? null);
      setPreview(null);
      setPreviewError("");
      setMergeResult(null);
    }
  }, [open, group]);

  const uniqueCustomers = useMemo(() => {
    if (!group) return [];
    const seen = new Map<string, { id: string; name: string; phone: string }>();
    for (const v of group.vehicles) {
      if (v.customer && !seen.has(v.customer.id)) {
        seen.set(v.customer.id, v.customer);
      }
    }
    return Array.from(seen.values());
  }, [group]);

  const duplicateVehicleIds = useMemo(
    () => group?.vehicles.filter((v) => v.id !== primaryVehicleId).map((v) => v.id) ?? [],
    [group, primaryVehicleId]
  );

  const primaryVehicle = group?.vehicles.find((v) => v.id === primaryVehicleId) ?? null;
  const primaryCustomerName =
    primaryCustomerId === null
      ? "Không có khách hàng"
      : uniqueCustomers.find((c) => c.id === primaryCustomerId)?.name ?? "";

  const loadPreview = async () => {
    if (!group || !primaryVehicleId) return;
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const result = await getMergePreview(
        group.vehicles.map((v) => v.id),
        primaryCustomerId
      );
      setPreview(result);
    } catch {
      setPreviewError("Không thể tải bản xem trước. Vui lòng thử lại.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleNext = () => {
    setStep(2);
    loadPreview();
  };

  const handleConfirm = async () => {
    if (!group || !primaryVehicleId) return;
    setMerging(true);
    try {
      const result = await mergeDuplicateVehicles({
        primaryVehicleId,
        primaryCustomerId,
        duplicateVehicleIds,
      });
      setMergeResult(result);
      setStep(3);
      addToast({
        title: "Gộp xe thành công",
        description: `Biển số ${group.normalizedPlate} đã được gộp.`,
        color: "success",
      });
    } catch {
      addToast({
        title: "Lỗi",
        description: "Không thể gộp các xe trùng lặp. Vui lòng thử lại.",
        color: "danger",
      });
    } finally {
      setMerging(false);
    }
  };

  const handleDone = () => {
    onOpenChange(false);
    onMerged();
  };

  const findStats = (vehicleId: string): VehiclePreviewStats | undefined =>
    preview?.vehicles.find((v) => v.vehicleId === vehicleId);

  const renderStatsCard = (vehicleId: string, licensePlate: string, isPrimary: boolean) => {
    const stats = findStats(vehicleId);
    return (
      <Card
        key={vehicleId}
        className={isPrimary ? "border-primary" : "border-destructive/40"}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{licensePlate}</span>
            <span
              className={
                isPrimary
                  ? "text-xs font-medium text-primary"
                  : "text-xs font-medium text-destructive"
              }
            >
              {isPrimary ? "Xe chính" : "Sẽ gộp"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {stats ? (
            <>
              <div className="text-muted-foreground">
                {stats.customer
                  ? `${stats.customer.name} (${stats.customer.phone})`
                  : "Chưa có khách hàng"}
              </div>
              <div>Số hóa đơn: {stats.invoiceCount}</div>
              <div>Lịch sử dịch vụ: {stats.serviceHistoryCount}</div>
              <div>Lịch hẹn: {stats.appointmentCount}</div>
              <div>Tổng chi tiêu: {formatVND(stats.totalSpending)}</div>
              <div>Lần dùng dịch vụ cuối: {stats.lastVisitDate || "—"}</div>
            </>
          ) : (
            <div className="text-muted-foreground">Không có dữ liệu</div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            Gộp xe trùng biển số {group?.normalizedPlate}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Bước 1/3: Chọn xe chính và khách hàng chính."}
            {step === 2 && "Bước 2/3: Xem trước dữ liệu sẽ được chuyển."}
            {step === 3 && "Bước 3/3: Kết quả gộp xe."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && group && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Xe chính (giữ lại)</Label>
              <RadioGroup
                value={primaryVehicleId}
                onValueChange={(value) => {
                  setPrimaryVehicleId(value);
                  const vehicle = group.vehicles.find((v) => v.id === value);
                  setPrimaryCustomerId(vehicle?.customer?.id ?? primaryCustomerId);
                }}
                className="gap-3"
              >
                {group.vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-start gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary"
                  >
                    <RadioGroupItem value={v.id} id={v.id} className="mt-1" />
                    <Label htmlFor={v.id} className="flex-1 cursor-pointer font-normal">
                      <div className="font-medium">
                        {v.licensePlate} — {v.brandName} {v.modelName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {v.customer
                          ? `${v.customer.name} (${v.customer.phone})`
                          : "Chưa có khách hàng"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {v.ordersCount} đơn hàng · {v.invoicesCount} hóa đơn
                        {v.lastServiceDate ? ` · Lần cuối: ${v.lastServiceDate}` : ""}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-2 block">Khách hàng chính</Label>
              <Select
                value={primaryCustomerId ?? NO_CUSTOMER_VALUE}
                onValueChange={(value) =>
                  setPrimaryCustomerId(value === NO_CUSTOMER_VALUE ? null : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCustomers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </SelectItem>
                  ))}
                  <SelectItem value={NO_CUSTOMER_VALUE}>Không có khách hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {previewLoading && (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Đang tải bản xem trước...
              </div>
            )}

            {!previewLoading && previewError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {previewError}
              </div>
            )}

            {!previewLoading && preview && primaryVehicle && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderStatsCard(primaryVehicle.id, primaryVehicle.licensePlate, true)}
                  <div className="space-y-3">
                    {duplicateVehicleIds.map((id) => {
                      const v = group?.vehicles.find((gv) => gv.id === id);
                      return v ? renderStatsCard(v.id, v.licensePlate, false) : null;
                    })}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  {preview.totalInvoices} hóa đơn + {preview.totalHistoryRecords} bản ghi
                  lịch sử dịch vụ sẽ được chuyển sang xe chính.
                </div>

                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 flex gap-2 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Toàn bộ hóa đơn và lịch sử dịch vụ sẽ được chuyển sang khách hàng{" "}
                    <strong>{primaryCustomerName || "Không có khách hàng"}</strong> và xe{" "}
                    <strong>{primaryVehicle.licensePlate}</strong>. Hành động này không thể
                    hoàn tác.
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && mergeResult && (
          <div className="space-y-3">
            <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
              <div className="flex items-center gap-2 font-medium mb-2">
                <CheckCircle2 className="h-5 w-5" />
                Gộp xe thành công
              </div>
              <ul className="space-y-1 text-sm">
                <li>{mergeResult.invoicesMigrated} hóa đơn đã được chuyển</li>
                <li>{mergeResult.appointmentsMigrated} lịch hẹn đã được chuyển</li>
                <li>{mergeResult.historyRecordsMigrated} bản ghi lịch sử dịch vụ đã được chuyển</li>
                <li>{mergeResult.notesMigrated} ghi chú đã được chuyển</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!primaryVehicleId || duplicateVehicleIds.length === 0}
              >
                Tiếp theo
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quay lại
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={merging || previewLoading || !preview}
              >
                {merging && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Xác nhận gộp
              </Button>
            </>
          )}

          {step === 3 && (
            <Button type="button" onClick={handleDone}>
              Đóng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
