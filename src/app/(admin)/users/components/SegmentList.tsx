"use client";

import { useEffect, useState } from "react";
import { useSegmentManager } from "@/services/useSegmentManager";
import type { CustomerSegment } from "@/types/Segment";
import {
  Crown, Star, Heart, Zap, Shield,
  Award, Target, Clock, Car, Sparkles,
  Users, Pencil, Trash2, Plus, RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SegmentBuilder from "./SegmentBuilder";

const iconMap: Record<string, React.ReactNode> = {
  crown: <Crown className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  heart: <Heart className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  award: <Award className="h-4 w-4" />,
  target: <Target className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
};

interface Props {
  onFilterBySegment: (segmentCode: string | null) => void;
  activeSegment: string | null;
}

export default function SegmentList({ onFilterBySegment, activeSegment }: Props) {
  const {
    segments, loading,
    getAllSegments, deleteSegment, recomputeAll,
  } = useSegmentManager();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegment | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getAllSegments();
  }, [getAllSegments]);

  const handleDelete = async (seg: CustomerSegment) => {
    if (!confirm(`Xóa phân khúc "${seg.segmentName}"?`)) return;
    await deleteSegment(seg.id);
    if (activeSegment === seg.code) onFilterBySegment(null);
    getAllSegments();
  };

  const handleRecompute = async () => {
    setRefreshing(true);
    await recomputeAll();
    await getAllSegments();
    setRefreshing(false);
  };

  const handleSaved = () => {
    setBuilderOpen(false);
    setEditingSegment(null);
    getAllSegments();
  };

  if (loading && segments.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Phân Khúc Khách Hàng</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecompute}
            className="flex h-8 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Tính lại
          </button>
          <button
            onClick={() => { setEditingSegment(null); setBuilderOpen(true); }}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Tạo mới
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterBySegment(null)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
            activeSegment === null
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Tất cả
        </button>

        {segments.map((seg) => (
          <div key={seg.code} className="group relative">
            <button
              onClick={() => onFilterBySegment(activeSegment === seg.code ? null : seg.code)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                activeSegment === seg.code
                  ? "shadow-sm"
                  : "bg-card hover:shadow-md"
              }`}
              style={activeSegment === seg.code ? {
                borderColor: `${seg.color}50`,
                backgroundColor: `${seg.color}08`,
                color: seg.color,
              } : {}}
            >
              <span style={{ color: seg.color }}>
                {iconMap[seg.icon] || <Star className="h-4 w-4" />}
              </span>
              <span>{seg.segmentName}</span>
              <span
                className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: seg.color }}
              >
                {seg.customerCount}
              </span>
            </button>
            <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
              {!seg.isSystem && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingSegment(seg); setBuilderOpen(true); }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-muted border shadow-sm hover:bg-background"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(seg); }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 border border-red-200 shadow-sm hover:bg-red-100"
                  >
                    <Trash2 className="h-2.5 w-2.5 text-red-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {builderOpen && (
        <SegmentBuilder
          segment={editingSegment}
          onClose={() => { setBuilderOpen(false); setEditingSegment(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
