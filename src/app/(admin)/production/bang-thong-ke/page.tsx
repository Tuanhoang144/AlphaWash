"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Car,
  Filter,
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Production } from "@/types/Production";
import { useProductionManager } from "@/services/production-manager";
import { useRouter } from "next/dist/client/components/navigation";
import WashServiceView from "../view/page";
import WashServiceForm from "../create/page";

// Type definition cho dữ liệu
interface WashRecord {
  id: number;
  stt: string;
  date: string;
  timeIn: string;
  timeOut: string;
  plateNumber: string;
  customerName: string;
  sdt: string;
  carCompany: string;
  vehicleLine: string;
  service: string;
  carSize: "S" | "M" | "L";
  status: string;
  statusPayment: string;
  voucher: string;
  employee: string[]; // Changed from string to string[]
}

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
      console.log("Fetched production data:", result);
      const mappedData: WashRecord[] = result.map((item, idx) => ({
        id: item.id,
        stt: (idx + 1).toString(),
        date: item.date ?? "",
        timeIn: item.timeIn ?? "",
        timeOut: item.timeOut ?? "",
        plateNumber: item.plateNumber ?? "",
        customerName: item.customerName ?? "",
        sdt: item.sdt ?? "",
        carCompany: item.carCompany ?? "",
        vehicleLine: item.vehicleLine ?? "",
        service: item.service ?? "",
        carSize: item.carSize as "S" | "M" | "L",
        status: item.status ?? "",
        statusPayment: item.statusPayment ?? "",
        voucher: item.voucher ?? "",
        employee: Array.isArray(item.employees)
          ? item.employees
          : item.employees
          ? [item.employees]
          : [],
      }));
      setData(mappedData);
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
      <header className="sticky z-10 top-0 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        {/* Left section - Navigation */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage className="flex items-center gap-2">
                  Theo dõi xe ra vào xưởng
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right section - Search and Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm biển số, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-[280px] lg:w-[320px] h-9"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Lọc</span>
            </Button>
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setCurrentView("create");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Thêm mới</span>
            </Button>
          </div>

          {/* Mobile Search Toggle */}
          <Button variant="ghost" size="sm" className="sm:hidden h-9 w-9 p-0">
            <Search className="h-4 w-4" />
            <span className="sr-only">Tìm kiếm</span>
          </Button>
        </div>
      </header>

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

      <div className="flex-1 space-y-4 p-4 md:p-3.5">
        {/* Main Table Card */}
        <Card>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[60px] font-semibold">
                      STT
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Ngày
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Thời gian
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Biển số</TableHead>
                    <TableHead className="font-semibold">Khách hàng</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">
                      Liên hệ
                    </TableHead>
                    <TableHead className="font-semibold">
                      Thông tin xe
                    </TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">
                      Dịch vụ
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nhân viên
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Không tìm thấy kết quả nào
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((record) => {
                      const carSizeInfo = getCarSizeInfo(record.carSize);
                      return (
                        <TableRow
                          key={record.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {record.stt}
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.date}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  Vào
                                </span>
                                <span className="font-medium">
                                  {record.timeIn}
                                </span>
                              </div>
                              {record.timeOut && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    Ra
                                  </span>
                                  <span className="font-medium">
                                    {record.timeOut}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono font-bold text-sm bg-muted px-3 py-1.5 rounded-md border">
                              {record.plateNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {record.customerName}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">{record.sdt}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div>
                                <div className="font-medium text-sm">
                                  {record.carCompany}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {record.vehicleLine}
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium ${carSizeInfo.color}`}
                                title={carSizeInfo.description}
                              >
                                {record.carSize} - {carSizeInfo.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-sm max-w-[120px]">
                              <span
                                className="line-clamp-2"
                                title={record.service}
                              >
                                {record.service}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="space-y-1">
                                {record.employee.length === 1 ? (
                                  <div className="font-medium text-sm">
                                    {record.employee[0]}
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                      {record.employee[0]}
                                    </div>
                                    {record.employee.length > 1 && (
                                      <div className="text-xs text-muted-foreground">
                                        +{record.employee.length - 1} người khác
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  Dịch vụ
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`font-medium transition-colors ${getStatusColor(
                                    record.status
                                  )}`}
                                  title="Trạng thái dịch vụ"
                                >
                                  {record.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  Thanh toán
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`font-medium transition-colors ${getStatusPaymentColor(
                                    record.statusPayment
                                  )}`}
                                  title="Trạng thái thanh toán"
                                >
                                  {record.statusPayment}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Mở menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-[160px]"
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setCurrentView("view");
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setCurrentView("edit");
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem> */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                {/* Items per page selector */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Hiển thị
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      bản ghi
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="hidden sm:flex bg-transparent"
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

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0"
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
                    className="hidden sm:flex bg-transparent"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
