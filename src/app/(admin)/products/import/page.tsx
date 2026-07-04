"use client";

import { useState } from "react";
import { useProductImportManager } from "@/services/useProductImportManager";
import { ProductImportPreview, ProductImportResult, ImportMode } from "@/types/ProductImport";
import { UploadZone } from "./components/UploadZone";
import { PreviewTable } from "./components/PreviewTable";
import { ImportResult } from "./components/ImportResult";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type Step = "upload" | "preview" | "importing" | "result";

export default function ProductImportPage() {
  const { downloadTemplate, validateFile, importProducts, downloadErrorReport, loading } = useProductImportManager();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ProductImportPreview | null>(null);
  const [result, setResult] = useState<ProductImportResult | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("CREATE_ONLY");
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    const previewData = await validateFile(uploadedFile);
    if (previewData) {
      setPreview(previewData);
      setStep("preview");
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 15, 90));
    }, 500);

    const importResult = await importProducts(file, importMode);
    clearInterval(progressInterval);
    setProgress(100);

    if (importResult) {
      setResult(importResult);
      setTimeout(() => setStep("result"), 300);
    } else {
      setStep("preview");
    }
  };

  const handleDownloadErrors = async () => {
    if (file) await downloadErrorReport(file);
  };

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <SidebarInset>
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products/import">Nhập hàng loạt</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Nhập sản phẩm từ Excel</h1>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" /> Tải Template
          </Button>
        </div>

        {step === "upload" && (
          <UploadZone onFileUpload={handleFileUpload} loading={loading} />
        )}

        {step === "preview" && preview && (
          <PreviewTable
            preview={preview}
            importMode={importMode}
            onImportModeChange={setImportMode}
            onImport={handleImport}
            onDownloadErrors={handleDownloadErrors}
            onReset={handleReset}
            loading={loading}
          />
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-64 bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">Đang nhập dữ liệu... {progress}%</p>
            <p className="text-xs text-muted-foreground mt-1">Vui lòng không đóng trang này</p>
          </div>
        )}

        {step === "result" && result && (
          <ImportResult result={result} onReset={handleReset} onDownloadErrors={handleDownloadErrors} />
        )}
      </div>
    </SidebarInset>
  );
}
