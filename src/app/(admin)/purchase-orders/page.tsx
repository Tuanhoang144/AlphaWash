"use client";

import { Button } from "@/components/ui/button";
import { usePurchaseOrderManager } from "@/services/usePurchaseOrderManager";
import { useSupplierManager } from "@/services/useSupplierManager";
import { useProductManager } from "@/services/useProductManager";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { Supplier, Product } from "@/types/Product";
import { useEffect, useState } from "react";
import { CreatePODialog } from "./components/CreatePODialog";
import { ReceivePODialog } from "./components/ReceivePODialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, PackageCheck, XCircle } from "lucide-react";
import { Table } from "antd";

export default function PurchaseOrdersPage() {
  const { getAll, create, receive, cancel } = usePurchaseOrderManager();
  const { getActive: getSuppliers } = useSupplierManager();
  const { getActive: getProducts } = useProductManager();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const [pos, sups, prods] = await Promise.all([getAll(), getSuppliers(), getProducts()]);
    setOrders(pos);
    setSuppliers(sups);
    setProducts(prods);
    setLoading(false);
  };

  const handleCreate = async (data: Parameters<typeof create>[0]) => {
    setLoading(true);
    await create(data);
    await refreshData();
    setOpenCreate(false);
    setLoading(false);
  };

  const handleReceive = async (code: string, items: { productCode: string; receivedQuantity: number }[]) => {
    setLoading(true);
    await receive(code, items);
    await refreshData();
    setReceiving(null);
    setLoading(false);
  };

  const handleCancel = async (code: string) => {
    setLoading(true);
    await cancel(code);
    await refreshData();
    setLoading(false);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Nháp", color: "bg-gray-100 text-gray-600" },
    ORDERED: { label: "Đã đặt", color: "bg-blue-100 text-blue-700" },
    PARTIAL_RECEIVED: { label: "Nhận 1 phần", color: "bg-yellow-100 text-yellow-700" },
    RECEIVED: { label: "Đã nhận", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-600" },
  };

  const columns = [
    { title: "Mã PO", dataIndex: "code", key: "code", width: 170 },
    { title: "Nhà cung cấp", dataIndex: "supplierName", key: "supplierName" },
    {
      title: "Tổng tiền",
      key: "totalAmount",
      render: (_: unknown, r: PurchaseOrder) =>
        r.totalAmount != null
          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(r.totalAmount)
          : "—",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: unknown, r: PurchaseOrder) => {
        const s = statusLabels[r.status] || { label: r.status, color: "bg-gray-100" };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${s.color}`}>{s.label}</span>;
      },
    },
    {
      title: "Ngày tạo",
      key: "createdAt",
      render: (_: unknown, r: PurchaseOrder) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "",
    },
    {
      title: "",
      key: "actions",
      width: 140,
      render: (_: unknown, r: PurchaseOrder) => (
        <div className="flex gap-1">
          {r.status !== "RECEIVED" && r.status !== "CANCELLED" && (
            <Button size="sm" variant="outline" onClick={() => setReceiving(r)}>
              <PackageCheck className="w-3 h-3 mr-1" /> Nhận
            </Button>
          )}
          {r.status === "DRAFT" && (
            <Button size="icon" variant="ghost" onClick={() => handleCancel(r.code)}>
              <XCircle className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <SidebarInset>
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/purchase-orders">Nhập hàng</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Đơn nhập hàng</h1>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tạo đơn nhập
          </Button>
        </div>

        <Table
          dataSource={orders}
          columns={columns}
          rowKey="code"
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="small"
          scroll={{ x: 800 }}
        />
      </div>

      <CreatePODialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        suppliers={suppliers}
        products={products}
        onSubmit={handleCreate}
      />

      <ReceivePODialog
        order={receiving}
        onClose={() => setReceiving(null)}
        onSubmit={handleReceive}
      />
    </SidebarInset>
  );
}
