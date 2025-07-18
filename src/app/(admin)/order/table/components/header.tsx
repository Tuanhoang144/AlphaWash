import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Search, Filter, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import OrderForm from "../../create/page";

interface HeaderProps {
  searchTerm: string;
  handleSearch: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, handleSearch }) => {
  const router = useRouter();
  return (
    <header className="sticky z-10 top-0 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage className="flex items-center gap-2">
                Theo dõi xe ra vào xưởng
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm biển số, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 w-[280px] lg:w-[320px] h-9"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Lọc</span>
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9"
            onClick={() => router.push("/order/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Thêm mới</span>
          </Button>
        </div>

        {/* Mobile Search Toggle */}
        <Button variant="ghost" size="sm" className="sm:hidden h-9 w-9 p-0">
          <Search className="h-4 w-4" />
          <span className="sr-only">Tìm kiếm</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
