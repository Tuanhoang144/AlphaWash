// File: components/confirm-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm w-full space-y-4 p-6 rounded-xl border shadow-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-3">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-md">
              {title || "Bạn có chắc chắn muốn xóa dịch vụ này không?"}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-end gap-2 border-t pt-3 mt-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>Hủy</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>Xóa</Button>
        </div>
        <p className="text-center text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
      </DialogContent>
    </Dialog>
  );
}
