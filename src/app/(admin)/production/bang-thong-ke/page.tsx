"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";

import {
  Search,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Production } from "@/types/Production";
import { useProductionManager } from "@/services/production-manager";
import { useRouter } from "next/dist/client/components/navigation";
import WashServiceView from "../view/page";
import WashServiceForm from "../create/page";
import { mappedData, WashRecord } from "./utils";

import WorkshopTable from "./WorkshopTable";
import Header from "./header";

export default function WashServiceTable() {
  const [data, setData] = useState<WashRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { getAllProduction } = useProductionManager();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<
    "list" | "view" | "edit" | "create"
  >("list");
  const [selectedRecord, setSelectedRecord] = useState<WashRecord>();

  // Đưa fetchData ra ngoài để có thể gọi lại
    const fetchData = async () => {
      try {
        const result: Production[] = await getAllProduction();
        const data = mappedData(result);
        setData(data);  
      } catch (error) {
        console.error("Lỗi khi gọi API production:", error);
      }
    };

  useEffect(() => {
    fetchData();
  }, [getAllProduction]);

  // Filter data based on search terms
  const filteredData = useMemo(() => {
    if (searchTerm === "") {
      return data;
    }
    return data.filter(
      (record) =>
        record.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.carCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee.some((emp) =>
          emp.toLowerCase().includes(searchTerm.toLowerCase())
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
    console.log(term)
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "Đang xử lý":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "Chờ xử lý":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const getStatusPaymentColor = (status: string) => {
    switch (status) {
      case "Đã xác nhận":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Đã thanh toán":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Chờ thanh toán":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Get car size color and label
  const getCarSizeInfo = (size: "S" | "M" | "L") => {
    switch (size) {
      case "S":
        return {
          color:
            "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
          label: "Nhỏ",
          description: "Xe máy, xe nhỏ",
        };
      case "M":
        return {
          color:
            "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
          label: "Vừa",
          description: "Sedan, Hatchback",
        };
      case "L":
        return {
          color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
          label: "Lớn",
          description: "SUV, Pickup",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          label: size,
          description: "",
        };
    }
  };

  if (currentView === "view" && selectedRecord) {
    return (
      <WashServiceView
        record={selectedRecord}
        onEdit={() => setCurrentView("edit")}
        onBack={() => setCurrentView("list")}
      />
    );
  }

  if (currentView === "create") {
    return (
      <WashServiceForm
        mode="create"
        onSave={() => {
          setCurrentView("list");
          fetchData();
        }}
        onCancel={() => setCurrentView("list")}
      />
    );
  }

  if (currentView === "edit" && selectedRecord) {
    const productionRecord: Production = {
      ...selectedRecord,
      employees: selectedRecord.employee,
    };
    return (
      <WashServiceForm
        mode="edit"
        record={productionRecord}
        onSave={() => {
          setCurrentView("list");
          fetchData();
        }}
        onCancel={() => setCurrentView("list")}
      />
    );
  }

  return (
    <SidebarInset>
      <Header
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        setCurrentView={setCurrentView}
      ></Header>

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

      <WorkshopTable
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
        getCarSizeInfo={getCarSizeInfo}
        getStatusColor={getStatusColor}
        getStatusPaymentColor={getStatusPaymentColor}
        setSelectedRecord={setSelectedRecord}
        setCurrentView={setCurrentView}
      />
    </SidebarInset>
  );
}
