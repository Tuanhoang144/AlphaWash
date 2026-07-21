"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  FileDown,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { addToast } from "@heroui/toast";

import { useQuoteService } from "@/services/useQuoteService";
import type { QuoteListItem, QuoteStatus } from "@/types/Quote";
import { QuoteStatusBadge } from "./components/QuoteStatusBadge";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Tất cả", value: "" },
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã gửi", value: "SENT" },
  { label: "Chấp nhận", value: "ACCEPTED" },
  { label: "Từ chối", value: "REJECTED" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function QuotesPage() {
  const router = useRouter();
  const { getQuotes, updateQuoteStatus, deleteQuote } = useQuoteService();

  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(
    async (p = page, s = size, q = search, st = statusFilter) => {
      setLoading(true);
      try {
        const data = await getQuotes({
          page: p,
          size: s,
          search: q || undefined,
          status: st || undefined,
        });
        setQuotes(data?.content ?? []);
        setTotalElements(data?.totalElements ?? 0);
        setTotalPages(data?.totalPages ?? 0);
      } catch {
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    },
    [getQuotes, page, size, search, statusFilter]
  );

  useEffect(() => {
    load(0, size, search, statusFilter);
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, size]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      load(0, size, search, statusFilter);
      setPage(0);
    }, 400);
    return () => clearTimeout(searchRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    load(page, size, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleChangeStatus = async (id: string, status: QuoteStatus) => {
    try {
      await updateQuoteStatus(id, status);
      addToast({ title: "Đã cập nhật trạng thái", color: "success" });
      load(page, size, search, statusFilter);
    } catch {
      addToast({ title: "Lỗi khi cập nhật trạng thái", color: "danger" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa báo giá này?")) return;
    try {
      await deleteQuote(id);
      addToast({ title: "Đã xóa báo giá", color: "success" });
      load(page, size, search, statusFilter);
    } catch {
      addToast({ title: "Lỗi khi xóa", color: "danger" });
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + "đ";

  return (
    <SidebarInset className="relative w-full">
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/quotes">Báo Giá</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Báo Giá</h1>
            <p className="text-muted-foreground text-sm">{totalElements} báo giá</p>
          </div>
          <Button onClick={() => router.push("/quotes/new")}>
            <Plus className="h-4 w-4 mr-1" />
            Tạo báo giá
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm theo tên, SĐT, biển số..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="flex-wrap h-auto">
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Mã BG</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Xe</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Tổng cộng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center w-16">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    Không có báo giá nào.
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((q) => (
                  <TableRow key={q.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm font-medium text-blue-600">
                      {q.quoteCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{q.customerName}</div>
                      {q.customerPhone && (
                        <div className="text-xs text-muted-foreground">{q.customerPhone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{q.licensePlate || "—"}</div>
                      {q.carModel && (
                        <div className="text-xs text-muted-foreground">{q.carModel}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(q.quoteDate)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatVND(q.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <QuoteStatusBadge status={q.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/quotes/${q.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/quotes/${q.id}`)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleChangeStatus(q.id, "SENT")}>
                            <Send className="h-4 w-4 mr-2" />
                            Đánh dấu Đã gửi
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeStatus(q.id, "ACCEPTED")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Chấp nhận
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeStatus(q.id, "REJECTED")}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Từ chối
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(q.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Hiển thị</span>
              <Select
                value={size.toString()}
                onValueChange={(v) => { setSize(Number(v)); setPage(0); }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>
                / {totalElements} bản ghi — Trang {page + 1}/{totalPages}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </SidebarInset>
  );
}
