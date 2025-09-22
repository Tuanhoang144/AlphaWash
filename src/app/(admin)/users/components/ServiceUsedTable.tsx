"use client";

import { useState, useMemo, useEffect } from "react";
import { Table } from "antd";
import { Button } from "@/components/ui/button";
import { EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { ServiceUsedDTO } from "@/types/CarUser";

interface Vehicle {
  licensePlate: string;
  vehicleName: string;
  serviceUsage: number;
}

interface GroupedCustomerRow {
  id: string;
  customerName: string;
  phone: string;
  vehicles: Vehicle[];
  totalServiceUsage: number;
}

interface Props {
  data: ServiceUsedDTO[];
  startIndex?: number;
}

export function CustomerVehicleTable({ data, startIndex = 0 }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [screenSize, setScreenSize] = useState<
    "xs" | "sm" | "md" | "lg" | "xl"
  >("lg");
  const [scrollY, setScrollY] = useState("55vh");

  // sort state
  const [sortField, setSortField] = useState<string>();
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);

  const transformedData = useMemo(() => transformServiceData(data), [data]);

  // Sort toàn bộ dataset trước khi phân trang
  const sortedData = useMemo(() => {
    let result = [...transformedData];
    if (sortField && sortOrder) {
      result.sort((a, b) => {
        const valA = (a as any)[sortField];
        const valB = (b as any)[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "ascend" ? valA - valB : valB - valA;
        }
        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "ascend"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return 0;
      });
    }
    return result;
  }, [transformedData, sortField, sortOrder]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndexCalc = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndexCalc + itemsPerPage;
  const currentData = sortedData.slice(startIndexCalc, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    const updateScrollHeight = () => {
      const { innerHeight, innerWidth } = window;
      if (innerWidth >= 1280) setScreenSize("xl");
      else if (innerWidth >= 1024) setScreenSize("lg");
      else if (innerWidth >= 768) setScreenSize("md");
      else if (innerWidth >= 640) setScreenSize("sm");
      else setScreenSize("xs");

      if (innerHeight >= 1200) setScrollY("70vh");
      else if (innerHeight >= 900) setScrollY("65vh");
      else if (innerHeight >= 700) setScrollY("60vh");
      else setScrollY("45vh");
    };

    updateScrollHeight();
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScrollHeight, 200);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const columns: ColumnsType<GroupedCustomerRow> = useMemo(() => {
    const cols: ColumnsType<GroupedCustomerRow> = [
      {
        title: "STT",
        key: "stt",
        width: screenSize === "xs" ? 50 : 60,
        align: "center",
        fixed: screenSize === "xs" ? false : "left",
        render: (_, __, index) => startIndexCalc + index + 1,
      },
      {
        title: "Khách hàng",
        dataIndex: "customerName",
        key: "customerName",
        width: screenSize === "xs" ? 100 : 150,
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
    ];

    if (screenSize !== "xs") {
      cols.push({
        title: "SĐT",
        dataIndex: "phone",
        key: "phone",
        width: 130,
      });
    }

    cols.push({
      title: "Xe (biển số + tên xe)",
      key: "vehicles",
      width: screenSize === "xs" ? 250 : 350,
      render: (_, record: GroupedCustomerRow) => (
        <div className="divide-y divide-gray-200">
          {record.vehicles.map((v, idx) => (
            <div key={idx} className="py-2">
              <div className="font-mono text-blue-600 font-medium">
                {v.licensePlate}
              </div>
              <div className="text-sm text-gray-700">
                {v.vehicleName} ({v.serviceUsage} lần)
              </div>
            </div>
          ))}
        </div>
      ),
    });

    cols.push({
      title: "Lượt quay lại",
      dataIndex: "totalServiceUsage",
      key: "totalServiceUsage",
      width: screenSize === "xs" ? 100 : 120,
      align: "center",
      sorter: true, // để hiện icon sort
      sortOrder: sortField === "totalServiceUsage" ? sortOrder : null,
      onHeaderCell: () => ({
        onClick: () => {
          if (sortField !== "totalServiceUsage") {
            setSortField("totalServiceUsage");
            setSortOrder("ascend");
          } else {
            setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
          }
        },
      }),
      render: (count: number) => <span className="font-semibold">{count}</span>,
    });

    cols.push({
      title: "Thao tác",
      key: "action",
      width: screenSize === "xs" ? 80 : 120,
      align: "center",
      fixed: screenSize === "xs" ? false : "right",
      render: (_, record: GroupedCustomerRow) => (
        <div className="divide-y divide-gray-200">
          {record.vehicles.map((v, idx) => (
            <div key={idx} className="flex justify-center items-center py-2">
              <Button
                variant="ghost"
                size={screenSize === "xs" ? "sm" : "default"}
                onClick={() => console.log("Xem chi tiết:", v.licensePlate)}
              >
                <EditOutlined />
              </Button>
            </div>
          ))}
        </div>
      ),
    });

    return cols;
  }, [screenSize, startIndexCalc, sortField, sortOrder]);

  if (data.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Không có dữ liệu để hiển thị.
      </div>
    );
  }

  return (
    <div className="container">
      <Table
        columns={columns}
        dataSource={currentData}
        rowKey="id"
        scroll={{ x: screenSize === "xs" ? 800 : "max-content", y: scrollY }}
        sticky={{ offsetHeader: 64 }}
        pagination={false}
        size="small"
        className="w-full rounded-lg border bg-white shadow-sm mb-6"
        bordered
      />

      {(data.length > 0 || totalPages > 0) && (
        <div className="bg-white border rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hiển thị</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-[80px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">bản ghi</span>
              <span className="text-sm text-gray-500 ml-4">
                Tổng: {data.length} khách hàng
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Trước</span>
              </Button>

              <div className="flex space-x-1">
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline mr-1">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function transformServiceData(data: ServiceUsedDTO[]): GroupedCustomerRow[] {
  const customerMap = new Map<string, GroupedCustomerRow>();
  const result: GroupedCustomerRow[] = [];

  data.forEach((item) => {
    const serviceUsage = Number(item.serviceUsage) || 0;

    if (!item.customerId || item.customerName === "Chưa cập nhật") {
      result.push({
        id: `unknown-${item.licensePlate}`,
        customerName: "Chưa cập nhật",
        phone: "Chưa cập nhật",
        vehicles: [
          {
            licensePlate: item.licensePlate,
            vehicleName: item.vehicleName,
            serviceUsage,
          },
        ],
        totalServiceUsage: serviceUsage,
      });
      return;
    }

    const customerId = item.customerId;

    if (customerMap.has(customerId)) {
      const existing = customerMap.get(customerId)!;
      existing.vehicles.push({
        licensePlate: item.licensePlate,
        vehicleName: item.vehicleName,
        serviceUsage,
      });
      existing.totalServiceUsage += serviceUsage;
    } else {
      customerMap.set(customerId, {
        id: customerId,
        customerName: item.customerName,
        phone: item.phone,
        vehicles: [
          {
            licensePlate: item.licensePlate,
            vehicleName: item.vehicleName,
            serviceUsage,
          },
        ],
        totalServiceUsage: serviceUsage,
      });
    }
  });

  return [...Array.from(customerMap.values()), ...result];
}
