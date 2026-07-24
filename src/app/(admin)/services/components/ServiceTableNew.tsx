"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Gift, Loader2 } from "lucide-react";
import type { ServiceItem } from "@/types/Service";
import { formatShortVND } from "@/shared/utils/formatMoney";

interface Props {
  services: ServiceItem[];
  loading?: boolean;
  onEdit: (service: ServiceItem) => void;
  onToggleActive: (service: ServiceItem, active: boolean) => void;
}

function PriceCell({ value }: { value?: number }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  return <span className="font-medium text-emerald-700">{formatShortVND(value)}</span>;
}

export function ServiceTableNew({ services, loading, onEdit, onToggleActive }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Đang tải...</span>
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Không có dịch vụ nào.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="min-w-[180px]">Tên dịch vụ</TableHead>
            <TableHead className="w-28">Thương hiệu</TableHead>
            <TableHead className="w-24">Loại</TableHead>
            <TableHead className="w-20 text-right">Giá S</TableHead>
            <TableHead className="w-20 text-right">Giá M</TableHead>
            <TableHead className="w-20 text-right">Giá L</TableHead>
            <TableHead className="w-24 text-right">Giá Sedan</TableHead>
            <TableHead className="w-20 text-right">Giá SUV</TableHead>
            <TableHead className="w-24">Bảo hành</TableHead>
            <TableHead className="w-20 text-center">Tặng kèm</TableHead>
            <TableHead className="w-28 text-center">Trạng thái</TableHead>
            <TableHead className="w-20 text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((svc) => (
            <TableRow
              key={svc.id}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => onEdit(svc)}
            >
              <TableCell className="font-medium">{svc.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{svc.brand || "—"}</TableCell>
              <TableCell className="text-sm">{svc.typeDetail || "—"}</TableCell>
              <TableCell className="text-right">
                <PriceCell value={svc.priceS} />
              </TableCell>
              <TableCell className="text-right">
                <PriceCell value={svc.priceM} />
              </TableCell>
              <TableCell className="text-right">
                <PriceCell value={svc.priceL} />
              </TableCell>
              <TableCell className="text-right">
                <PriceCell value={svc.priceSEDAN} />
              </TableCell>
              <TableCell className="text-right">
                <PriceCell value={svc.priceSUV} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{svc.warranty || "—"}</TableCell>
              <TableCell className="text-center">
                {svc.canBeBonus ? (
                  <Gift className="h-4 w-4 text-amber-500 mx-auto" />
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell
                className="text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center gap-2">
                  <Switch
                    checked={svc.active}
                    onCheckedChange={(v) => onToggleActive(svc, v)}
                  />
                  <Badge variant={svc.active ? "default" : "secondary"} className="text-xs">
                    {svc.active ? "Hoạt động" : "Tắt"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell
                className="text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(svc)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
