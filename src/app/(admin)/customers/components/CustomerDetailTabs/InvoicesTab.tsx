"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerService } from "@/services/useCustomerService";
import type { CustomerInvoiceRow } from "@/types/Customer";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function InvoicesTab({ customerId }: { customerId: string }) {
  const { getCustomerInvoices } = useCustomerService();
  const [rows, setRows] = useState<CustomerInvoiceRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCustomerInvoices(customerId, page, 8).then((res) => {
      if (cancelled) return;
      setRows(res.content);
      setTotalPages(res.totalPages || 1);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, page]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã HĐ</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Biển số</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.code}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(row.date).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell>{row.licensePlate || "—"}</TableCell>
              <TableCell className="font-medium">{currency.format(row.totalPrice)}</TableCell>
              <TableCell>
                <Badge variant="outline">{row.paymentStatus}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                Chưa có hóa đơn nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
