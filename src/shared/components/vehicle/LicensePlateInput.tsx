"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Link2,
  ArrowRightLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useVehicleService } from "@/services/useVehicleService";
import { useDebounce } from "@/hooks/useDebounce";
import type { VehicleDTO } from "@/types/OrderResponse";
import type { PlateCheckResult } from "@/types/Vehicle";

type CheckStatus = "idle" | "checking" | "available" | "unlinked" | "owned" | "error";

interface LicensePlateInputProps {
  value: string;
  onChange: (plate: string) => void;
  onBlur?: (plate: string) => void;
  onVehicleLinked: (vehicleId: string, vehicle: VehicleDTO) => void;
  onPlateConfirmed: (plate: string) => void;
  onTransferRequested: (vehicleId: string, vehicle: VehicleDTO) => void;
  onBlockChange?: (blocked: boolean) => void;
  /** Skip duplicate check when the typed plate matches this (e.g. the vehicle's own current plate while editing). */
  excludePlate?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** External validation error (e.g. format), shown below the field. */
  error?: string | null;
}

const normalizePlate = (plate: string) => plate.replace(/\s/g, "").toUpperCase();

export default function LicensePlateInput({
  value,
  onChange,
  onBlur,
  onVehicleLinked,
  onPlateConfirmed,
  onTransferRequested,
  onBlockChange,
  excludePlate,
  label = "Biển số xe",
  placeholder = "29A-12345",
  required,
  disabled,
  error,
}: LicensePlateInputProps) {
  const { checkPlate } = useVehicleService();
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [result, setResult] = useState<PlateCheckResult | null>(null);
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);
  const debouncedPlate = useDebounce(value, 500);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = debouncedPlate.trim();

    if (!trimmed) {
      setStatus("idle");
      setResult(null);
      onBlockChange?.(false);
      return;
    }

    if (excludePlate && normalizePlate(trimmed) === normalizePlate(excludePlate)) {
      setStatus("available");
      setResult(null);
      onBlockChange?.(false);
      onPlateConfirmed(trimmed);
      return;
    }

    const requestId = ++requestIdRef.current;
    setStatus("checking");

    checkPlate(trimmed).then((res) => {
      if (requestId !== requestIdRef.current) return; // stale response, ignore

      if (!res) {
        setStatus("error");
        setResult(null);
        onBlockChange?.(false);
        return;
      }

      setResult(res);

      if (!res.exists) {
        setStatus("available");
        onBlockChange?.(false);
        onPlateConfirmed(trimmed);
      } else if (res.hasCustomer) {
        setStatus("owned");
        onBlockChange?.(true);
      } else {
        setStatus("unlinked");
        onBlockChange?.(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPlate, excludePlate]);

  const handleLink = () => {
    if (result?.vehicle) {
      onVehicleLinked(result.vehicle.id, result.vehicle);
    }
  };

  const handleTransferConfirm = () => {
    if (result?.vehicle) {
      onTransferRequested(result.vehicle.id, result.vehicle);
    }
    setConfirmTransferOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && " *"}
      </Label>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          disabled={disabled}
          required={required}
          className="pr-9"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {status === "checking" && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {status === "available" && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          {status === "unlinked" && (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
          {status === "owned" && <XCircle className="h-4 w-4 text-red-600" />}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {status === "unlinked" && result?.vehicle && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 space-y-2">
          <p className="text-sm font-medium text-yellow-800">
            Biển số này đã tồn tại (xe chưa liên kết khách hàng)
          </p>
          <p className="text-sm text-yellow-700">
            {result.vehicle.brandName} {result.vehicle.modelName}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
            onClick={handleLink}
          >
            <Link2 className="h-4 w-4 mr-1" />
            Liên kết với xe này thay vì tạo mới
          </Button>
        </div>
      )}

      {status === "owned" && result?.vehicle && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 space-y-2">
          <p className="text-sm font-medium text-red-800">
            Biển số này thuộc về {result.customer?.name}
            {result.customer?.phone ? ` (${result.customer.phone})` : ""}
          </p>
          <p className="text-sm text-red-700">
            {result.vehicle.brandName} {result.vehicle.modelName}
          </p>
          <p className="text-xs text-red-600">
            Không thể tạo xe trùng biển số. Nếu muốn gán xe này cho khách hàng khác, hãy chuyển quyền sở hữu.
          </p>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setConfirmTransferOpen(true)}
          >
            <ArrowRightLeft className="h-4 w-4 mr-1" />
            Chuyển quyền sở hữu
          </Button>
        </div>
      )}

      <Dialog open={confirmTransferOpen} onOpenChange={setConfirmTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận chuyển quyền sở hữu xe</DialogTitle>
            <DialogDescription>
              Xe biển số {result?.vehicle?.licensePlate} hiện thuộc về{" "}
              {result?.customer?.name}. Hành động này sẽ chuyển quyền sở hữu xe
              sang khách hàng hiện tại. Bạn có chắc chắn muốn tiếp tục?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmTransferOpen(false)}
            >
              Hủy
            </Button>
            <Button type="button" variant="destructive" onClick={handleTransferConfirm}>
              Xác nhận chuyển
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
