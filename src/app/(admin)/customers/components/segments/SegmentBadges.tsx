"use client";

import type { SegmentBadge } from "@/types/Segment";
import {
  Crown, Star, Heart, Zap, Shield,
  Award, Target, Clock, Car, Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  crown: <Crown className="h-3 w-3" />,
  star: <Star className="h-3 w-3" />,
  heart: <Heart className="h-3 w-3" />,
  zap: <Zap className="h-3 w-3" />,
  shield: <Shield className="h-3 w-3" />,
  award: <Award className="h-3 w-3" />,
  target: <Target className="h-3 w-3" />,
  clock: <Clock className="h-3 w-3" />,
  car: <Car className="h-3 w-3" />,
  sparkles: <Sparkles className="h-3 w-3" />,
};

interface Props {
  badges: SegmentBadge[];
  size?: "sm" | "md";
}

export default function SegmentBadges({ badges, size = "sm" }: Props) {
  if (!badges || badges.length === 0) return null;

  const cls = size === "sm" ? "px-1.5 py-0.5 text-[10px] gap-1" : "px-2 py-1 text-xs gap-1.5";

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span
          key={b.code}
          className={`inline-flex items-center rounded-full font-medium ${cls}`}
          style={{
            backgroundColor: `${b.color}15`,
            color: b.color,
            border: `1px solid ${b.color}30`,
          }}
        >
          {iconMap[b.icon] || <Star className="h-3 w-3" />}
          {b.segmentName}
        </span>
      ))}
    </div>
  );
}
