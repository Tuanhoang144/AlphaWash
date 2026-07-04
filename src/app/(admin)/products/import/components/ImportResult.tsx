"use client";

import { Button } from "@/components/ui/button";
import { ProductImportResult } from "@/types/ProductImport";
import { Table } from "antd";
import { CheckCircle, XCircle, SkipForward, RefreshCw, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  result: ProductImportResult;
  onReset: () => void;
  onDownloadErrors: () => void;
};

export function ImportResult({ result, onReset, onDownloadErrors }: Props) {
  const cards = [
    { icon: CheckCircle, label: "Đã nhập mới", value: result.importedRows, color: "text-green-600", bg: "bg-green-50 border-green-200" },
    { icon: RefreshCw, label: "Đã cập nhật", value: result.updatedRows, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    { icon: SkipForward, label: "Đã bỏ qua", value: result.skippedRows, color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
    { icon: XCircle, label: "Thất bại", value: result.failedRows, color: "text-red-600", bg: "bg-red-50 border-red-200" },
  ];

  const failedColumns = [
    { title: "Dòng", dataIndex: "rowNumber", key: "rowNumber", width: 60 },
    { title: "Tên sản phẩm", dataIndex: "productName", key: "productName" },
    {
      title: "Lỗi",
      key: "errors",
      render: (_: unknown, record: { errors: string[] }) => (
        <span className="text-xs text-red-500">{record.errors?.join("; ")}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-green-700">Nhập dữ liệu hoàn tất!</h2>
        <p className="text-sm text-green-600 mt-1">
          Đã xử lý {result.totalRows} dòng dữ liệu
        </p>
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`border rounded-lg p-4 text-center ${card.bg}`}>
            <card.icon className={`w-6 h-6 mx-auto mb-2 ${card.color}`} />
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Failed rows detail */}
      {result.failedDetails && result.failedDetails.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-red-600">Chi tiết dòng thất bại</h3>
            <Button variant="outline" size="sm" onClick={onDownloadErrors}>
              <Download className="w-3 h-3 mr-1" /> Tải báo cáo lỗi
            </Button>
          </div>
          <Table
            dataSource={result.failedDetails}
            columns={failedColumns}
            rowKey="rowNumber"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset}>
          Nhập file khác
        </Button>
        <Link href="/products">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" /> Về danh sách sản phẩm
          </Button>
        </Link>
      </div>
    </div>
  );
}
