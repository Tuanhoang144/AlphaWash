"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Phone } from "lucide-react";
import { CustomerDTO } from "@/types/OrderResponse";

interface CustomerSearchTabProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isSearching: boolean;
  onSearch: () => void;
  searchResults: CustomerDTO[];
  totalSearchResults: number;
  onSelect: (customer: CustomerDTO) => void;
  onCreateNew: () => void;
  onContinueWithout: () => void;
}

export default function CustomerSearchTab({
  searchTerm,
  setSearchTerm,
  isSearching,
  onSearch,
  searchResults,
  totalSearchResults,
  onSelect,
  onCreateNew,
  onContinueWithout,
}: CustomerSearchTabProps) {
  const handleSearch = () => {
    const q = searchTerm.trim();
    if (!q || isSearching) return;
    onSearch();
  };

  return (
    <div className="space-y-4">
      {/* Ô tìm kiếm */}
      <div className="flex gap-2">
        <Input
          placeholder="Nhập biển số hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          aria-label="Từ khóa tìm khách hàng"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchTerm.trim()}
        >
          {isSearching ? "Đang tìm..." : "Tìm kiếm"}
        </Button>
      </div>

      {/* Kết quả */}
      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Kết quả ({searchResults.length}/{totalSearchResults})
            </h4>
          </div>
          {searchResults.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(c)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {c.vehicles?.length || 0} xe đăng ký
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(c);
                  }}
                >
                  Chọn
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Không tìm thấy thì tạo mới */}
      {searchTerm && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-8 space-y-3">
          <p className="text-gray-500">Không tìm thấy khách hàng</p>
          <Button onClick={onCreateNew} variant="outline">
            + Tạo khách hàng mới
          </Button>
        </div>
      )}

      {/* Gợi ý tiếp tục không có KH (luôn hiển thị ở cuối) */}
      <div className="border-t pt-4">
        <Button
          onClick={onContinueWithout}
          variant="outline"
          className="w-full bg-transparent"
        >
          Tiếp tục không có khách hàng
        </Button>
      </div>
    </div>
  );
}
