"use client";

import { Button } from "@/components/ui/button";
import { useInventoryManager } from "@/services/useInventoryManager";
import { useProductManager } from "@/services/useProductManager";
import { InventoryTransaction, InventoryDashboard } from "@/types/Inventory";
import { Product } from "@/types/Product";
import { useEffect, useState } from "react";
import { StockAdjustDialog } from "./components/StockAdjustDialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Package, AlertTriangle, XCircle, DollarSign, Plus } from "lucide-react";
import { Table } from "antd";

export default function InventoryPage() {
  const { getTransactions, adjust, getDashboard } = useInventoryManager();
  const { getActive: getProducts } = useProductManager();
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [openAdjust, setOpenAdjust] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const [txs, stats, prods] = await Promise.all([getTransactions(), getDashboard(), getProducts()]);
    setTransactions(txs);
    setDashboard(stats);
    setProducts(prods);
    setLoading(false);
  };

  const handleAdjust = async (data: { productCode: string; quantity: number; type: string; notes?: string }) => {
    setLoading(true);
    await adjust(data);
    await refreshData();
    setOpenAdjust(false);
    setLoading(false);
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    PURCHASE_RECEIVE: { label: "Nhập hàng", color: "bg-blue-100 text-blue-700" },
    SALE: { label: "Bán hàng", color: "bg-green-100 text-green-700" },
    STOCK_IN: { label: "Nhập kho", color: "bg-cyan-100 text-cyan-700" },
    STOCK_OUT: { label: "Xuất kho", color: "bg-orange-100 text-orange-700" },
    ADJUSTMENT: { label: "Điều chỉnh", color: "bg-purple-100 text-purple-700" },
    RETURN: { label: "Trả hàng", color: "bg-yellow-100 text-yellow-700" },
  };

  const columns = [
    { title: "Mã", dataIndex: "code", key: "code", width: 160 },
    { title: "Sản phẩm", dataIndex: "productName", key: "productName" },
    {
      title: "Loại",
      key: "type",
      render: (_: unknown, r: InventoryTransaction) => {
        const t = typeLabels[r.type] || { label: r.type, color: "bg-gray-100" };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${t.color}`}>{t.label}</span>;
      },
    },
    { title: "SL", dataIndex: "quantity", key: "quantity", width: 70 },
    { title: "Trước", dataIndex: "beforeQty", key: "beforeQty", width: 70 },
    { title: "Sau", dataIndex: "afterQty", key: "afterQty", width: 70 },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    {
      title: "Thời gian",
      key: "createdAt",
      width: 150,
      render: (_: unknown, r: InventoryTransaction) =>
        r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : "",
    },
  ];

  const cards = [
    { icon: Package, label: "Tổng sản phẩm", value: dashboard?.totalProducts ?? 0, color: "text-blue-600" },
    { icon: AlertTriangle, label: "Sắp hết hàng", value: dashboard?.lowStockCount ?? 0, color: "text-orange-500" },
    { icon: XCircle, label: "Hết hàng", value: dashboard?.outOfStockCount ?? 0, color: "text-red-600" },
    { icon: DollarSign, label: "Giá trị tồn kho", value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(dashboard?.totalInventoryValue ?? 0), color: "text-green-600" },
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
              <BreadcrumbLink href="/inventory">Kho hàng</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Kho hàng</h1>
          <Button onClick={() => setOpenAdjust(true)}>
            <Plus className="w-4 h-4 mr-2" /> Điều chỉnh tồn kho
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold">Lịch sử giao dịch</h2>
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="code"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
          scroll={{ x: 900 }}
        />
      </div>

      <StockAdjustDialog
        open={openAdjust}
        onOpenChange={setOpenAdjust}
        products={products}
        onSubmit={handleAdjust}
      />
    </SidebarInset>
  );
}
