"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Phone, MapPin, UserPlus, X, Save } from "lucide-react";
import type { Customer } from "../types/invoice";
import { useCustomerManager } from "@/services/useCustomerManager";

interface CustomerSearchDialogProps {
  onCustomerSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export default function CustomerSearchDialog({
  onCustomerSelect,
  selectedCustomer,
}: CustomerSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { getCustomersByPhone, createCustomer } = useCustomerManager();

  // Create customer state
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    customerId: "",
    customerName: "",
    phone: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = await getCustomersByPhone(searchTerm.trim());

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching customers:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    setOpen(false);
    resetDialog();
  };

  const handleCreateWithoutCustomer = () => {
    onCustomerSelect(null);
    setOpen(false);
    resetDialog();
  };

  const handleRemoveCustomer = () => {
    onCustomerSelect(null);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.customerName || !newCustomer.phone) {
      alert("Vui lòng nhập tên và số điện thoại");
      return;
    }

    setIsCreating(true);
    try {
      // Gọi API tạo khách hàng
      const createdCustomer = await createCustomer({
        customerName: newCustomer.customerName,
        phone: newCustomer.phone,
      });

      if (!createdCustomer) {
        alert("Không thể tạo khách hàng. Vui lòng thử lại.");
        return;
      }

      // Chọn khách hàng vừa tạo
      onCustomerSelect(createdCustomer);
      setOpen(false);
      resetDialog();
      alert("Khách hàng đã được tạo thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo khách hàng:", error);
      alert("Có lỗi xảy ra khi tạo khách hàng");
    } finally {
      setIsCreating(false);
    }
  };

  const resetDialog = () => {
    setSearchTerm("");
    setSearchResults([]);
    setNewCustomer({
      customerId: "",
      customerName: "",
      phone: "",
    });
    setActiveTab("search");
  };

  const updateNewCustomer = (field: keyof Customer, value: string) => {
    setNewCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Khách hàng</Label>

      {selectedCustomer ? (
        // Display selected customer
        <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedCustomer.customerName}
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
                      <Search className="h-5 w-5" />
                      Quản Lý Khách Hàng
                    </DialogTitle>
                    <DialogDescription>
                      Tìm kiếm khách hàng có sẵn hoặc tạo mới
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="search"
                        className="flex items-center gap-2"
                      >
                        <Search className="h-4 w-4" />
                        Tìm kiếm
                      </TabsTrigger>
                      <TabsTrigger
                        value="create"
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Tạo mới
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="space-y-4">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Nhập tên hoặc số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                          />
                        </div>
                        <Button
                          onClick={handleSearch}
                          disabled={isSearching || !searchTerm.trim()}
                        >
                          {isSearching ? "Đang tìm..." : "Tìm kiếm"}
                        </Button>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          <h4 className="font-medium">Kết quả tìm kiếm:</h4>
                          {searchResults.map((customer) => (
                            <div
                              key={customer.customerId}
                              className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">
                                      {customer.customerName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span>{customer.phone}</span>
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    {customer.vehicles?.length || 0} xe đã đăng
                                    ký
                                  </div>
                                </div>
                                <Button size="sm">Chọn</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchTerm &&
                        searchResults.length === 0 &&
                        !isSearching && (
                          <div className="text-center py-8 space-y-3">
                            <p className="text-gray-500">
                              Không tìm thấy khách hàng
                            </p>
                            <Button
                              onClick={() => setActiveTab("create")}
                              variant="outline"
                              className="bg-transparent"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Tạo khách hàng mới
                            </Button>
                          </div>
                        )}

                      <div className="border-t pt-4">
                        <Button
                          onClick={handleCreateWithoutCustomer}
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Tiếp tục không có khách hàng
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="create" className="space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newCustomerName">
                              Tên khách hàng *
                            </Label>
                            <Input
                              id="newCustomerName"
                              placeholder="Nhập tên khách hàng"
                              value={newCustomer.customerName || ""}
                              onChange={(e) =>
                                updateNewCustomer(
                                  "customerName",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newCustomerPhone">
                              Số điện thoại *
                            </Label>
                            <Input
                              id="newCustomerPhone"
                              placeholder="Nhập số điện thoại"
                              value={newCustomer.phone || ""}
                              onChange={(e) =>
                                updateNewCustomer("phone", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="border-t pt-4 space-y-3">
                          <Button
                            onClick={handleCreateCustomer}
                            disabled={
                              isCreating ||
                              !newCustomer.customerName ||
                              !newCustomer.phone
                            }
                            className="w-full"
                          >
                            {isCreating ? (
                              <>Đang tạo...</>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Tạo khách hàng và chọn
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={handleCreateWithoutCustomer}
                            variant="outline"
                            className="w-full bg-transparent"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Tiếp tục không có khách hàng
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Button size="sm" variant="ghost" onClick={handleRemoveCustomer}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // No customer selected
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="text-center space-y-3">
            <div className="text-gray-500">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Chưa chọn khách hàng</p>
              <p className="text-sm">
                Có thể tạo hóa đơn không cần thông tin khách hàng
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm khách hàng
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Quản Lý Khách Hàng
                  </DialogTitle>
                  <DialogDescription>
                    Tìm kiếm khách hàng có sẵn hoặc tạo mới
                  </DialogDescription>
                </DialogHeader>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="search"
                      className="flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Tìm kiếm
                    </TabsTrigger>
                    <TabsTrigger
                      value="create"
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Tạo mới
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Nhập tên hoặc số điện thoại..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchTerm.trim()}
                      >
                        {isSearching ? "Đang tìm..." : "Tìm kiếm"}
                      </Button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <h4 className="font-medium">Kết quả tìm kiếm:</h4>
                        {searchResults.map((customer) => (
                          <div
                            key={customer.customerId}
                            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">
                                    {customer.customerName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  <span>{customer.phone}</span>
                                </div>
                                <div className="text-xs text-blue-600">
                                  {customer.vehicles?.length || 0} xe đã đăng ký
                                </div>
                              </div>
                              <Button size="sm">Chọn</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchTerm &&
                      searchResults.length === 0 &&
                      !isSearching && (
                        <div className="text-center py-8 space-y-3">
                          <p className="text-gray-500">
                            Không tìm thấy khách hàng
                          </p>
                          <Button
                            onClick={() => setActiveTab("create")}
                            variant="outline"
                            className="bg-transparent"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Tạo khách hàng mới
                          </Button>
                        </div>
                      )}

                    <div className="border-t pt-4">
                      <Button
                        onClick={handleCreateWithoutCustomer}
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Tiếp tục không có khách hàng
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="create" className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newCustomerName">
                            Tên khách hàng *
                          </Label>
                          <Input
                            id="newCustomerName"
                            placeholder="Nhập tên khách hàng"
                            value={newCustomer.customerName || ""}
                            onChange={(e) =>
                              updateNewCustomer("customerName", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newCustomerPhone">
                            Số điện thoại *
                          </Label>
                          <Input
                            id="newCustomerPhone"
                            placeholder="Nhập số điện thoại"
                            value={newCustomer.phone || ""}
                            onChange={(e) =>
                              updateNewCustomer("phone", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-3">
                        <Button
                          onClick={handleCreateCustomer}
                          disabled={
                            isCreating ||
                            !newCustomer.customerName ||
                            !newCustomer.phone
                          }
                          className="w-full"
                        >
                          {isCreating ? (
                            <>Đang tạo...</>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Tạo khách hàng và chọn
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handleCreateWithoutCustomer}
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Tiếp tục không có khách hàng
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}
