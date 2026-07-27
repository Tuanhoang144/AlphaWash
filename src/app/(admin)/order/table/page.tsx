"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/dist/client/components/navigation";

import Header from "./components/header";
import { OrderResponseDTO } from "@/types/OrderResponse";
import { useOrderManager } from "@/services/useOrderManager";
import OrderTable from "./components/order-table";
import LoadingPage from "../../../loading";
import SearchTable from "./components/sreach";
import BulkPaymentBar from "./components/BulkPaymentBar";
import ConfirmBulkPaymentDialog from "./components/ConfirmBulkPaymentDialog";
import { useBulkPayment } from "@/shared/hooks/order/useBulkPayment";

export default function WashServiceTable() {
  const [data, setData] = useState<OrderResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0); // 0-based, for server
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { getPagedOrders, loading } = useOrderManager();
  const [selectedFilter, setSelectedFilter] = useState<
    "payment" | "time" | null
  >(null);
  const router = useRouter();

  const loadOrders = useCallback(
    async (p: number, size: number) => {
      try {
        const result = await getPagedOrders(p, size);
        // Support both PageResponse { content, totalPages, totalElements }
        // and plain array fallback (if BE doesn't support pagination yet)
        const content: OrderResponseDTO[] = Array.isArray(result)
          ? result
          : (result?.content ?? []);

        const transformed = content
          .filter((order) => !order.deleteFlag)
          .map((order) => ({
            ...order,
            customer: order.customer
              ? {
                  ...order.customer,
                  customerName: order.customer.name ?? "Khách lẻ",
                  phone: order.customer.phone ?? "",
                }
              : {
                  id: "",
                  name: "Khách lẻ",
                  phone: "",
                  customerName: "Khách lẻ",
                },
          }));

        setData(transformed);
        setTotalPages(result?.totalPages ?? 1);
        setTotalElements(result?.totalElements ?? transformed.length);
      } catch (error) {
        console.error("Lỗi khi gọi API get all order:", error);
      }
    },
    [getPagedOrders]
  );

  // Refresh (dùng sau bulk payment) — reload trang hiện tại
  const refreshData = useCallback(async () => {
    await loadOrders(page, pageSize);
  }, [loadOrders, page, pageSize]);

  // Bulk Payment
  const bulkPayment = useBulkPayment(data, refreshData);

  // Fetch khi page hoặc pageSize thay đổi
  useEffect(() => {
    loadOrders(page, pageSize);
  }, [page, pageSize]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Lọc theo ngày (bulk payment date filter)
    if (bulkPayment.dateFilter) {
      const getRange = () => {
        const now = new Date();
        switch (bulkPayment.dateFilter) {
          case "today": {
            const today = now.toISOString().split("T")[0];
            return { from: today, to: today };
          }
          case "week": {
            const dayOfWeek = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return {
              from: monday.toISOString().split("T")[0],
              to: sunday.toISOString().split("T")[0],
            };
          }
          case "month": {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return {
              from: firstDay.toISOString().split("T")[0],
              to: lastDay.toISOString().split("T")[0],
            };
          }
          case "custom":
            return bulkPayment.customRange.from && bulkPayment.customRange.to
              ? bulkPayment.customRange
              : null;
          default:
            return null;
        }
      };
      const range = getRange();
      if (range) {
        result = result.filter((order) => {
          const date = (order.date || "").split("T")[0];
          return date >= range.from && date <= range.to;
        });
      }
    }

    // Tìm kiếm nếu có
    if (searchTerm !== "") {
      const lowerSearch = searchTerm?.toLowerCase() ?? "";

      result = result?.filter(
        (record) =>
          (record.orderDetails?.[0]?.vehicle?.licensePlate ?? "")
            .toLowerCase()
            .includes(lowerSearch) ||
          (record.customer?.name ?? "").toLowerCase().includes(lowerSearch) ||
          (record.orderDetails?.[0]?.vehicle?.brandName ?? "")
            .toLowerCase()
            .includes(lowerSearch) ||
          (record.orderDetails?.[0]?.vehicle?.modelName ?? "")
            .toLowerCase()
            .includes(lowerSearch) ||
          (record.orderDetails?.[0]?.service ?? []).some((service) =>
            (service?.serviceName ?? "").toLowerCase().includes(lowerSearch)
          ) ||
          (record.customer?.name ?? "").toLowerCase().includes(lowerSearch)
      );
    }

    // Lọc/sắp theo bộ lọc đã chọn
    if (selectedFilter === "payment") {
      result.sort((a, b) => {
        const getPriority = (order: OrderResponseDTO) => {
          const status = order.orderDetails[0]?.status;
          const paymentStatus = order.paymentStatus ?? "";

          const isDone = status === "DONE";
          const isUnpaid = ["PENDING", "PROCESSING", "UNPAID"].includes(
            paymentStatus
          );

          if (isDone && isUnpaid) return 0;
          if (!isDone && isUnpaid) return 1;
          return 2;
        };

        const priorityA = getPriority(a);
        const priorityB = getPriority(b);

        if (priorityA !== priorityB) return priorityA - priorityB;

        // nếu cùng priority thì sắp theo thời gian gần nhất
        const timeA = new Date(a.checkIn).getTime();
        const timeB = new Date(b.checkIn).getTime();
        return timeB - timeA;
      });
    }

    if (selectedFilter === "time") {
      const getFullCheckInDate = (record: OrderResponseDTO): number => {
        if (!record.checkIn) return -Infinity;

        const orderDate = new Date(record.date);
        const [h, m, s] = record.checkIn.split(":").map(Number);
        const full = new Date(orderDate);
        full.setHours(h, m, s, 0);
        return full.getTime();
      };

      result.sort((a, b) => {
        const timeA = getFullCheckInDate(a);
        const timeB = getFullCheckInDate(b);
        return timeB - timeA;
      });
    }

    return result;
  }, [data, searchTerm, selectedFilter, bulkPayment.dateFilter, bulkPayment.customRange]);

  // Reset về trang đầu khi filter hoặc search thay đổi
  useEffect(() => {
    setPage(0);
  }, [selectedFilter]);

  // currentPage 1-based cho UI
  const currentPage = page + 1;

  // Pagination handlers (chuyển đổi giữa 1-based UI và 0-based server)
  const goToFirstPage = () => setPage(0);
  const goToLastPage = () => setPage(Math.max(0, totalPages - 1));
  const goToPreviousPage = () => setPage((p) => Math.max(0, p - 1));
  const goToNextPage = () =>
    setPage((p) => Math.min(totalPages - 1, p + 1));
  const goToPage = (p: number) => setPage(p - 1); // p là 1-based từ UI

  // Reset về trang đầu khi search thay đổi
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };

  // Thay đổi số bản ghi mỗi trang
  const handleItemsPerPageChange = (value: string) => {
    setPageSize(Number(value));
    setPage(0);
  };

  // Tạo danh sách số trang cho pagination UI (1-based)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // Handle navigation to create order page
  const handleNavigate = () => {
    setIsNavigating(true);
    router.push("/order/create");
  };
  const [isNavigating, setIsNavigating] = useState(false);

  if (loading || isNavigating) {
    return <LoadingPage />;
  }

  return (
    <div className="w-full absolute">
      <Header></Header>
      <div className="w-full ">
        <SearchTable
          handleNavigate={handleNavigate}
          isNavigating={isNavigating}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />

        {/* Bulk Payment Bar */}
        <BulkPaymentBar
          selectedCount={bulkPayment.selectedCount}
          selectedTotalPrice={bulkPayment.selectedTotalPrice}
          dateFilter={bulkPayment.dateFilter}
          customRange={bulkPayment.customRange}
          onDateFilterChange={bulkPayment.handleDateFilterChange}
          onCustomRangeChange={bulkPayment.handleCustomRangeChange}
          onMarkAsPaid={bulkPayment.openConfirm}
          onClearSelection={bulkPayment.clearSelection}
        />

        {/* Confirm Dialog */}
        <ConfirmBulkPaymentDialog
          isOpen={bulkPayment.isConfirmOpen}
          isProcessing={bulkPayment.isProcessing}
          selectedCount={bulkPayment.selectedCount}
          selectedTotalPrice={bulkPayment.selectedTotalPrice}
          onConfirm={bulkPayment.executeBulkPayment}
          onCancel={bulkPayment.closeConfirm}
        />

        <OrderTable
          data={filteredData}
          itemsPerPage={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          currentPage={currentPage}
          handleItemsPerPageChange={handleItemsPerPageChange}
          goToFirstPage={goToFirstPage}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          goToLastPage={goToLastPage}
          goToPage={goToPage}
          getPageNumbers={getPageNumbers}
          selectedIds={bulkPayment.selectedIds}
          onToggleSelect={bulkPayment.toggleSelect}
          onToggleSelectAll={bulkPayment.toggleSelectAll}
        />
      </div>
    </div>
  );
}
