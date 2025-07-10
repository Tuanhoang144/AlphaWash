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
  employee: string[]; 
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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                    <div className="font-mono font-bold text-lg bg-muted px-4 py-2 rounded-md border inline-block">
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
                <CardTitle>Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="outline"
                  className={`text-lg font-medium px-4 py-2 ${getStatusColor(
                    record.status
                  )}`}
                >
                  {record.status}
                </Badge>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Thời gian
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
