import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { CustomerDTO } from "@/types/customer/CustomerDTO";

interface Props {
  editingCustomer: Partial<CustomerDTO>;
  phoneError: string | null;
  updateEditingCustomer: (field: keyof CustomerDTO, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}
//Component dùng để hiển thị form chỉnh sửa thông tin khách hàng khi có customer và đang ở chế độ edit
export default function CustomerInfoForm({ editingCustomer, phoneError, updateEditingCustomer, onSave, onCancel }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Tên khách hàng *</Label>
        <Input
          placeholder="Nhập tên khách hàng"
          value={editingCustomer.name || ""}
          onChange={(e) => updateEditingCustomer("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Số điện thoại *</Label>
        <Input
          placeholder="Nhập số điện thoại"
          value={editingCustomer.phone || ""}
          onChange={(e) => updateEditingCustomer("phone", e.target.value)}
        />
        {phoneError && <p className="text-sm text-red-600 mt-1">{phoneError}</p>}
      </div>
      <div className="col-span-2 flex gap-2">
        <Button size="sm" type="button" onClick={onSave}><Save className="h-4 w-4 mr-2" />Lưu</Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="h-4 w-4 mr-2" />Hủy</Button>
      </div>
    </div>
  );
}
