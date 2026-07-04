"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupplierManager } from "@/services/useSupplierManager";
import { Supplier } from "@/types/Product";
import { useEffect, useMemo, useState } from "react";
import { SupplierDialog } from "./components/SupplierDialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Table } from "antd";

export default function SuppliersPage() {
  const { getAll, create, update, remove } = useSupplierManager();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    setSuppliers(await getAll());
    setLoading(false);
  };

  const handleSubmit = async (data: Partial<Supplier>) => {
    setLoading(true);
    if (editing) {
      await update(editing.code, data);
    } else {
      await create(data);
    }
    await refreshData();
    setOpenDialog(false);
    setEditing(null);
    setLoading(false);
  };

  const handleDelete = async (code: string) => {
    setLoading(true);
    await remove(code);
    await refreshData();
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return suppliers.filter((s) =>
      s.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search)
    );
  }, [suppliers, search]);

  const columns = [
    { title: "Mã", dataIndex: "code", key: "code", width: 100 },
    { title: "Tên nhà cung cấp", dataIndex: "supplierName", key: "supplierName" },
    { title: "Điện thoại", dataIndex: "phone", key: "phone", width: 130 },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 100,
      render: (_: unknown, r: Supplier) => (
        <span className={`px-2 py-1 rounded text-xs ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {r.isActive ? "Hoạt động" : "Ngừng"}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_: unknown, r: Supplier) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpenDialog(true); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(r.code)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
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
              <BreadcrumbLink href="/suppliers">Nhà cung cấp</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Nhà cung cấp</h1>
          <Button onClick={() => { setEditing(null); setOpenDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm NCC
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm tên, mã, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Table dataSource={filtered} columns={columns} rowKey="code" loading={loading} pagination={{ pageSize: 15 }} size="small" scroll={{ x: 700 }} />
      </div>

      <SupplierDialog open={openDialog} onOpenChange={setOpenDialog} editing={editing} onSubmit={handleSubmit} />
    </SidebarInset>
  );
}
