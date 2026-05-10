"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Phone, UserPlus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CustomerDTO } from "@/types/OrderResponse";

import { useCustomerSearch } from "@/shared/hooks/order/useCustomerSearch";
import CustomerSearchTab from "./ui/CustomerSearchTab";
import CustomerCreateTab from "./ui/CustomerCreateTab";

interface CustomerSearchDialogProps {
  onCustomerSelect: (customer: CustomerDTO | null) => void;
  selectedCustomer?: CustomerDTO | null;
}

export default function CustomerSearchDialog({
  onCustomerSelect,
  selectedCustomer,
}: CustomerSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "create">("search");

  // dùng onClose để tự đóng dialog sau khi chọn/tạo
  const {
    searchTerm, // từ khóa tìm kiếm
    searchResults, // kết quả tìm kiếm
    totalSearchResults, // tổng số kết quả tìm kiếm
    isSearching, // trạng thái đang tìm kiếm
    isCreating, // trạng thái đang tạo mới
    newCustomer, // thông tin khách hàng mới đang tạo
    phoneError, // lỗi số điện thoại khi tạo mới
    setSearchTerm, // hàm set từ khóa tìm kiếm
    search, // hàm thực hiện tìm kiếm
    setNewCustomer, // hàm set thông tin khách hàng mới
    setPhoneError, // hàm set lỗi số điện thoại
    create, // hàm thực hiện tạo mới khách hàng
    select, // hàm chọn khách hàng từ kết quả tìm kiếm hoặc tạo mới
  } = useCustomerSearch(onCustomerSelect, () => setOpen(false));

  return (
    <div className="space-y-2">
      <Label>Khách hàng</Label>

      {selectedCustomer ? (
        <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedCustomer.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Phone className="h-3 w-3" />
                <span>{selectedCustomer.phone}</span>
              </div>
              <div className="text-xs text-blue-600">
                {selectedCustomer.vehicles?.length || 0} xe đã đăng ký
              </div>
            </div>

            <div className="flex gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Đổi
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" /> Quản Lý Khách Hàng
                    </DialogTitle>
                    <DialogDescription>
                      Tìm kiếm khách hàng có sẵn hoặc tạo mới
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="search"
                        className="flex items-center gap-2"
                      >
                        <Search className="h-4 w-4" /> Tìm kiếm
                      </TabsTrigger>
                      <TabsTrigger
                        value="create"
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" /> Tạo mới
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search">
                      <CustomerSearchTab
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        isSearching={isSearching}
                        onSearch={search}
                        searchResults={searchResults}
                        totalSearchResults={totalSearchResults}
                        onSelect={(c) => select(c)}
                        onCreateNew={() => setActiveTab("create")}
                        onContinueWithout={() => select(null)}
                      />
                    </TabsContent>

                    <TabsContent value="create">
                      <CustomerCreateTab
                        newCustomer={newCustomer}
                        setNewCustomer={(field, value) =>
                          setNewCustomer({ ...newCustomer, [field]: value })
                        }
                        phoneError={phoneError}
                        setPhoneError={setPhoneError}
                        isCreating={isCreating}
                        onCreate={create}
                        onContinueWithout={() => select(null)}
                      />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCustomerSelect(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center space-y-3">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-gray-500">Chưa chọn khách hàng</p>
          <p className="text-sm text-gray-400">
            Có thể tạo hóa đơn không cần thông tin khách hàng
          </p>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" /> Tìm kiếm khách hàng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" /> Quản Lý Khách Hàng
                </DialogTitle>
                <DialogDescription>
                  Tìm kiếm khách hàng có sẵn hoặc tạo mới
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="search"
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" /> Tìm kiếm
                  </TabsTrigger>
                  <TabsTrigger
                    value="create"
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" /> Tạo mới
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search">
                  <CustomerSearchTab
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    isSearching={isSearching}
                    onSearch={search}
                    searchResults={searchResults}
                    totalSearchResults={totalSearchResults}
                    onSelect={(c) => select(c)}
                    onCreateNew={() => setActiveTab("create")}
                    onContinueWithout={() => select(null)}
                  />
                </TabsContent>

                <TabsContent value="create">
                  <CustomerCreateTab
                    newCustomer={newCustomer}
                    setNewCustomer={(field, value) =>
                      setNewCustomer({ ...newCustomer, [field]: value })
                    }
                    phoneError={phoneError}
                    setPhoneError={setPhoneError}
                    isCreating={isCreating}
                    onCreate={create}
                    onContinueWithout={() => select(null)}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
