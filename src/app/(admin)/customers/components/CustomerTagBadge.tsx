"use client";

import type { SegmentBadge } from "@/types/Segment";
import {
  Award,
  Car,
  Clock,
  Crown,
  Heart,
  Shield,
  Sparkles,
  Star,
  Target,
  Zap,
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  crown: <Crown className="size-3" />,
  star: <Star className="size-3" />,
  heart: <Heart className="size-3" />,
  zap: <Zap className="size-3" />,
  shield: <Shield className="size-3" />,
  award: <Award className="size-3" />,
  target: <Target className="size-3" />,
  clock: <Clock className="size-3" />,
  car: <Car className="size-3" />,
  sparkles: <Sparkles className="size-3" />,
};

export function CustomerTagBadge({ tag }: { tag: SegmentBadge }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap"
      style={{
        backgroundColor: `${tag.color}15`,
        color: tag.color,
        borderColor: `${tag.color}30`,
      }}
    >
      {ICONS[tag.icon] || <Star className="size-3" />}
      {tag.segmentName}
    </span>
  );
}
