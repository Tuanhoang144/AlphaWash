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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const { getAllOrders, loading } = useOrderManager();
  const [selectedFilter, setSelectedFilter] = useState<
    "payment" | "time" | null
  >(null);
  const router = useRouter();

  const refreshData = useCallback(async () => {
    try {
      const result: OrderResponseDTO[] = await getAllOrders();
      const transformed = result
        .filter((order) => !order.deleteFlag)
        .map((order) => ({
          ...order,
          customer: order.customer
            ? {
                ...order.customer,
                customerName: order.customer.name ?? "Khách lẻ",
                phone: order.customer.phone ?? "",
              }
            : { id: "", name: "Khách lẻ", phone: "", customerName: "Khách lẻ" },
        }));
      setData(transformed);
    } catch (error) {
      console.error("Lỗi khi gọi API get all order:", error);
    }
  }, [getAllOrders]);

  // Bulk Payment
  const bulkPayment = useBulkPayment(data, refreshData);

  const fetchData = async () => {
    try {
      const result: OrderResponseDTO[] = await getAllOrders();

      const transformed = result
        .filter((order) => !order.deleteFlag) //hide những order bị hủy (deleteFlag = true)
        .map((order) => ({
          ...order,
          customer: order.customer
            ? {
                ...order.customer,
                customerName: order.customer.name ?? "Khách lẻ",
                phone: order.customer.phone ?? "",
              }
            : { id: "", name: "Khách lẻ", phone: "", customerName: "Khách lẻ" },
        }));

      setData(transformed);
    } catch (error) {
      console.error("Lỗi khi gọi API get all order:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getAllOrders]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const safeItemsPerPage = itemsPerPage ?? 5;
  const totalPages = Math.ceil(totalItems / safeItemsPerPage);
  const startIndex = (currentPage - 1) * safeItemsPerPage;
  const endIndex = startIndex + safeItemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  const handleSearch = (term: string) => {
    console.log(term);
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  // Generate page numbers for pagination
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
          data={currentData}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
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
