"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { useState, useEffect } from "react";

type Props = {
  order: PurchaseOrder | null;
  onClose: () => void;
  onSubmit: (code: string, items: { productCode: string; receivedQuantity: number }[]) => void;
};

export function ReceivePODialog({ order, onClose, onSubmit }: Props) {
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});

  useEffect(() => {
    if (order?.items) {
      const initial: Record<string, number> = {};
      order.items.forEach((item) => {
        initial[item.productCode] = 0;
      });
      setReceiveQtys(initial);
    }
  }, [order]);

  const handleSubmit = () => {
    if (!order) return;
    const items = Object.entries(receiveQtys)
      .filter(([, qty]) => qty > 0)
      .map(([productCode, receivedQuantity]) => ({ productCode, receivedQuantity }));
    if (items.length === 0) return;
    onSubmit(order.code, items);
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nhận hàng - {order?.code}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {order?.items?.map((item) => {
            const remaining = item.quantity - (item.receivedQuantity ?? 0);
            return (
              <div key={item.productCode} className="flex items-center gap-3 p-2 border rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    Đặt: {item.quantity} | Đã nhận: {item.receivedQuantity ?? 0} | Còn: {remaining}
                  </p>
                </div>
                <Input
                  type="number"
                  className="w-20"
                  min="0"
                  max={remaining}
                  value={receiveQtys[item.productCode] ?? 0}
                  onChange={(e) =>
                    setReceiveQtys({ ...receiveQtys, [item.productCode]: Math.min(Number(e.target.value), remaining) })
                  }
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit}>Xác nhận nhận hàng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
