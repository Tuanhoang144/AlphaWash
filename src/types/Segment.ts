export interface CustomerSegment {
  id: number;
  code: string;
  segmentName: string;
  description: string;
  color: string;
  icon: string;
  conditions: string;
  logicOperator: string;
  isSystem: boolean;
  displayOrder: number;
  isActive: boolean;
  customerCount: number;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: string;
}

export interface SegmentConditions {
  rules: RuleCondition[];
}

export interface SegmentPreview {
  segmentName: string;
  matchCount: number;
  customers: PreviewCustomer[];
}

export interface PreviewCustomer {
  customerId: string;
  customerName: string;
  phone: string;
  totalSpending: number;
  visitCount: number;
}

export interface SegmentDashboard {
  segments: SegmentSummary[];
  topSpenders: PreviewCustomer[];
  atRiskCustomers: PreviewCustomer[];
}

export interface SegmentSummary {
  code: string;
  segmentName: string;
  color: string;
  icon: string;
  customerCount: number;
  lastMonthCount: number;
  growth: number;
}

export interface CustomerWithSegments {
  customerId: string;
  customerName: string;
  phone: string;
  segments: SegmentBadge[];
}

export interface SegmentBadge {
  code: string;
  segmentName: string;
  color: string;
  icon: string;
}

export const RULE_FIELDS = [
  { value: "visit_count", label: "Số lần ghé thăm", type: "number" },
  { value: "days_since_last_visit", label: "Số ngày từ lần cuối", type: "number" },
  { value: "total_spending", label: "Tổng chi tiêu (VNĐ)", type: "number" },
  { value: "avg_invoice", label: "TB hóa đơn (VNĐ)", type: "number" },
  { value: "total_invoices", label: "Tổng số hóa đơn", type: "number" },
  { value: "vehicle_count", label: "Số xe", type: "number" },
  { value: "days_since_registration", label: "Ngày đăng ký (ngày)", type: "number" },
  { value: "avg_visit_interval", label: "TB khoảng cách ghé (ngày)", type: "number" },
  { value: "visits_last_30_days", label: "Ghé thăm 30 ngày qua", type: "number" },
  { value: "visits_last_90_days", label: "Ghé thăm 90 ngày qua", type: "number" },
  { value: "service_type_used", label: "Loại dịch vụ đã dùng", type: "text" },
  { value: "vehicle_brand", label: "Hãng xe", type: "text" },
] as const;

export const OPERATORS = [
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: "==", label: "=" },
  { value: "!=", label: "!=" },
] as const;

export const SEGMENT_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
] as const;

export const SEGMENT_ICONS = [
  "crown", "star", "heart", "zap", "shield",
  "award", "target", "clock", "car", "sparkles",
] as const;
