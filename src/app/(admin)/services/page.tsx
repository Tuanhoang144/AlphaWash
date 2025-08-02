// File: app/page.tsx
"use client";

import ServiceManagementHeader from "./components/header";
import { ServiceTable } from "./components/table";
import EditDialog from "./components/edit-dialog";
import ConfirmDialog from "./components/confirm-dialog";
import { useEffect, useState } from "react";
import { Service } from "@/types/Service";
import { getServices, createOrUpdateService } from "@/lib/api";
import { useService } from "@/services/useService";

export default function ManageService() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editService, setEditService] = useState<Service | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

   const { getAllService, loading } = useService();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllService();
        setServices(data || []); // tuỳ theo cấu trúc response
      } catch (error) {
        // handle error nếu cần
      }
    };
    fetchData();
  }, [getAllService]);

  if (loading) return <div>Loading...</div>;

  const handleSave = async (data: Service) => {
    const payload = {
      serviceCode: data.serviceCode,
      serviceName: data.serviceName,
      serviceTypeCode: data.serviceTypeCode,
      serviceTypeName: data.serviceTypeName,
      price: data.price,
      duration: data.duration.toString(),
      size: data.size,
      note: data.note || "",
    };
    await createOrUpdateService(payload);

    if (data.id === 0) {
      const newItem = { ...data, id: Date.now() };
      setServices((prev) => [...prev, newItem]);
    } else {
      setServices((prev) => prev.map((s) => (s.id === data.id ? data : s)));
    }
    setShowDialog(false);
  };

  const handleEdit = (s: Service) => {
    setEditService({ ...s });
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditService(null);
    setShowDialog(true);
  };

  const confirmDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId !== null) {
      setServices((prev) => prev.filter((s) => s.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const filtered = services.filter((s) =>
    s.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 w-full max-w-[95vw] xl:max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Quản lý dịch vụ</h1>
      <ServiceManagementHeader onAddService={handleAdd} onSearch={setSearchTerm} />
      <div className="overflow-auto rounded-md border">
        <ServiceTable services={filtered} onEdit={handleEdit} onDelete={confirmDelete} />
      </div>
      <EditDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSave}
        initialData={editService}
        availableServices={services}
      />
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Bạn có chắc chắn muốn xóa dịch vụ này không?"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}