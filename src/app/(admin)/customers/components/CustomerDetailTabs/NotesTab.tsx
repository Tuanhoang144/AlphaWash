"use client";

import { useEffect, useState } from "react";
import { addToast } from "@heroui/react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerService } from "@/services/useCustomerService";
import type { CustomerDetail } from "@/types/Customer";

interface NotesTabProps {
  customer: CustomerDetail;
  onUpdated: (customer: CustomerDetail) => void;
}

export function NotesTab({ customer, onUpdated }: NotesTabProps) {
  const { updateCustomer } = useCustomerService();
  const [note, setNote] = useState(customer.note ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNote(customer.note ?? "");
  }, [customer.id, customer.note]);

  const dirty = note !== (customer.note ?? "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateCustomer(customer.id, { note });
      if (updated) {
        onUpdated(updated);
        addToast({ title: "Thành công", description: "Đã lưu ghi chú.", color: "success" });
      }
    } catch (error: any) {
      addToast({ title: "Lỗi", description: error?.message || "Không thể lưu ghi chú.", color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú về khách hàng này..."
        rows={10}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Lưu ghi chú
        </Button>
      </div>
    </div>
  );
}
