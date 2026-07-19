"use client";

import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, Link2, CheckCircle2, ChevronDown, AlertTriangle } from "lucide-react";
import { useVehicleService } from "@/services/useVehicleService";
import type { AutoLinkPreview, AutoLinkResult } from "@/types/Vehicle";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinked: () => void;
}

export default function AutoLinkVehiclesDialog({ open, onOpenChange, onLinked }: Props) {
  const { getAutoLinkPreview, executeAutoLink } = useVehicleService();

  const [step, setStep] = useState<"preview" | "executing" | "result">("preview");
  const [preview, setPreview] = useState<AutoLinkPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [result, setResult] = useState<AutoLinkResult | null>(null);
  const [conflictsOpen, setConflictsOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("preview");
      setPreview(null);
      setPreviewError("");
      setResult(null);
      setConflictsOpen(false);
      loadPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadPreview = async () => {
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const data = await getAutoLinkPreview();
      setPreview(data);
    } catch {
      setPreviewError("Không thể tải dữ liệu preview. Vui lòng thử lại.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecute = async () => {
    setStep("executing");
    try {
      const data = await executeAutoLink();
      setResult(data);
      setStep("result");
      addToast({
        title: "Liên kết hoàn tất",
        description: `Đã liên kết ${data.linked} xe thành công.`,
        color: "success",
      });
    } catch {
      setStep("preview");
      addToast({
        title: "Lỗi",
        description: "Không thể thực hiện liên kết. Vui lòng thử lại.",
        color: "danger",
      });
    }
  };

  const handleDone = () => {
    onOpenChange(false);
    onLinked();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Liên kết xe hàng loạt
          </DialogTitle>
          <DialogDescription>
            {step === "preview" && "Xem trước danh sách xe có thể liên kết tự động với khách hàng."}
            {step === "executing" && "Đang thực hiện liên kết..."}
            {step === "result" && "Kết quả liên kết xe hàng loạt."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* STEP: PREVIEW */}
          {step === "preview" && (
            <div className="space-y-4">
              {previewLoading && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Đang tải dữ liệu...
                </div>
              )}

              {!previewLoading && previewError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {previewError}
                </div>
              )}

              {!previewLoading && preview && (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-card p-3 text-center">
                      <div className="text-2xl font-bold text-foreground">{preview.totalUnlinked}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Xe chưa liên kết</div>
                    </div>
                    <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-center dark:border-green-900 dark:bg-green-950">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">{preview.safeToLink}</div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">Có thể liên kết</div>
                    </div>
                    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-center dark:border-yellow-900 dark:bg-yellow-950">
                      <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{preview.conflicts}</div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">Xung đột</div>
                    </div>
                  </div>

                  {/* Safe-to-link table */}
                  {preview.previewItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Xe sẽ được liên kết tự động ({preview.previewItems.length})
                      </h3>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Biển số</TableHead>
                              <TableHead>Khách hàng</TableHead>
                              <TableHead className="text-right">Số hoá đơn</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {preview.previewItems.map((item) => (
                              <TableRow key={item.vehicleId}>
                                <TableCell className="font-mono font-medium">{item.licensePlate}</TableCell>
                                <TableCell>{item.suggestedCustomerName}</TableCell>
                                <TableCell className="text-right">{item.orderCount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {preview.previewItems.length === 0 && preview.safeToLink === 0 && (
                    <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground text-center">
                      Không có xe nào có thể liên kết tự động.
                    </div>
                  )}

                  {/* Conflicts collapsible */}
                  {preview.conflictItems.length > 0 && (
                    <Collapsible open={conflictsOpen} onOpenChange={setConflictsOpen}>
                      <CollapsibleTrigger asChild>
                        <button className="flex w-full items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200 dark:hover:bg-yellow-900/60">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {preview.conflictItems.length} xe có xung đột — cần xử lý thủ công
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${conflictsOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Biển số</TableHead>
                                <TableHead>Các khách hàng có thể</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {preview.conflictItems.map((item) => (
                                <TableRow key={item.vehicleId}>
                                  <TableCell className="font-mono font-medium align-top pt-3">
                                    {item.licensePlate}
                                  </TableCell>
                                  <TableCell>
                                    <ul className="space-y-0.5">
                                      {item.customerOptions.map((opt) => (
                                        <li key={opt.customerId} className="text-sm">
                                          {opt.customerName}
                                          <span className="ml-1 text-xs text-muted-foreground">
                                            ({opt.orderCount} hoá đơn)
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP: EXECUTING */}
          {step === "executing" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Đang liên kết...</span>
            </div>
          )}

          {/* STEP: RESULT */}
          {step === "result" && result && (
            <div className="space-y-3">
              <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                <div className="flex items-center gap-2 font-medium text-green-800 dark:text-green-200 mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                  Liên kết hoàn tất
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{result.linked}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">Đã liên kết</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground">{result.skipped}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Bỏ qua</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{result.conflicts}</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">Xung đột</div>
                  </div>
                </div>
              </div>
              {result.skipped > 0 || result.conflicts > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {result.skipped} xe bỏ qua (xung đột). Vui lòng xử lý các trường hợp này thủ công.
                </p>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "preview" && (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button
                type="button"
                onClick={handleExecute}
                disabled={previewLoading || !preview || preview.safeToLink === 0}
              >
                <Link2 className="h-4 w-4 mr-1.5" />
                Liên kết ngay ({preview?.safeToLink ?? 0} xe)
              </Button>
            </>
          )}

          {step === "executing" && (
            <Button type="button" variant="outline" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </Button>
          )}

          {step === "result" && (
            <Button type="button" onClick={handleDone}>
              Đóng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
