"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ServiceUsedDTO, ServiceDetailResponse } from "@/types/CarUser";
import { ServiceUsedTable } from "./components/ServiceUsedTable";
import { ServiceUsedDetailDialog } from "./components/ServiceUsedDetailDialog";
import { ServiceUsedDialog } from "./components/ServiceUsedDialog";
import { useServiceUsedManager } from "@/services/userCarManager";
import { Pagination } from "./components/pagination";

export default function ServiceUsedPage() {
  const {
    servicesUsed,
    getAllServicesUsed,
    addServiceUsed,
    updateServiceUsed,
    deleteServiceUsed,
    getServiceUsedDetail,
  } = useServiceUsedManager();

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<ServiceUsedDTO[]>([]);
  const [selected, setSelected] = useState<ServiceDetailResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    getAllServicesUsed();
  }, [getAllServicesUsed]);

  useEffect(() => {
    const f = servicesUsed.filter(
      (c) =>
        c.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
        c.customerName.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
    setPage(1);
  }, [search, servicesUsed]);

  const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleViewDetail = async (c: ServiceUsedDTO) => {
  if (!c.customerId) {
    alert("Không có thông tin user"); // ❌ hoặc toast.error("Không có thông tin user")
    return;
  }

  const detailData = await getServiceUsedDetail(c.customerId);
  if (detailData) {
    setSelected(detailData);   // state riêng cho detail
    setDetailOpen(true);
  } else {
    alert("Không tìm thấy thông tin chi tiết của user");
  }
};


  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-1/2">
          <Input
            placeholder="Tìm theo biển số hoặc tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <ServiceUsedTable
        data={pagedData}
        onEdit={() => { }}
        onDelete={deleteServiceUsed}
        onViewDetail={handleViewDetail}
        page={page}
        pageSize={pageSize}
      />

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <ServiceUsedDialog
        data={null}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(d) => addServiceUsed(d)}
      />

      <ServiceUsedDetailDialog
        data={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}