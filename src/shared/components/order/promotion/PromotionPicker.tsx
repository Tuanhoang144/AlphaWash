"use client";

import React, { useMemo, useState } from "react";
import { AppliedPromotionCard } from "./components/AppliedPromotionCard";
import { EmptyPromotionCard } from "./components/EmptyPromotionCard";
import { PromotionDrawer } from "./components/PromotionDrawer";
import { PromotionApiItem } from "@/shared/types/PromotionApiItem";
import { filterPromotions, splitUsable } from "@/shared/utils/order/promotion";

export default function PromotionPicker({
  promotions,
  value,
  onChange,
  disabled,
}: {
  promotions: PromotionApiItem[];
  value: PromotionApiItem | null;
  onChange: (promo: PromotionApiItem | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"usable" | "unusable">("usable");

  const { usable, unusable } = useMemo(() => {
    const filtered = filterPromotions(promotions, q);
    return splitUsable(filtered);
  }, [promotions, q]);

  const list = mode === "usable" ? usable : unusable;

  return (
    <div>
      {value ? (
        <AppliedPromotionCard
          value={value}
          disabled={disabled}
          onRemove={() => onChange(null)}
          onOpen={() => setOpen(true)}
        />
      ) : (
        <EmptyPromotionCard disabled={disabled} onOpen={() => setOpen(true)} />
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
        selectedId={value?.promoId}
        onClose={() => setOpen(false)}
        onSelect={(p) => {
          onChange(p);
          setOpen(false);
        }}
      />
    </div>
  );
}
