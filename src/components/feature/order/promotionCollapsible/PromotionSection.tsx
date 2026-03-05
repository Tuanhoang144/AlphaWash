"use client";

import { CustomerDTO } from "@/types/customer/CustomerDTO";
import { PromotionDTO } from "@/types/promotion/PromotionDTO";
import { AppliedPromotionCard } from "./ui/AppliedPromotionCard";
import { EmptyPromotionCard } from "./ui/EmptyPromotionCard";
import { PromotionDrawer } from "./ui/PromotionDrawer";
import { useMemo, useState } from "react";
import { filterPromotions, splitUsable } from "@/shared/utils/order/promotion";
import usePromotion from "@/hooks/createOrder/orderDetail/useHandlePromotion";

interface Props {
  customer?: CustomerDTO | null;
  selectedPromotion: PromotionDTO | null;
  onHandlePromotionChange: (promo: PromotionDTO | null) => void;
}

export default function PromotionSection({
  customer,
  selectedPromotion,
  onHandlePromotionChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"usable" | "unusable">("usable");

  const { listPromotions = [] } = usePromotion(customer || null);
  const { usable, unusable } = useMemo(() => {
    const filtered = filterPromotions(listPromotions, q);
    return splitUsable(filtered);
  }, [listPromotions, q]);
  const list = mode === "usable" ? usable : unusable;
  return (
    <div>
      {selectedPromotion ? (
        <AppliedPromotionCard
          value={selectedPromotion}
          onRemove={() => onHandlePromotionChange(null)}
          onOpen={() => setOpen(true)}
        />
      ) : (
        <EmptyPromotionCard onOpen={() => setOpen(true)} />
      )}

      <PromotionDrawer
        open={open}
        q={q}
        mode={mode}
        setQ={setQ}
        setMode={setMode}
        usableCount={usable.length}
        unusableCount={unusable.length}
        list={list}
        selectedId={selectedPromotion?.promoId}
        onClose={() => setOpen(false)}
        onSelect={(p) => {
          onHandlePromotionChange(p);
          setOpen(false);
        }}
      />
    </div>
  );
}
