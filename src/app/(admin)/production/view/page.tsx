"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Car,
  Calendar,
  Clock,
  User,
  Edit,
  ArrowLeft,
  Wrench,
  QrCode,
  RefreshCw,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  paymentStatus?: "Chờ thanh toán" | "Đã thanh toán" | "Đã xác nhận";
  employee: string[];
}

interface PaymentInfo {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferInfo: string;
}

interface WashServiceViewProps {
  record: WashRecord;
  onEdit?: () => void;
  onBack?: () => void;
}

export default function WashServiceView({
  record,
  onEdit,
  onBack,
}: WashServiceViewProps) {
  if (!record) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Không có dữ liệu phiếu rửa xe để hiển thị.
      </div>
    );
  }
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Đang xử lý":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Chờ xử lý":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Get car size info
  const getCarSizeInfo = (size: "S" | "M" | "L") => {
    switch (size) {
      case "S":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          label: "Nhỏ",
          description: "Xe máy, xe nhỏ",
        };
      case "M":
        return {
          color: "bg-orange-50 text-orange-700 border-orange-200",
          label: "Vừa",
          description: "Sedan, Hatchback",
        };
      case "L":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
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

  const carSizeInfo = getCarSizeInfo(record.carSize);

  // Get service price based on service type and car size
  const getServicePrice = (
    service: string,
    carSize: "S" | "M" | "L"
  ): number => {
    const serviceName = service.toLowerCase();

    if (serviceName.includes("quick") || serviceName.includes("nhanh")) {
      switch (carSize) {
        case "S":
          return 150000;
        case "M":
          return 150000;
        case "L":
          return 170000;
        default:
          return 150000;
      }
    } else if (
      serviceName.includes("standard") ||
      serviceName.includes("tiêu chuẩn")
    ) {
      switch (carSize) {
        case "S":
          return 250000;
        case "M":
          return 300000;
        case "L":
          return 350000;
        default:
          return 250000;
      }
    } else if (
      serviceName.includes("deep") ||
      serviceName.includes("chuyên sâu")
    ) {
      switch (carSize) {
        case "S":
          return 850000;
        case "M":
          return 950000;
        case "L":
          return 1050000;
        default:
          return 850000;
      }
    }

    // Default fallback
    return 150000;
  };

  // Generate QR payment URL
  const generateQRUrl = (paymentInfo: PaymentInfo): string => {
    const { amount, accountNumber, accountName, transferInfo, bankName } = paymentInfo;
    return `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(
      transferInfo
    )}&accountName=${encodeURIComponent(accountName)}`;
  };

  // Get payment status color
  const getPaymentStatusColor = (status: "Chờ thanh toán" | "Đã thanh toán" | "Đã xác nhận") => {
    switch (status) {
      case "Đã xác nhận":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Đã thanh toán":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Chờ thanh toán":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"Chờ thanh toán" | "Đã thanh toán" | "Đã xác nhận">(
    record.paymentStatus || "Chờ thanh toán"
  );

  const servicePrice = getServicePrice(record.service, record.carSize);
  // Define paymentConfig or use hardcoded values
  const paymentConfig = {
    accountNumber: process.env.NEXT_PUBLIC_ACCOUNTNUMBER || "0384605830",
    accountName: process.env.NEXT_PUBLIC_ACCOUNTNAME || "CONG TY RUA XE",
    bankName: process.env.NEXT_PUBLIC_NAMEBANK || "TPBANK"
  };

  const paymentInfo: PaymentInfo = {
    amount: servicePrice,
    bankName: paymentConfig.bankName,
    accountNumber: paymentConfig.accountNumber,
    accountName: paymentConfig.accountName,
    transferInfo: `Thanh toan phieu ${record.stt} - ${record.plateNumber}`
  };


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
                <BreadcrumbLink href="/production/bang-thong-ke">
                  Theo dõi xe ra vào xưởng
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbPage className="hidden md:block">
                <BreadcrumbLink href="#">Xem phiếu rửa xe</BreadcrumbLink>
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="max-w-4xl mx-auto w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-4">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Chi tiết phiếu rửa xe</h1>
              <p className="text-muted-foreground">Mã phiếu: {record.stt}</p>
            </div>
          </div>
          {onEdit && (
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tên khách hàng
                    </label>
                    <p className="text-lg font-semibold">
                      {record.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Số điện thoại
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-mono">{record.sdt}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Thông tin xe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Biển số xe
                    </label>
                    <div className="font-mono font-bold text-lg bg-muted ml-2 px-4 py-2 rounded-md border inline-block">
                      {record.plateNumber}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Kích thước xe
                    </label>
                    <div>
                      <Badge
                        variant="outline"
                        className={`text-sm font-medium ${carSizeInfo.color}`}
                      >
                        {record.carSize} - {carSizeInfo.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {carSizeInfo.description}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Hãng xe
                    </label>
                    <p className="text-lg font-semibold">{record.carCompany}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Dòng xe
                    </label>
                    <p className="text-lg font-semibold">
                      {record.vehicleLine}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service and Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Thông tin dịch vụ & nhân viên
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Information */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Dịch vụ đã chọn
                  </label>
                  <p className="text-lg font-semibold mb-4">{record.service}</p>
                </div>

                <Separator />

                {/* Employee Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5" />
                    <label className="text-sm font-medium text-muted-foreground">
                      Nhân viên phụ trách ({record.employee.length} người)
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {record.employee.map((employee, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{employee}</p>
                          <p className="text-sm text-muted-foreground">
                            Nhân viên rửa xe
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status and Timeline */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Giá dịch vụ
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {servicePrice.toLocaleString("vi-VN")}đ
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground sm:mr-2">
                    Trạng thái thanh toán
                  </label>
                  <Badge
                    variant="outline"
                    className={`text-sm font-medium mt-1 ${getPaymentStatusColor(
                      paymentStatus
                    )}`}
                  >
                    {paymentStatus}
                  </Badge>
                </div>

                <div className="space-y-2 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowQRDialog(true)}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Hiển thị QR thanh toán
                  </Button>
                </div> 

                {/* QR Code Dialog */}
                <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                  <DialogOverlay />
                  <DialogContent className="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto p-0">
                    <DialogTitle asChild>
                      <VisuallyHidden>Quét mã QR để thanh toán</VisuallyHidden>
                    </DialogTitle>
                    <div className="p-4 border rounded-lg bg-white">
                      <div className="text-center space-y-3">
                        <p className="text-sm font-medium">Quét mã QR để thanh toán</p>
                        <div className="flex justify-center">
                          <img
                            src={generateQRUrl(paymentInfo) || "/placeholder.svg"}
                            alt="QR Code thanh toán"
                            className="border rounded"
                            style={{ maxHeight: "400px" }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Số tiền:{" "}
                            <span className="font-semibold">
                              {servicePrice.toLocaleString("vi-VN")}đ
                            </span>
                          </p>
                          <p>Nội dung: {paymentInfo.transferInfo}</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Thời gian & trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Ngày thực hiện
                  </div>
                  <p className="font-semibold">{record.date}</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        Thời gian vào
                      </span>
                    </div>
                    <p className="font-semibold text-lg">{record.timeIn}</p>
                  </div>
                  {record.timeOut && (
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Thời gian ra
                        </span>
                      </div>
                      <p className="font-semibold text-lg">{record.timeOut}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex flex-col items-start gap-2">
                  <label className="text-sm text-muted-foreground">
                    Trạng thái xe
                  </label>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium px-4 py-2 ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
