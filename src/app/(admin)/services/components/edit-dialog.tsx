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
import { Service } from "@/types/Service";
import { useEffect, useState } from "react";

interface ServiceType {
  code: string;
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
    code: "",
    serviceName: "",
    price: 0,
    size: "",
    duration: 0,
    note: "",
    serviceType: {
      code: "",
      serviceTypeName: "",
    },
  });

  // State lưu danh sách loại dịch vụ từ API (giả lập)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  // Giả lập call API lấy service types
  useEffect(() => {
    // Ví dụ call api async
    async function fetchServiceTypes() {
      // Giả lập delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Giả lập dữ liệu trả về
      setServiceTypes([
        { code: "ST001", serviceTypeName: "Bảo dưỡng" },
        { code: "ST002", serviceTypeName: "Vệ sinh" },
      ]);
    }
    fetchServiceTypes();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        id: 0,
        code: "",
        serviceName: "",
        price: 0,
        size: "",
        duration: 0,
        note: "",
        serviceType: {
          code: "",
          serviceTypeName: "",
        },
      });
    }
  }, [initialData]);

  const handleChange = (
    key: keyof Service | "serviceType.code" | "serviceType.serviceTypeName",
    value: any
  ) => {
    if (key.startsWith("serviceType.")) {
      const subkey = key.split(".")[1] as keyof Service["serviceType"];
      setForm((prev) => ({
        ...prev,
        serviceType: { ...prev.serviceType, [subkey]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Khi chọn dropdown loại dịch vụ thì set đồng thời code và tên
  const handleSelectServiceType = (selectedName: string) => {
    const selected = serviceTypes.find((s) => s.serviceTypeName === selectedName);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        serviceType: {
          code: selected.code,
          serviceTypeName: selected.serviceTypeName,
        },
      }));
    } else {
      // Nếu không tìm thấy thì reset
      setForm((prev) => ({
        ...prev,
        serviceType: {
          code: "",
          serviceTypeName: "",
        },
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
              value={form.serviceType.code}
              disabled
              readOnly
            />
          </div>

          {/* Tên loại dịch vụ dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên loại dịch vụ</label>
            <Select
              value={form.serviceType.serviceTypeName}
              onValueChange={handleSelectServiceType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((st) => (
                  <SelectItem key={st.code} value={st.serviceTypeName}>
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
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
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
            <label className="block text-sm font-medium mb-1">Thời lượng (phút)</label>
            <Input
              type="number"
              value={form.duration}
              onChange={(e) => handleChange("duration", +e.target.value)}
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
              if (!form.serviceType.code || !form.serviceType.serviceTypeName) {
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