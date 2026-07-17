"use client";

import { useEffect, useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import { AlertTriangle, GitMerge, History, Loader2, RefreshCw } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVehicleService } from "@/services/useVehicleService";
import type { DuplicateVehicleGroup, MergeLog } from "@/types/Vehicle";
import MergeDuplicatesDialog from "./components/MergeDuplicatesDialog";

export default function DuplicateVehiclesPage() {
  const { getDuplicateVehicleGroups, getMergeLogs, loading } = useVehicleService();
  const [groups, setGroups] = useState<DuplicateVehicleGroup[]>([]);
  const [mergeGroup, setMergeGroup] = useState<DuplicateVehicleGroup | null>(null);
  const [logs, setLogs] = useState<MergeLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsLoaded, setLogsLoaded] = useState(false);

  const refresh = async () => {
    const data = await getDuplicateVehicleGroups();
    setGroups(data);
  };

  const refreshLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await getMergeLogs();
      setLogs(data);
      setLogsLoaded(true);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SidebarInset>
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/duplicate-vehicles">Xe Trùng Lặp</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              Quản Lý Xe Trùng Lặp
            </h1>
            <p className="text-sm text-muted-foreground">
              Danh sách các biển số xe xuất hiện nhiều hơn một bản ghi xe trong hệ thống.
            </p>
          </div>
        </div>

        <Tabs
          defaultValue="groups"
          onValueChange={(value) => {
            if (value === "history" && !logsLoaded) refreshLogs();
          }}
        >
          <TabsList>
            <TabsTrigger value="groups">
              <GitMerge className="h-4 w-4 mr-1" />
              Nhóm Xe Trùng Lặp
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" />
              Lịch Sử Gộp Xe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Làm mới
              </Button>
            </div>

            {loading && groups.length === 0 && (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Đang tải...
              </div>
            )}

            {!loading && groups.length === 0 && (
              <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                Không tìm thấy xe trùng lặp nào.
              </div>
            )}

            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.normalizedPlate} className="rounded-xl border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div>
                      <span className="font-semibold">{group.normalizedPlate}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {group.vehicles.length} bản ghi xe
                      </span>
                    </div>
                    <Button size="sm" onClick={() => setMergeGroup(group)}>
                      <GitMerge className="h-4 w-4 mr-1" />
                      Gộp
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Hãng xe / Dòng xe</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Số đơn hàng</TableHead>
                        <TableHead>Lần dùng dịch vụ cuối</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.vehicles.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.licensePlate}</TableCell>
                          <TableCell>
                            {v.brandName} {v.modelName}
                          </TableCell>
                          <TableCell>
                            {v.customer ? (
                              <>
                                {v.customer.name}{" "}
                                <span className="text-muted-foreground">({v.customer.phone})</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Chưa liên kết</span>
                            )}
                          </TableCell>
                          <TableCell>{v.ordersCount}</TableCell>
                          <TableCell>{v.lastServiceDate || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={refreshLogs} disabled={logsLoading}>
                {logsLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Làm mới
              </Button>
            </div>

            {logsLoading && logs.length === 0 && (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Đang tải...
              </div>
            )}

            {!logsLoading && logs.length === 0 && (
              <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                Chưa có lịch sử gộp xe nào.
              </div>
            )}

            {logs.length > 0 && (
              <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày gộp</TableHead>
                      <TableHead>Người thực hiện</TableHead>
                      <TableHead>Khách hàng chính</TableHead>
                      <TableHead>Biển số chính</TableHead>
                      <TableHead>Khách hàng trùng</TableHead>
                      <TableHead>Biển số trùng</TableHead>
                      <TableHead>Hóa đơn</TableHead>
                      <TableHead>Lịch hẹn</TableHead>
                      <TableHead>Lịch sử dịch vụ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.mergeDate}</TableCell>
                        <TableCell>{log.operatorUsername}</TableCell>
                        <TableCell>{log.primaryCustomerName || "—"}</TableCell>
                        <TableCell className="font-medium">
                          {log.primaryVehicleLicensePlate}
                        </TableCell>
                        <TableCell>{log.duplicateCustomerName || "—"}</TableCell>
                        <TableCell>{log.duplicateLicensePlate}</TableCell>
                        <TableCell>{log.invoicesMigrated}</TableCell>
                        <TableCell>{log.appointmentsMigrated}</TableCell>
                        <TableCell>{log.historyRecordsMigrated}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === "SUCCESS" ? "default" : "destructive"}>
                            {log.status === "SUCCESS" ? "Thành công" : "Đã hoàn tác"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MergeDuplicatesDialog
        open={!!mergeGroup}
        onOpenChange={(open) => !open && setMergeGroup(null)}
        group={mergeGroup}
        onMerged={() => {
          refresh();
          setMergeGroup(null);
        }}
      />
    </SidebarInset>
  );
}
