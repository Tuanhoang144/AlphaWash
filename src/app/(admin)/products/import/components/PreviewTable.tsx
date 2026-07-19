"use client";

import { Button } from "@/components/ui/button";
import { ProductImportPreview, ImportMode } from "@/types/ProductImport";
import { Table } from "antd";
import { CheckCircle, XCircle, AlertTriangle, Download, Upload, RotateCcw } from "lucide-react";

type Props = {
  preview: ProductImportPreview;
  importMode: ImportMode;
  onImportModeChange: (mode: ImportMode) => void;
  onImport: () => void;
  onDownloadErrors: () => void;
  onReset: () => void;
  loading: boolean;
};

export function PreviewTable({ preview, importMode, onImportModeChange, onImport, onDownloadErrors, onReset, loading }: Props) {
  const columns = [
    {
      title: "Dòng",
      dataIndex: "rowNumber",
      key: "rowNumber",
      width: 60,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 140,
    },
    {
      title: "Giá bán",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 100,
      render: (val: string) => val ? new Intl.NumberFormat("vi-VN").format(Number(val)) : "",
    },
    {
      title: "Trạng thái",
      key: "valid",
      width: 100,
      render: (_: unknown, record: { valid: boolean }) => (
        <span className={`flex items-center gap-1 text-xs font-medium ${record.valid ? "text-green-600" : "text-red-600"}`}>
          {record.valid ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {record.valid ? "Hợp lệ" : "Lỗi"}
        </span>
      ),
    },
    {
      title: "Lỗi",
      key: "errors",
      render: (_: unknown, record: { errors: string[] }) =>
        record.errors?.length > 0 ? (
          <span className="text-xs text-red-500">{record.errors.join("; ")}</span>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{preview.totalRows}</p>
          <p className="text-sm text-muted-foreground">Tổng số dòng</p>
        </div>
        <div className="border rounded-lg p-4 text-center border-green-200 bg-green-50">
          <p className="text-2xl font-bold text-green-600">{preview.validRows}</p>
          <p className="text-sm text-green-600">Hợp lệ</p>
        </div>
        <div className={`border rounded-lg p-4 text-center ${preview.invalidRows > 0 ? "border-red-200 bg-red-50" : ""}`}>
          <p className={`text-2xl font-bold ${preview.invalidRows > 0 ? "text-red-600" : ""}`}>{preview.invalidRows}</p>
          <p className={`text-sm ${preview.invalidRows > 0 ? "text-red-600" : "text-muted-foreground"}`}>Lỗi</p>
        </div>
      </div>

      {/* Import options */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Tùy chọn nhập</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {([
            { value: "CREATE_ONLY", label: "Chỉ tạo mới", desc: "Bỏ qua sản phẩm đã tồn tại" },
            { value: "SKIP_DUPLICATES", label: "Bỏ qua trùng lặp", desc: "Không cập nhật sản phẩm cũ" },
            { value: "UPDATE_EXISTING", label: "Cập nhật nếu trùng", desc: "Ghi đè dữ liệu cũ" },
          ] as const).map((option) => (
            <label
              key={option.value}
              className={`flex-1 border rounded-lg p-3 cursor-pointer transition-colors ${
                importMode === option.value ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="radio"
                  name="importMode"
                  value={option.value}
                  checked={importMode === option.value}
                  onChange={() => onImportModeChange(option.value)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Warning if invalid rows */}
      {preview.invalidRows > 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-700">
            Có {preview.invalidRows} dòng lỗi sẽ bị bỏ qua khi nhập. Chỉ {preview.validRows} dòng hợp lệ sẽ được xử lý.
          </p>
        </div>
      )}

      {/* Preview table */}
      <Table
        dataSource={preview.rows}
        columns={columns}
        rowKey="rowNumber"
        pagination={{ pageSize: 20, showSizeChanger: true }}
        size="small"
        scroll={{ x: 800 }}
        rowClassName={(record) => (!record.valid ? "bg-red-50" : "")}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Chọn file khác
          </Button>
          {preview.invalidRows > 0 && (
            <Button variant="outline" onClick={onDownloadErrors}>
              <Download className="w-4 h-4 mr-2" /> Tải báo cáo lỗi
            </Button>
          )}
        </div>
        <Button
          onClick={onImport}
          disabled={preview.validRows === 0 || loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Nhập {preview.validRows} sản phẩm
        </Button>
      </div>
    </div>
  );
}
