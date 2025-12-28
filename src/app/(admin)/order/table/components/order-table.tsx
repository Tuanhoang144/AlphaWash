import React, { useState, useEffect } from "react";
import { Table, Button, Tooltip, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Button as UIButton } from "@/components/ui/button";
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
  QrCode,
  Search,
} from "lucide-react";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Size } from "@/types/Size";
import { OrderResponseDTO } from "@/types/OrderResponse";
import { tool } from "../../../../../utils/tool";
import { useRouter } from "next/navigation";
import type { MenuProps } from "antd";

interface OrderTableProps {
  data: OrderResponseDTO[];
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
}

const OrderTable: React.FC<OrderTableProps> = ({
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
}) => {
  const [scrollY, setScrollY] = useState("55vh");

  useEffect(() => {
    const updateScrollHeight = () => {
      const { innerHeight } = window;

      // Simple responsive logic
      if (innerHeight >= 1200) {
        setScrollY("70vh");
      } else if (innerHeight >= 900) {
        setScrollY("65vh");
      } else if (innerHeight >= 700) {
        setScrollY("55vh");
      } else {
        setScrollY("50vh");
      }
    };

    updateScrollHeight();

    // Debounce resize
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

  const {
    getCarSizeInfo,
    getStatusVehicleColor,
    getStatusVehicleLabel,
    getStatusPaymentLabel,
    getStatusPaymentColor,
    formatDate,
    formatTime,
  } = tool();

  const router = useRouter();

  const getActionMenuItems = (record: OrderResponseDTO): MenuProps["items"] => {
    const isCombo = record.orderDetails?.[0]?.orderType === "COMBO";

    return [
      {
        key: "view",
        icon: <Eye className="h-4 w-4" />,
        label: "Xem chi tiết",
        onClick: () => router.push(`/order/${record.id}`),
      },
      ...(record.deleteFlag
        ? []
        : [
            {
              key: "edit",
              icon: <Edit className="h-4 w-4" />,
              label: "Chỉnh sửa",
              onClick: () => router.push(`/order/${record.id}/edit`),
            },  
            {
              key: "payment",
              icon: <QrCode className="h-4 w-4" />,
              label: "Thanh toán",
              onClick: () =>
                router.push(
                  isCombo
                    ? `/order/${record.id}/paymentCombo`
                    : `/order/${record.id}/payment`
                ),
            },
          ]),
    ];
  };

  const columns: ColumnsType<OrderResponseDTO> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
      width: 120,
      fixed: "left",
      render: (code: string) => (
        <div className="text-small font-medium ">{code}</div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      fixed: "left",
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1.5">
          {record.deleteFlag ? (
            <Tooltip title="Đơn hàng đã bị hủy">
              <UIBadge
                variant="outline"
                className="font-medium px-2 py-1 bg-red-50 text-red-700 border-red-200 text-xs cursor-help w-full justify-center"
              >
                Đã hủy
              </UIBadge>
            </Tooltip>
          ) : (
            <>
              <Tooltip
                title={`Trạng thái dịch vụ: ${getStatusVehicleLabel(
                  record.orderDetails[0]?.status || "PENDING"
                )}`}
              >
                <UIBadge
                  variant="outline"
                  className={`font-medium px-2 py-1 text-xs cursor-help w-full justify-center ${getStatusVehicleColor(
                    record.orderDetails[0]?.status || "PENDING"
                  )}`}
                >
                  {getStatusVehicleLabel(
                    record.orderDetails[0]?.status || "PENDING"
                  )}
                </UIBadge>
              </Tooltip>
              <Tooltip
                title={`Trạng thái thanh toán: ${getStatusPaymentLabel(
                  record.paymentStatus || "PENDING"
                )}`}
              >
                <UIBadge
                  variant="outline"
                  className={`font-medium px-2 py-1 text-xs cursor-help w-full justify-center ${getStatusPaymentColor(
                    record.paymentStatus || "PENDING"
                  )}`}
                >
                  {getStatusPaymentLabel(record.paymentStatus || "PENDING")}
                </UIBadge>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Biển số xe",
      key: "licensePlate",
      width: 140,
      render: (_, record) => {
        const licensePlate =
          record.orderDetails[0]?.vehicle.licensePlate || "Chưa có";
        const formattedPlate =
          licensePlate !== "Chưa có" && licensePlate.length >= 6
            ? licensePlate.replace(/^(\d{2}[A-Z])(\d+)$/, "$1-$2")
            : licensePlate;

        return (
          <div className="inline-block bg-white border-2 border-black rounded-sm px-3 py-1.5 font-mono font-black text-black text-center shadow-md min-w-[110px] tracking-wider text-sm">
            {formattedPlate}
          </div>
        );
      },
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 150,
      render: (_, record) => (
        <div className="space-y-2">
          <div className="font-semibold text-base">
            {record.customer.name || "Khách lẻ"}
          </div>
          {record.customer.phone && (
            <div className="flex items-center gap-2  text-gray-600">
              <Phone className="h-4 w-4" />
              <span className="font-mono">{record.customer.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Giá tiền",
      key: "totalPrice",
      width: 120,
      render: (_, record) => (
        <div className="text-right font-mono">
          <div className="font-bold text-base text-green-600">
            {record.totalPrice?.toLocaleString("vi-VN") || "0"}
          </div>
          <div className="text-xs text-gray-500">VNĐ</div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "time",
      width: 180,
      render: (_, record) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatDate(record.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <Tooltip
              title={
                record.checkOut
                  ? `Xe vào lúc ${formatTime(
                      record.checkIn
                    )} và ra lúc ${formatTime(record.checkOut)}`
                  : `Xe vào lúc ${formatTime(record.checkIn)}, chưa ra`
              }
            >
              <div className="text-sm font-medium cursor-help">
                <span className="text-green-600">
                  {formatTime(record.checkIn)}
                </span>
                {record.checkOut ? (
                  <>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-red-600">
                      {formatTime(record.checkOut)}
                    </span>
                  </>
                ) : (
                  <span className="ml-2 text-gray-400 text-xs">(Chưa ra)</span>
                )}
              </div>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin xe",
      key: "vehicle",
      width: 150,
      render: (_, record) => {
        const carSizeInfo = getCarSizeInfo(
          record?.orderDetails[0]?.vehicle.size as Size
        );
        const brandName =
          record.orderDetails[0]?.vehicle.brandName || "Chưa có";
        const modelName =
          record.orderDetails[0]?.vehicle.modelName || "Chưa có";
        const vehicleSize = record.orderDetails[0]?.vehicle.size || "Chưa có";

        return (
          <div className="space-y-1.5">
            <Tooltip title={`${brandName} - ${modelName}`}>
              <div className="font-medium text-sm cursor-help line-clamp-1">
                {brandName} - {modelName}
              </div>
            </Tooltip>
            <Tooltip title={`Size: ${carSizeInfo.label}`}>
              <UIBadge
                variant="outline"
                className={`text-xs font-medium px-2 py-1 cursor-help ${carSizeInfo.color}`}
              >
                Size - {vehicleSize}
              </UIBadge>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Dịch vụ",
      key: "service",
      width: 180,
      responsive: ["xl"],
      render: (_, record) => (
        <div className="space-y-2">
          <div className="font-medium max-w-[150px] line-clamp-2 cursor-help">
            {(record.orderDetails[0]?.service[0]?.serviceName || "Chưa có")
              .split("|")[0]
              .trim()}
          </div>
          {record.orderDetails[0]?.service.length > 1 && (
            <Tooltip
              title={
                <div>
                  <div className="font-medium mb-1">Các dịch vụ khác:</div>
                  {record.orderDetails[0]?.service
                    .slice(1)
                    .map((service, index) => (
                      <div key={index}>• {service.serviceName}</div>
                    ))}
                </div>
              }
            >
              <div className="text-blue-600 font-medium text-xs cursor-help">
                +{record.orderDetails[0]?.service.length - 1} dịch vụ khác
              </div>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Nhân viên",
      key: "employee",
      width: 150,
      responsive: ["xl"],
      render: (_, record) => (
        <div className="space-y-1.5">
          <div className="font-medium text-sm">
            {record.orderDetails[0]?.employees[0]?.name || "Chưa có"}
          </div>
          {record.orderDetails[0]?.employees.length > 1 && (
            <Tooltip
              title={
                <div>
                  <div className="font-medium mb-1">Nhân viên khác:</div>
                  {record.orderDetails[0]?.employees
                    .slice(1)
                    .map((employee, index) => (
                      <div key={index}>• {employee.name}</div>
                    ))}
                </div>
              }
            >
              <div className="text-blue-600 font-medium text-xs cursor-help">
                +{record.orderDetails[0]?.employees.length - 1} người khác
              </div>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreHorizontal className="h-4 w-4" />}
            size="small"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4 pt-5 px-4">
      {/*Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            scroll={{
              x: "max-content",
              y: scrollY,
              scrollToFirstRowOnChange: true,
            }}
            pagination={false}
            locale={{
              emptyText: (
                <div className="flex flex-col items-center gap-4 py-12">
                  <Search className="h-12 w-12 text-gray-400" />
                  <p className="text-lg text-gray-600">
                    Không tìm thấy kết quả nào
                  </p>
                </div>
              ),
            }}
            size="middle"
          />
        </div>

        {/* Mobile view cho responsive */}
        <div className="block md:hidden">
          <div
            className="space-y-4 p-4"
            style={{ maxHeight: scrollY, overflowY: "auto" }}
          >
            {data.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <Search className="h-12 w-12 text-gray-400" />
                <p className="text-lg text-gray-600">
                  Không tìm thấy kết quả nào
                </p>
              </div>
            ) : (
              data.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  {/* Mobile card layout */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono font-bold text-base">
                          {record.code}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(record.date)}
                        </div>
                      </div>
                      <Dropdown
                        menu={{ items: getActionMenuItems(record) }}
                        trigger={["click"]}
                      >
                        <Button
                          type="text"
                          icon={<MoreHorizontal className="h-4 w-4" />}
                          size="small"
                        />
                      </Dropdown>
                    </div>
                    {/* Thêm các thông tin khác cho mobile */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Custom Pagination - hiển thị khi có dữ liệu hoặc totalPages > 0 */}
      {(data.length > 0 || totalPages > 0) && (
        <div className="bg-white border rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2 py-4 px-6">
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
                Tổng: {data.length} kết quả
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <UIButton
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="hidden sm:flex h-9 px-3"
              >
                <ChevronsLeft className="h-4 w-4" />
              </UIButton>
              <UIButton
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Trước</span>
              </UIButton>

              <div className="flex space-x-1">
                {getPageNumbers().map((page) => (
                  <UIButton
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="h-9 w-9 p-0"
                  >
                    {page}
                  </UIButton>
                ))}
              </div>

              <UIButton
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-9 px-3"
              >
                <span className="hidden sm:inline mr-1">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </UIButton>
              <UIButton
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="hidden sm:flex h-9 px-3"
              >
                <ChevronsRight className="h-4 w-4" />
              </UIButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
