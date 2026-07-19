"use client";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Mail, MapPin, Phone, Receipt, TrendingUp, Wallet } from "lucide-react";
import { CustomerAvatar } from "../CustomerAvatar";
import { CustomerStatusBadge } from "../CustomerStatusBadge";
import { CustomerTagBadge } from "../CustomerTagBadge";
import type { CustomerDetail } from "@/types/Customer";
import { CUSTOMER_GENDER_LABELS } from "@/types/Customer";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-bold truncate">{value}</p>
    </div>
  );
}

export function OverviewTab({ customer }: { customer: CustomerDetail }) {
  const { stats } = customer;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <CustomerAvatar name={customer.name} avatarUrl={customer.avatarUrl} className="size-14" />
        <div className="min-w-0">
          <p className="text-lg font-semibold truncate">{customer.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <CustomerStatusBadge status={customer.status} />
            {customer.tags.map((t) => (
              <CustomerTagBadge key={t.code} tag={t} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="size-3.5 text-muted-foreground shrink-0" />
          <span>{customer.phone}</span>
        </div>
        {customer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{customer.address}</span>
          </div>
        )}
        {customer.birthday && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <span>{new Date(customer.birthday).toLocaleDateString("vi-VN")}</span>
          </div>
        )}
        {customer.gender && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Giới tính: {CUSTOMER_GENDER_LABELS[customer.gender]}</span>
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Thống kê nhanh
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={<Receipt className="size-3.5" />} label="Tổng lượt ghé" value={String(stats.totalVisits)} />
          <StatCard icon={<Wallet className="size-3.5" />} label="Tổng chi tiêu" value={currency.format(stats.totalSpending)} />
          <StatCard icon={<TrendingUp className="size-3.5" />} label="TB hóa đơn" value={currency.format(stats.avgInvoice)} />
          <StatCard
            icon={<Calendar className="size-3.5" />}
            label="Ghé gần nhất"
            value={
              stats.lastVisitDate
                ? formatDistanceToNow(new Date(stats.lastVisitDate), { addSuffix: true, locale: vi })
                : "Chưa ghé"
            }
          />
        </div>
      </div>
    </div>
  );
}
