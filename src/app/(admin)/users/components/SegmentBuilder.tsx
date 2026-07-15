"use client";

import { useState, useEffect } from "react";
import { useSegmentManager } from "@/services/useSegmentManager";
import type { CustomerSegment, RuleCondition, PreviewCustomer } from "@/types/Segment";
import { RULE_FIELDS, OPERATORS, SEGMENT_COLORS, SEGMENT_ICONS } from "@/types/Segment";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  X, Plus, Trash2, Eye, Save, Loader2,
  Crown, Star, Heart, Zap, Shield,
  Award, Target, Clock, Car, Sparkles,
} from "lucide-react";

const iconComponents: Record<string, React.ReactNode> = {
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

function formatVND(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toLocaleString("en-US");
}

interface Props {
  segment: CustomerSegment | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function SegmentBuilder({ segment, onClose, onSaved }: Props) {
  const { createSegment, updateSegment, previewSegment, loading } = useSegmentManager();

  const [code, setCode] = useState(segment?.code || "");
  const [name, setName] = useState(segment?.segmentName || "");
  const [description, setDescription] = useState(segment?.description || "");
  const [color, setColor] = useState(segment?.color || SEGMENT_COLORS[0]);
  const [icon, setIcon] = useState(segment?.icon || "star");
  const [logic, setLogic] = useState(segment?.logicOperator || "AND");
  const [rules, setRules] = useState<RuleCondition[]>([]);
  const [previewData, setPreviewData] = useState<{ matchCount: number; customers: PreviewCustomer[] } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (segment?.conditions) {
      try {
        const parsed = JSON.parse(segment.conditions);
        setRules(parsed.rules || []);
      } catch {
        setRules([]);
      }
    } else {
      setRules([{ field: "total_spending", operator: ">=", value: "" }]);
    }
  }, [segment]);

  const addRule = () => {
    setRules([...rules, { field: "visit_count", operator: ">=", value: "" }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof RuleCondition, value: string) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const buildConditions = () => JSON.stringify({ rules });

  const handlePreview = async () => {
    const result = await previewSegment({
      code: code || "preview",
      segmentName: name || "Preview",
      conditions: buildConditions(),
      logicOperator: logic,
    });
    if (result) {
      setPreviewData({ matchCount: result.matchCount, customers: result.customers });
    }
  };

  const handleSave = async () => {
    if (!code.trim() || !name.trim()) return;
    setSaving(true);
    try {
      const data = {
        code: code.trim(),
        segmentName: name.trim(),
        description: description.trim(),
        color,
        icon,
        conditions: buildConditions(),
        logicOperator: logic,
        displayOrder: 0,
        isActive: true,
      };
      if (segment) {
        await updateSegment(segment.id, data);
      } else {
        await createSegment(data);
      }
      onSaved();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
          <h2 className="text-lg font-bold">
            {segment ? "Chỉnh sửa phân khúc" : "Tạo phân khúc mới"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mã phân khúc</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, "_"))}
                placeholder="VIP_CUSTOMER"
                disabled={!!segment}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tên phân khúc</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Khách VIP" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Mô tả</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phân khúc..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Màu sắc</label>
              <div className="flex flex-wrap gap-2">
                {SEGMENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Icon</label>
              <div className="flex flex-wrap gap-2">
                {SEGMENT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                      icon === ic ? "border-primary bg-primary/10 text-primary" : "border-muted bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {iconComponents[ic]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Điều kiện</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Logic:</span>
                {["AND", "OR"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLogic(l)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      logic === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {rules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2.5">
                {i > 0 && (
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {logic}
                  </span>
                )}
                <select
                  value={rule.field}
                  onChange={(e) => updateRule(i, "field", e.target.value)}
                  className="h-9 rounded-md border bg-background px-2 text-sm flex-1 min-w-0"
                >
                  {RULE_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(i, "operator", e.target.value)}
                  className="h-9 w-16 rounded-md border bg-background px-2 text-sm shrink-0"
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                <Input
                  value={rule.value}
                  onChange={(e) => updateRule(i, "value", e.target.value)}
                  placeholder="Giá trị"
                  className="w-32 shrink-0"
                />
                {rules.length > 1 && (
                  <button
                    onClick={() => removeRule(i)}
                    className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addRule}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm điều kiện
            </button>
          </div>

          {previewData && (
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold">
                  Kết quả: {previewData.matchCount} khách hàng phù hợp
                </span>
              </div>
              {previewData.customers.length > 0 && (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {previewData.customers.slice(0, 10).map((c) => (
                    <div key={c.customerId} className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium">{c.customerName || "Khách lẻ"}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{c.phone}</span>
                      </div>
                      <span className="text-xs font-semibold">{formatVND(c.totalSpending)} đ</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between border-t bg-background p-4">
          <button
            onClick={handlePreview}
            disabled={loading || rules.every((r) => !r.value)}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Xem trước
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !code.trim() || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {segment ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
