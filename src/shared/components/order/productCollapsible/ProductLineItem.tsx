"use client";

import { Minus, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderProductDTO } from "@/types/OrderResponse";
import { formatPrice } from "@/shared/utils/checkValidate";
import { getProductLineTotal } from "@/shared/utils/order/calculatePrice";

interface ProductLineItemProps {
  product: OrderProductDTO;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}

export default function ProductLineItem({
  product,
  onQuantityChange,
  onRemove,
}: ProductLineItemProps) {
  const lineTotal = getProductLineTotal(product);
  const isLowStock =
    product.currentStock !== undefined &&
    product.currentStock !== null &&
    product.quantity > product.currentStock;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{product.productName}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{product.productCode}</span>
          <span>·</span>
          <span>{formatPrice(product.unitPrice)}đ/{product.unit || "cái"}</span>
        </div>
        {isLowStock && (
          <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
            <AlertTriangle className="h-3 w-3" />
            Kho chỉ còn {product.currentStock}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onQuantityChange(Math.max(1, product.quantity - 1))}
          disabled={product.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          min={1}
          value={product.quantity}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (v >= 1) onQuantityChange(v);
          }}
          className="w-14 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onQuantityChange(product.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="text-sm font-medium text-green-600 whitespace-nowrap min-w-[80px] text-right">
        {formatPrice(lineTotal)}đ
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
