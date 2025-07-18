"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";

import { Search } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/dist/client/components/navigation";

import Header from "./components/header";
import { OrderDTO } from "@/types/OrderResponse";
import { useOrderManager } from "@/services/useOrderManager";
import OrderTable from "./components/order-table";

export default function WashServiceTable() {
  const [data, setData] = useState<OrderDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { getAllOrders } = useOrderManager();
  const router = useRouter();

  // Đưa fetchData ra ngoài để có thể gọi lại
  const fetchData = async () => {
    try {
      const result: OrderDTO[] = await getAllOrders();
      setData(result);
    } catch (error) {
      console.error("Lỗi khi gọi API production:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getAllOrders]);

  const filteredData = useMemo(() => {
    if (searchTerm === "") {
      return data;
    }
    return data.filter(
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
          emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [data, searchTerm]);

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

  return (
    <SidebarInset>
      <Header searchTerm={searchTerm} handleSearch={handleSearch}></Header>

      {/* Mobile Search Bar - Show below header on mobile */}
      <div className="sm:hidden border-b bg-background px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm biển số, tên khách hàng, nhân viên..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

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
