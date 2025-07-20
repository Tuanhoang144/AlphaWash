"use client";

import { useState, useMemo, useEffect } from "react";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/dist/client/components/navigation";

import Header from "./components/header";
import { OrderDTO } from "@/types/OrderResponse";
import { useOrderManager } from "@/services/useOrderManager";
import OrderTable from "./components/order-table";
import LoadingPage from "../../loading";
import SearchTable from "./components/sreach";

export default function WashServiceTable() {
  const [data, setData] = useState<OrderDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { getAllOrders, loading } = useOrderManager();
  const [selectedFilter, setSelectedFilter] = useState<
    "payment" | "time" | null
  >(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const result: OrderDTO[] = await getAllOrders();

      const transformed = result.map((order) => ({
        ...order,
        customer: {
          ...order.customer,
          customerName: order.customer?.customerName ?? "Khách lẻ",
          phone: order.customer?.phone ?? "",
        },
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

    // Tìm kiếm nếu có
    if (searchTerm !== "") {
      result = result.filter(
        (record) =>
          record.orderDetails[0]?.vehicle.licensePlate
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.customer.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.orderDetails[0]?.vehicle.brandName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.orderDetails[0]?.vehicle.modelName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.orderDetails[0]?.service.serviceName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.orderDetails[0]?.employees.some((emp) =>
            emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Lọc/sắp theo bộ lọc đã chọn
    if (selectedFilter === "payment") {
      result.sort((a, b) => {
        console.log("Sorting by payment status");

        const getPriority = (order: OrderDTO) => {
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
      const getFullCheckInDate = (record: OrderDTO): number => {
        if (!record.checkIn) return -Infinity;

        const orderDate = new Date(record.orderDate);
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
    console.log("Filtered data:", result);

    return result;
  }, [data, searchTerm, selectedFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
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
    <SidebarInset>
      <Header></Header>

      <SearchTable
        handleNavigate={handleNavigate}
        isNavigating={isNavigating}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
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
      />
    </SidebarInset>
  );
}
