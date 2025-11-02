"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidVietnamesePhone } from "@/shared/utils/checkValidate";
import { Save, UserPlus } from "lucide-react";

interface CustomerCreateTabProps {
  newCustomer: { name?: string; phone?: string };
  setNewCustomer: (field: "name" | "phone", value: string) => void;
  phoneError: string | null;
  setPhoneError: (err: string | null) => void;
  isCreating: boolean;
  onCreate: () => void;
  onContinueWithout: () => void;
}

export default function CustomerCreateTab({
  newCustomer,
  setNewCustomer,
  phoneError,
  setPhoneError,
  isCreating,
  onCreate,
  onContinueWithout,
}: CustomerCreateTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên khách hàng *</Label>
          <Input
            id="name"
            value={newCustomer.name || ""}
            onChange={(e) => setNewCustomer("name", e.target.value)}
            placeholder="Nhập tên khách hàng"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại *</Label>
          <Input
            id="phone"
            value={newCustomer.phone || ""}
            onChange={(e) => {
              const v = e.target.value;
              setNewCustomer("phone", v);
              setPhoneError(
                !v || isValidVietnamesePhone(v)
                  ? null
                  : "Số điện thoại không hợp lệ"
              );
            }}
            placeholder="Nhập số điện thoại"
          />
          {phoneError && (
            <p className="text-sm text-red-600 mt-1">{phoneError}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <Button
          onClick={onCreate}
          disabled={isCreating || !newCustomer.name || !newCustomer.phone}
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
          onClick={onContinueWithout}
          variant="outline"
          className="w-full bg-transparent"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Tiếp tục không có khách hàng
        </Button>
      </div>
    </div>
  );
}
