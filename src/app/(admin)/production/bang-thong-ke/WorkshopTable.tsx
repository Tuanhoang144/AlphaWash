import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Phone,
  Search,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface RecordType {
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
  employee: string[];
}

type CarSizeType = "S" | "M" | "L";

interface WorkshopTableProps {
  data: RecordType[];
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  handleItemsPerPageChange: (value: string) => void;
  goToFirstPage: () => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToLastPage: () => void;
  goToPage: (page: number) => void;
  getPageNumbers: () => number[];
  getCarSizeInfo: (size:  CarSizeType) => {
    label: string;
    color: string;
    description: string;
  };
  getStatusColor: (status: string) => string;
  getStatusPaymentColor: (status: string) => string;
  setSelectedRecord: (record: RecordType) => void;
  setCurrentView: (view: "list" | "view" | "edit" | "create") => void;
}

const WorkshopTable: React.FC<WorkshopTableProps> = ({
  data,
  itemsPerPage,
  totalPages,
  currentPage,
  handleItemsPerPageChange,
  goToFirstPage,
  goToPreviousPage,
  goToNextPage,
  goToLastPage,
  goToPage,
  getPageNumbers,
  getCarSizeInfo,
  getStatusColor,
  getStatusPaymentColor,
  setSelectedRecord,
  setCurrentView,
}) => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-3.5">
      <Card>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {[
                    "STT",
                    "Ngày",
                    "Thời gian",
                    "Biển số",
                    "Khách hàng",
                    "Liên hệ",
                    "Thông tin xe",
                    "Dịch vụ",
                    "Nhân viên",
                    "Trạng thái",
                    "",
                  ].map((header, index) => (
                    <TableHead
                      key={index}
                      className={`font-semibold ${
                        header === "STT" ? "w-[60px]" : ""
                      } ${header === "Liên hệ" ? "hidden md:table-cell" : ""} ${
                        header === "Dịch vụ" ? "hidden lg:table-cell" : ""
                      }`}
                    >
                      {header === "Ngày" ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> {header}
                        </div>
                      ) : header === "Thời gian" ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" /> {header}
                        </div>
                      ) : header === "Nhân viên" ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" /> {header}
                        </div>
                      ) : (
                        header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
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
                  data.map((record) => {
                    const carSizeInfo = getCarSizeInfo(record?.carSize as CarSizeType);
                    return (
                      <TableRow
                        key={record.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{record.stt}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                Vào
                              </span>
                              <span className="font-medium">{record.timeIn}</span>
                            </div>
                            {record.timeOut && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  Ra
                                </span>
                                <span className="font-medium">{record.timeOut}</span>
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
                          <div className="font-medium">{record.customerName}</div>
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
                          <div className="text-sm max-w-[120px] line-clamp-2" title={record.service}>
                            {record.service}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
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
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                Dịch vụ
                              </span>
                              <Badge
                                variant="outline"
                                className={`font-medium ${getStatusColor(record.status)}`}
                              >
                                {record.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                Thanh toán
                              </span>
                              <Badge
                                variant="outline"
                                className={`font-medium ${getStatusPaymentColor(
                                  record.statusPayment
                                )}`}
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
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hiển thị</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 25, 50, 100].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">bản ghi</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="hidden sm:flex"
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
                  className="hidden sm:flex"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkshopTable;
