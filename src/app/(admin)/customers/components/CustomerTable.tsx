"use client";

import { vi } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Car,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerAvatar } from "./CustomerAvatar";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { CustomerTagBadge } from "./CustomerTagBadge";
import { SkeletonTable } from "./SkeletonTable";
import type {
  CustomerListItem,
  CustomerSortField,
  SortDirection,
} from "@/types/Customer";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function formatLastVisit(date: string | null): string {
  if (!date) return "Chưa ghé";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  } catch {
    return "—";
  }
}

interface SortHeaderProps {
  field: CustomerSortField;
  label: string;
  sortBy: CustomerSortField;
  sortDir: SortDirection;
  onSort: (field: CustomerSortField) => void;
  className?: string;
}

function SortHeader({ field, label, sortBy, sortDir, onSort, className }: SortHeaderProps) {
  const active = sortBy === field;
  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}

interface CustomerTableProps {
  customers: CustomerListItem[];
  loading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  sortBy: CustomerSortField;
  sortDir: SortDirection;
  onSort: (field: CustomerSortField) => void;
  onRowClick: (customer: CustomerListItem) => void;
  onEdit: (customer: CustomerListItem) => void;
  onDelete: (customer: CustomerListItem) => void;
}

export function CustomerTable({
  customers,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sortBy,
  sortDir,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  const allSelected = customers.length > 0 && customers.every((c) => selectedIds.has(c.id));

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="Chọn tất cả"
                disabled={customers.length === 0}
              />
            </TableHead>
            <TableHead className="w-10" />
            <SortHeader field="name" label="Tên khách hàng" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <TableHead>Điện thoại</TableHead>
            <TableHead>Xe</TableHead>
            <SortHeader field="totalVisits" label="Lượt ghé" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <SortHeader field="totalSpending" label="Tổng chi tiêu" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <SortHeader field="lastVisitDate" label="Ghé gần nhất" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <TableHead>Nhãn</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && customers.length === 0 && <SkeletonTable rows={8} columns={10} />}

          {!loading && customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="h-32 text-center text-sm text-muted-foreground">
                Không tìm thấy khách hàng nào
              </TableCell>
            </TableRow>
          )}

          {customers.map((c) => (
            <TableRow
              key={c.id}
              data-state={selectedIds.has(c.id) ? "selected" : undefined}
              className="cursor-pointer"
              onClick={() => onRowClick(c)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(c.id)}
                  onCheckedChange={() => onToggleSelect(c.id)}
                  aria-label={`Chọn ${c.name}`}
                />
              </TableCell>
              <TableCell>
                <CustomerAvatar name={c.name} avatarUrl={c.avatarUrl} />
              </TableCell>
              <TableCell className="font-medium text-foreground">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.phone}</TableCell>
              <TableCell>
                {c.vehicleCount === 0 ? (
                  <span className="text-xs text-muted-foreground">Chưa có xe</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">
                      <Car className="size-3" />
                      {c.vehicleCount}
                    </span>
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {c.vehicles.slice(0, 2).map((v) => (
                        <span
                          key={v.id}
                          className="rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {v.licensePlate}
                        </span>
                      ))}
                      {c.vehicles.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{c.vehicles.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>{c.totalVisits}</TableCell>
              <TableCell className="font-medium">{currency.format(c.totalSpending)}</TableCell>
              <TableCell className="text-muted-foreground">{formatLastVisit(c.lastVisitDate)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {c.tags.slice(0, 2).map((tag) => (
                    <CustomerTagBadge key={tag.code} tag={tag} />
                  ))}
                  {c.tags.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">+{c.tags.length - 2}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <CustomerStatusBadge status={c.status} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRowClick(c)}>
                      <Eye className="size-4" /> Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(c)}>
                      <Pencil className="size-4" /> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(c)}>
                      <Trash2 className="size-4" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
