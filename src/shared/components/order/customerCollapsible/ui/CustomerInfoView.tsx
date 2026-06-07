import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { CustomerDTO } from "@/types/OrderResponse";

interface Props {
  customer: CustomerDTO;
  onEdit: () => void;
}

//Component dùng để hiển thị thông tin khách hàng khi có customer khác null và không trong trạng thái chỉnh sửa thông tin khách hàng
export default function CustomerInfoView({ customer, onEdit }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Chi tiết khách hàng</h4>
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tên khách hàng</Label>
          <div className="p-2 bg-gray-50 rounded-md">{customer.name}</div>
        </div>
        <div className="space-y-2">
          <Label>Số điện thoại</Label>
          <div className="p-2 bg-gray-50 rounded-md">{customer.phone}</div>
        </div>
      </div>
    </div>
  );
}
