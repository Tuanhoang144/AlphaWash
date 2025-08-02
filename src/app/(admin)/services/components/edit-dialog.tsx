import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import axios from "axios";
import { Service } from "@/types/Service";
import { useService } from "@/services/useService";


interface ServiceType {
  serviceTypeCode: string;
  serviceTypeName: string;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  initialData?: Service | null;
  availableServices: Service[];
}

export default function EditDialog({
  open,
  onClose,
  onSave,
  initialData,
  availableServices,
}: EditDialogProps) {
  const [form, setForm] = useState<Service>({
    id: 0,
    serviceTypeCode: "",
    serviceTypeName: "",
    serviceCode: "",
    serviceName: "",
    price: 0,
    duration: 0,
    size: "",
    note: "",
  });

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const { getAllServiceType, loading } = useService();
  // Call API lấy danh sách loại dịch vụ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllServiceType();
        setServiceTypes(data || []); // tuỳ theo cấu trúc response
      } catch (error) {
        // handle error nếu cần
      }
    };
    fetchData();
  }, [getAllServiceType]);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        id: 0,
        serviceTypeCode: "",
        serviceTypeName: "",
        serviceCode: "",
        serviceName: "",
        price: 0,
        duration: 0,
        size: "",
        note: "",
      });
    }
  }, [initialData]);

  const handleChange = (key: keyof Service, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Khi chọn dropdown loại dịch vụ thì set đồng thời code và tên
 const handleSelectServiceType = (selectedCode: string) => {
  console.log(selectedCode)
  const selected = serviceTypes.find((s) => s.serviceTypeCode === selectedCode);
  if (selected) {
    setForm((prev) => ({
      ...prev,
      serviceTypeCode: selected.serviceTypeCode,
      serviceTypeName: selected.serviceTypeName,
    }));
  } else {
    setForm((prev) => ({
      ...prev,
      serviceTypeCode: "",
      serviceTypeName: "",
    }));
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {form.id ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mã loại dịch vụ (readonly) */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã loại dịch vụ</label>
            <Input
              placeholder="Mã loại dịch vụ"
              value={form.serviceTypeCode}
              disabled
              readOnly
            />
          </div>

          {/* Tên loại dịch vụ dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên loại dịch vụ</label>
            <Select
              value={form.serviceTypeCode}
              onValueChange={handleSelectServiceType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((st, idx) => (
                  <SelectItem
                    key={st.serviceTypeCode || idx}
                    value={st.serviceTypeCode}
                  >
                    {st.serviceTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mã dịch vụ */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã dịch vụ</label>
            <Input
              placeholder="Mã dịch vụ"
              value={form.serviceCode}
              onChange={(e) => handleChange("serviceCode", e.target.value)}
              disabled
            />
          </div>

          {/* Tên dịch vụ */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên dịch vụ</label>
            <Input
              placeholder="Tên dịch vụ"
              value={form.serviceName}
              onChange={(e) => handleChange("serviceName", e.target.value)}
            />
          </div>

          {/* Giá tiền */}
          <div>
            <label className="block text-sm font-medium mb-1">Giá tiền</label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", +e.target.value)}
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium mb-1">Size</label>
            <Input
              value={form.size}
              onChange={(e) => handleChange("size", e.target.value)}
            />
          </div>

          {/* Thời lượng */}
          <div>
            <label className="block text-sm font-medium mb-1">Thời lượng</label>
            <Input
              value={form.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <Input
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={() => {
              if (!form.serviceTypeCode || !form.serviceTypeName) {
                alert("Vui lòng chọn loại dịch vụ.");
                return;
              }
              onSave(form);
            }}
          >
            {form.id ? "Lưu" : "Thêm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}