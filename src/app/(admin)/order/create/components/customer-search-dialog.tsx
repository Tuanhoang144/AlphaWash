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
import { useCustomerManager } from "@/services/useCustomerManager";
import { CustomerDTO } from "@/types/OrderResponse";
import { addToast } from "@heroui/react";

interface CustomerSearchDialogProps {
  onCustomerSelect: (customer: CustomerDTO | null) => void;
  selectedCustomer: CustomerDTO | null;
}

export default function CustomerSearchDialog({
  onCustomerSelect,
  selectedCustomer,
}: CustomerSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { getCustomersByPhone, createCustomer } = useCustomerManager();
  const [newCustomer, setNewCustomer] = useState<Partial<CustomerDTO>>({
    id: "",
    name: "",
    phone: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [totalSearchResults, setTotalSearchResults] = useState<number>(0); // Track total results
  const isValidVietnamesePhone = (phone: string) => {
    const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return regex.test(phone.trim());
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = await getCustomersByPhone(searchTerm.trim());

      let processedResults = results;
      
      if (Array.isArray(results) && results.length > 0 && Array.isArray(results[0])) {
        processedResults = results[0];
      }
      if (!Array.isArray(processedResults)) {
        setSearchResults([]);
        setTotalSearchResults(0);
        return;
      }
      
      // Giới hạn kết quả hiển thị để tránh UI quá tải
      const limitedResults = processedResults.slice(0, 20); // Hiển thị tối đa 20 kết quả
      
      setTotalSearchResults(processedResults.length);
      setSearchResults(limitedResults);
      
    } catch (error: any) {
      console.error("Error searching customers:", error);
      
      // Hiển thị message từ server nếu có lỗi 400
      if (error.name === 'BadRequest' && error.message) {
        addToast({
          title: "Lỗi tìm kiếm",
          description: error.message,
          color: "danger",
        });
      }
      
      setSearchResults([]);
      setTotalSearchResults(0);
    } finally {
      setIsSearching(false);
    }
  };
  const handleCustomerSelect = (customer: CustomerDTO) => {
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
    if (!newCustomer.name || !newCustomer.phone) {
      addToast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập tên và số điện thoại khách hàng.",
        color: "warning",
      });
      return;
    }

    if (!isValidVietnamesePhone(newCustomer.phone)) {
      setPhoneError("Số điện thoại không hợp lệ");
      return;
    }

    setIsCreating(true);
    try {
      // Gọi API tạo khách hàng
      const createdCustomer = await createCustomer({
        customerName: newCustomer.name,
        phone: newCustomer.phone,
      });

      if (!createdCustomer) {
        addToast({
          title: "Không thể tạo khách hàng",
          description: "Vui lòng thử lại.",
          color: "danger",
        });
        return;
      }

      // Chọn khách hàng vừa tạo
      onCustomerSelect({
        id: createdCustomer.id,
        name: createdCustomer.customerName,
        phone: createdCustomer.phone,
        vehicles: createdCustomer.vehicles || [],
      });
      setOpen(false);
      resetDialog();
      addToast({
        title: "Khách hàng đã được tạo thành công!",
        description: `Khách hàng ${newCustomer.name} đã được tạo và chọn.`,
        color: "success",
      });
    } catch (error: any) {
      console.error("Lỗi khi tạo khách hàng:", error);
      
      // Hiển thị message từ server nếu có
      let errorMessage = "Vui lòng kiểm tra lại thông tin và thử lại.";
      if (error.name === 'BadRequest' && error.message) {
        errorMessage = error.message;
      }
      
      addToast({
        title: "Lỗi khi tạo khách hàng",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetDialog = () => {
    setSearchTerm("");
    setSearchResults([]);
    setTotalSearchResults(0);
    setNewCustomer({
      id: "",
      name: "",
      phone: "",
    });
    setActiveTab("search");
  };

  const updateNewCustomer = (field: keyof CustomerDTO, value: string) => {
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
                            placeholder="Nhập biển số hoặc số điện thoại..."
                            value={searchTerm}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setSearchTerm(e.target.value)}
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
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              Kết quả tìm kiếm: ({searchResults.length}/{totalSearchResults} khách hàng)
                            </h4>
                            {totalSearchResults > searchResults.length && (
                              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                Hiển thị {searchResults.length} trong số {totalSearchResults} kết quả
                              </span>
                            )}
                          </div>
                          {searchResults.map((customer, index) => {
                            console.log(`Rendering customer ${index}:`, customer);
                            return (
                            <div
                              key={customer.id || `customer-${index}`} // Fallback key nếu id không có
                              className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">
                                      {customer.name || 'Không có tên'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span>{customer.phone || 'Không có SĐT'}</span>
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    {customer.vehicles?.length || 0} xe đã đăng
                                    ký
                                  </div>
                                  {/* Hiển thị danh sách xe nếu có */}
                                  {customer.vehicles && customer.vehicles.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Xe: {customer.vehicles.map((v, vIndex) => v.licensePlate).join(', ')}
                                    </div>
                                  )}
                                </div>
                                <Button size="sm">Chọn</Button>
                              </div>
                            </div>
                            );
                          })}
                          {totalSearchResults > searchResults.length && (
                            <div className="text-center py-2 text-sm text-gray-500 border-t">
                              Nhập từ khóa cụ thể hơn để thu hẹp kết quả tìm kiếm
                            </div>
                          )}
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
                              value={newCustomer.name || ""}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => updateNewCustomer("name", e.target.value)}
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
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const value = e.target.value;
                                updateNewCustomer("phone", value);

                                if (!value || isValidVietnamesePhone(value)) {
                                  setPhoneError(null); 
                                } else {
                                  setPhoneError("Số điện thoại không hợp lệ");
                                }
                              }}
                              required
                            />
                            {phoneError && (
                              <p className="text-sm text-red-600 mt-1">
                                {phoneError}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-4 space-y-3">
                          <Button
                            onClick={handleCreateCustomer}
                            disabled={
                              isCreating ||
                              !newCustomer.name ||
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
                          placeholder="Nhập biển số hoặc số điện thoại..."
                          value={searchTerm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearchTerm(e.target.value)
                          }
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
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            Kết quả tìm kiếm: ({searchResults.length}/{totalSearchResults} khách hàng)
                          </h4>
                          {totalSearchResults > searchResults.length && (
                            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              Hiển thị {searchResults.length} trong số {totalSearchResults} kết quả
                            </span>
                          )}
                        </div>
                        {searchResults.map((customer, index) => (
                          <div
                            key={customer.id || `customer-${index}`} // Fallback key nếu id không có
                            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">
                                    {customer.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-3 w-3" />
                                  <span>{customer.phone}</span>
                                </div>
                                <div className="text-xs text-blue-600">
                                  {customer.vehicles?.length || 0} xe đã đăng ký
                                </div>
                                {/* Hiển thị danh sách xe nếu có */}
                                {customer.vehicles && customer.vehicles.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Xe: {customer.vehicles.map(v => v.licensePlate).join(', ')}
                                  </div>
                                )}
                              </div>
                              <Button size="sm">Chọn</Button>
                            </div>
                          </div>
                        ))}
                        {totalSearchResults > searchResults.length && (
                          <div className="text-center py-2 text-sm text-gray-500 border-t">
                            Nhập từ khóa cụ thể hơn để thu hẹp kết quả tìm kiếm
                          </div>
                        )}
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
                            value={newCustomer.name || ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => updateNewCustomer("name", e.target.value)}
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
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const value = e.target.value;
                              updateNewCustomer("phone", value);

                              if (!value || isValidVietnamesePhone(value)) {
                                setPhoneError(null); 
                              } else {
                                setPhoneError("Số điện thoại không hợp lệ");
                              }
                            }}
                            required
                          />
                          {phoneError && (
                            <p className="text-sm text-red-600 mt-1">
                              {phoneError}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-3">
                        <Button
                          onClick={handleCreateCustomer}
                          disabled={
                            isCreating ||
                            !newCustomer.name ||
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
