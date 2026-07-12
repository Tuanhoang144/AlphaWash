"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subQuarters,
} from "date-fns";
import type { DateRange } from "../types/dashboard";

const fmt = (d: Date) => format(d, "yyyyMMdd");

function buildRange(label: string, start: Date, end: Date, compStart: Date, compEnd: Date): DateRange {
  return {
    label,
    startDate: fmt(start),
    endDate: fmt(end),
    compareStartDate: fmt(compStart),
    compareEndDate: fmt(compEnd),
  };
}

const presets: (() => DateRange)[] = [
  () => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const twoDaysAgo = subDays(today, 2);
    return buildRange("Hôm nay", today, today, yesterday, yesterday);
  },
  () => {
    const yesterday = subDays(new Date(), 1);
    const twoDaysAgo = subDays(new Date(), 2);
    return buildRange("Hôm qua", yesterday, yesterday, twoDaysAgo, twoDaysAgo);
  },
  () => {
    const end = new Date();
    const start = subDays(end, 6);
    const compEnd = subDays(start, 1);
    const compStart = subDays(compEnd, 6);
    return buildRange("7 ngày qua", start, end, compStart, compEnd);
  },
  () => {
    const end = new Date();
    const start = subDays(end, 29);
    const compEnd = subDays(start, 1);
    const compStart = subDays(compEnd, 29);
    return buildRange("30 ngày qua", start, end, compStart, compEnd);
  },
  () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const prev = subMonths(now, 1);
    return buildRange("Tháng này", start, end, startOfMonth(prev), endOfMonth(prev));
  },
  () => {
    const prev = subMonths(new Date(), 1);
    const prevPrev = subMonths(new Date(), 2);
    return buildRange("Tháng trước", startOfMonth(prev), endOfMonth(prev), startOfMonth(prevPrev), endOfMonth(prevPrev));
  },
  () => {
    const now = new Date();
    const start = startOfQuarter(now);
    const end = endOfQuarter(now);
    const prevQ = subQuarters(now, 1);
    return buildRange("Quý này", start, end, startOfQuarter(prevQ), endOfQuarter(prevQ));
  },
  () => {
    const now = new Date();
    const start = startOfYear(now);
    const end = endOfYear(now);
    const prevYear = new Date(now.getFullYear() - 1, 0, 1);
    return buildRange("Năm nay", start, end, startOfYear(prevYear), endOfYear(prevYear));
  },
];

interface Props {
  onRangeChange: (range: DateRange) => void;
  currentRange: DateRange;
}

export default function DashboardDateFilter({ onRangeChange, currentRange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {presets.map((getPreset) => {
        const preset = getPreset();
        const isActive = currentRange.label === preset.label;
        return (
          <button
            key={preset.label}
            onClick={() => onRangeChange(preset)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}

export function getDefaultRange(): DateRange {
  return presets[4]();
}
