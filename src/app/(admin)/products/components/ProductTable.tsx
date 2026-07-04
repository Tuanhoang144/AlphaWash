"use client";

import { Button } from "@/components/ui/button";
import { Product } from "@/types/Product";
import { Table } from "antd";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (code: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function ProductTable({ products, loading, onEdit, onDelete, page, totalPages, onPageChange }: Props) {
  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Danh mục",
      key: "category",
      render: (_: unknown, record: Product) => (
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: record.categoryColor ? `${record.categoryColor}20` : "#f3f4f6", color: record.categoryColor || "#6b7280" }}
        >
          {record.categoryName || "—"}
        </span>
      ),
    },
    {
      title: "Giá bán",
      key: "sellingPrice",
      render: (_: unknown, record: Product) =>
        record.sellingPrice != null
          ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.sellingPrice)
          : "—",
    },
    {
      title: "Tồn kho",
      key: "stock",
      render: (_: unknown, record: Product) => {
        if (record.trackInventory === false) return <span className="text-gray-400">N/A</span>;
        const isLow = (record.currentStock ?? 0) <= (record.minStock ?? 0);
        const isOut = (record.currentStock ?? 0) === 0;
        return (
          <span className={isOut ? "text-red-600 font-bold" : isLow ? "text-orange-500 font-medium" : ""}>
            {record.currentStock ?? 0}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "isActive",
      render: (_: unknown, record: Product) => (
        <span className={`px-2 py-1 rounded text-xs ${record.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {record.isActive ? "Hoạt động" : "Ngừng"}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_: unknown, record: Product) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => onEdit(record)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(record.code)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        dataSource={products}
        columns={columns}
        rowKey="code"
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
      />
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Trước
          </Button>
          <span className="flex items-center text-sm">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
