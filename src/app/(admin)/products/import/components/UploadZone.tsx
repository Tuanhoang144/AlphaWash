"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

type Props = {
  onFileUpload: (file: File) => void;
  loading: boolean;
};

export function UploadZone({ onFileUpload, loading }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = "";
    }
  }, [onFileUpload]);

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      } ${loading ? "opacity-50 pointer-events-none" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <>
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Đang xử lý file...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-medium">Kéo thả file Excel vào đây</p>
              <p className="text-sm text-muted-foreground mt-1">hoặc click để chọn file</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 px-3 py-2 rounded">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Chỉ hỗ trợ file .xlsx</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
