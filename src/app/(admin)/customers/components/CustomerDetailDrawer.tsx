"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerService } from "@/services/useCustomerService";
import { OverviewTab } from "./CustomerDetailTabs/OverviewTab";
import { VehiclesTab } from "./CustomerDetailTabs/VehiclesTab";
import { InvoicesTab } from "./CustomerDetailTabs/InvoicesTab";
import { StatsTab } from "./CustomerDetailTabs/StatsTab";
import { NotesTab } from "./CustomerDetailTabs/NotesTab";
import type { CustomerDetail } from "@/types/Customer";

interface CustomerDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  onEdit: (customer: CustomerDetail) => void;
  onDelete: (customer: CustomerDetail) => void;
}

export function CustomerDetailDrawer({
  open,
  onOpenChange,
  customerId,
  onEdit,
  onDelete,
}: CustomerDetailDrawerProps) {
  const { getCustomerDetail } = useCustomerService();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customerId) return;
    let cancelled = false;
    setLoading(true);
    getCustomerDetail(customerId).then((detail) => {
      if (!cancelled) {
        setCustomer(detail);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chi tiết khách hàng</SheetTitle>
          <SheetDescription className="sr-only">
            Thông tin chi tiết, xe, hóa đơn và thống kê của khách hàng
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="space-y-4 px-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {!loading && customer && (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(customer)}>
                <Pencil className="size-3.5" /> Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(customer)}
              >
                <Trash2 className="size-3.5" /> Xóa
              </Button>
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="w-full">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="vehicles">Xe</TabsTrigger>
                <TabsTrigger value="invoices">Hóa đơn</TabsTrigger>
                <TabsTrigger value="stats">Thống kê</TabsTrigger>
                <TabsTrigger value="notes">Ghi chú</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab customer={customer} />
              </TabsContent>
              <TabsContent value="vehicles">
                <VehiclesTab customer={customer} onManageVehicles={() => onEdit(customer)} />
              </TabsContent>
              <TabsContent value="invoices">
                <InvoicesTab customerId={customer.id} />
              </TabsContent>
              <TabsContent value="stats">
                <StatsTab customer={customer} />
              </TabsContent>
              <TabsContent value="notes">
                <NotesTab customer={customer} onUpdated={setCustomer} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!loading && !customer && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 mr-2 animate-spin" /> Không tìm thấy khách hàng
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
