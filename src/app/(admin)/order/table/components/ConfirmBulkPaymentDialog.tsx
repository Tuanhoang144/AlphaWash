"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

// ============================================================================
// PROPS
// ============================================================================

interface ConfirmBulkPaymentDialogProps {
  isOpen: boolean;
  isProcessing: boolean;
  selectedCount: number;
  selectedTotalPrice: number;
  onConfirm: () => void;
  onCancel: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ConfirmBulkPaymentDialog: React.FC<ConfirmBulkPaymentDialogProps> = ({
  isOpen,
  isProcessing,
  selectedCount,
  selectedTotalPrice,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onCancel()}>
      <DialogContent showCloseButton={!isProcessing}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Xác nhận thanh toán hàng loạt
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn đánh dấu đã thanh toán cho các hóa đơn đã chọn?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Số hóa đơn:</span>
            <span className="font-semibold">{selectedCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tổng giá trị:</span>
            <span className="font-semibold text-green-600">
              {selectedTotalPrice.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Xác nhận thanh toán
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmBulkPaymentDialog;
