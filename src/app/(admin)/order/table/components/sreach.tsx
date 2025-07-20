import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search, Filter, Plus, Clock, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/app/(admin)/loading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchProps {
  isNavigating: boolean;
  handleNavigate: () => void;
  searchTerm: string;
  handleSearch: (value: string) => void;
  selectedFilter: "payment" | "time" | null;
  setSelectedFilter: (value: "payment" | "time" | null) => void;
}

const SearchTable: React.FC<SearchProps> = ({
  isNavigating,
  handleNavigate,
  searchTerm,
  handleSearch,
  selectedFilter,
  setSelectedFilter,
}) => {

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-2 px-4">
      {/* Search Box */}
      <div className="relative flex-1 min-w-[220px] sm:max-w-sm lg:max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Tìm kiếm biển số, tên khách hàng..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-9 w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-transparent px-3"
            >
              <Filter className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">
                {selectedFilter === "payment"
                  ? "Lọc: Thanh toán"
                  : selectedFilter === "time"
                  ? "Lọc: Thời gian"
                  : "Lọc"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                console.log("Lọc theo thời gian");
                setSelectedFilter("time");
              }}
            >
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              Lọc theo thời gian
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log("Lọc theo thanh toán");
                setSelectedFilter("payment");
              }}
            >
              <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
              Lọc theo thanh toán
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          size="sm"
          className="h-9 px-3"
          onClick={handleNavigate}
          disabled={isNavigating}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Thêm mới</span>
        </Button>
      </div>
    </div>
  );
};

export default SearchTable;
