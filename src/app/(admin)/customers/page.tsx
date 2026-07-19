"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addToast } from "@heroui/react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useCustomerService } from "@/services/useCustomerService";
import { CustomerToolbar } from "./components/CustomerToolbar";
import { CustomerFilters } from "./components/CustomerFilters";
import { CustomerTable } from "./components/CustomerTable";
import { BulkActionBar } from "./components/BulkActionBar";
import { AddCustomerDialog } from "./components/AddCustomerDialog";
import { EditCustomerDrawer } from "./components/EditCustomerDrawer";
import { CustomerDetailDrawer } from "./components/CustomerDetailDrawer";
import { ConfirmDialog } from "./components/ConfirmDialog";
import AutoLinkVehiclesDialog from "./components/AutoLinkVehiclesDialog";
import {
  DEFAULT_CUSTOMER_FILTERS,
  type CustomerDetail,
  type CustomerFilterValues,
  type CustomerListItem,
  type CustomerQuickSegment,
  type CustomerSortField,
} from "@/types/Customer";

const PAGE_SIZE = 15;

interface DeleteTarget {
  id: string;
  name: string;
}

export default function CustomersPage() {
  const { getCustomers, getCustomerDetail, deleteCustomer, exportCustomers } = useCustomerService();

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [quickSegment, setQuickSegment] = useState<CustomerQuickSegment | "ALL">("ALL");
  const [filters, setFilters] = useState<CustomerFilterValues>(DEFAULT_CUSTOMER_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<CustomerDetail | null>(null);
  const [detailCustomerId, setDetailCustomerId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [autoLinkOpen, setAutoLinkOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.minSpending != null) count++;
    if (filters.maxSpending != null) count++;
    if (filters.vehicleCount != null) count++;
    if (filters.lastVisitFrom) count++;
    if (filters.lastVisitTo) count++;
    return count;
  }, [filters]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers({
        page: page - 1,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        segment: quickSegment === "ALL" ? undefined : quickSegment,
        ...filters,
      });
      setCustomers(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages || 1);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, quickSegment, filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, quickSegment, filters]);

  const handleSort = (field: CustomerSortField) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === "desc" ? "asc" : "desc",
    }));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allSelected = customers.length > 0 && customers.every((c) => prev.has(c.id));
      if (allSelected) return new Set();
      return new Set(customers.map((c) => c.id));
    });
  };

  const handleRowClick = (customer: CustomerListItem) => {
    setDetailCustomerId(customer.id);
    setDetailOpen(true);
  };

  const handleEditFromList = async (customer: CustomerListItem) => {
    const detail = await getCustomerDetail(customer.id);
    if (detail) setEditCustomer(detail);
  };

  const openEditDrawer = (customer: CustomerDetail) => {
    setDetailOpen(false);
    setEditCustomer(customer);
  };

  const handleCreated = () => {
    fetchCustomers();
  };

  const handleUpdated = (customer: CustomerDetail) => {
    setEditCustomer(customer);
    fetchCustomers();
  };

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      addToast({ title: "Thành công", description: "Đã xóa khách hàng.", color: "success" });
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      await fetchCustomers();
    } catch (error: any) {
      addToast({ title: "Lỗi", description: error?.message || "Không thể xóa khách hàng.", color: "danger" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteFromDetail = (customer: CustomerDetail) => {
    setDetailOpen(false);
    setDeleteTarget({ id: customer.id, name: customer.name });
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteCustomer(id)));
      addToast({
        title: "Thành công",
        description: `Đã xóa ${selectedIds.size} khách hàng.`,
        color: "success",
      });
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      await fetchCustomers();
    } catch (error: any) {
      addToast({ title: "Lỗi", description: error?.message || "Không thể xóa khách hàng đã chọn.", color: "danger" });
    } finally {
      setDeleting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (ids?: string[]) => {
    setExporting(true);
    try {
      const blob = await exportCustomers({
        search: debouncedSearch || undefined,
        segment: quickSegment === "ALL" ? undefined : quickSegment,
        ...filters,
        ids,
      });
      downloadBlob(blob, `khach-hang-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      addToast({ title: "Lỗi", description: "Không thể xuất danh sách khách hàng.", color: "danger" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <SidebarInset>
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/customers">Quản Lý Khách Hàng</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <CustomerToolbar
          search={search}
          onSearchChange={setSearch}
          quickSegment={quickSegment}
          onQuickSegmentChange={setQuickSegment}
          activeFilterCount={activeFilterCount}
          onOpenFilters={() => setFiltersOpen(true)}
          onAddCustomer={() => setAddOpen(true)}
          onExport={() => handleExport()}
          onRefresh={fetchCustomers}
          onAutoLink={() => setAutoLinkOpen(true)}
          exporting={exporting}
          loading={loading}
        />

        <BulkActionBar
          selectedCount={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onDelete={() => setBulkDeleteOpen(true)}
          onExport={() => handleExport(Array.from(selectedIds))}
        />

        <CustomerTable
          customers={customers}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          sortBy={filters.sortBy ?? "lastVisitDate"}
          sortDir={filters.sortDir ?? "desc"}
          onSort={handleSort}
          onRowClick={handleRowClick}
          onEdit={handleEditFromList}
          onDelete={(customer) => setDeleteTarget({ id: customer.id, name: customer.name })}
        />

        {totalElements > 0 && (
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalElements)} trong{" "}
              {totalElements} khách hàng
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trước
              </Button>
              <span className="text-xs text-muted-foreground">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <CustomerFilters
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={filters}
        onApply={setFilters}
      />

      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} onCreated={handleCreated} />

      <CustomerDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        customerId={detailCustomerId}
        onEdit={openEditDrawer}
        onDelete={handleDeleteFromDetail}
      />

      <EditCustomerDrawer
        open={!!editCustomer}
        onOpenChange={(open) => !open && setEditCustomer(null)}
        customer={editCustomer}
        onUpdated={handleUpdated}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Xóa khách hàng"
        description={`Bạn có chắc muốn xóa khách hàng "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDeleteSingle}
      />

      <AutoLinkVehiclesDialog
        open={autoLinkOpen}
        onOpenChange={setAutoLinkOpen}
        onLinked={fetchCustomers}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Xóa nhiều khách hàng"
        description={`Bạn có chắc muốn xóa ${selectedIds.size} khách hàng đã chọn? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa tất cả"
        loading={deleting}
        onConfirm={handleBulkDelete}
      />
    </SidebarInset>
  );
}
