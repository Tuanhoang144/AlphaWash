"use client";

import { useState, useCallback } from "react";
import { X, ClipboardPaste, Sparkles, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { QuickService, QuickServiceGroup } from "@/types/QuickInvoice";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedMessage {
  brand: string;
  model: string;
  plate: string;
  service: string;
  staff: string;
}

interface FillFormPayload {
  plate: string;
  matchedService: QuickService | null;
  rawServiceName: string;
  staff: string;
  brand: string;
  model: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  serviceGroups: QuickServiceGroup[];
  onFillForm: (payload: FillFormPayload) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseGroupMessage(text: string): ParsedMessage {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const [line1, line2, line3] = lines;

  const parts = line1?.split("/") ?? [];
  const brand = parts[0]?.trim() ?? "";
  const model = parts[1]?.trim() ?? "";
  const plate = parts[2]?.trim() ?? "";

  const service = line2?.trim() ?? "";
  const staff = line3?.startsWith("@") ? line3.slice(1).trim() : (line3?.trim() ?? "");

  return { brand, model, plate, service, staff };
}

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findBestServiceMatch(
  query: string,
  serviceGroups: QuickServiceGroup[]
): QuickService | null {
  if (!query.trim()) return null;

  const nq = normalizeForMatch(query);
  const allServices = serviceGroups.flatMap((g) => g.services);

  // Exact match first
  const exact = allServices.find(
    (s) => normalizeForMatch(s.serviceName) === nq
  );
  if (exact) return exact;

  // Starts-with match
  const startsWith = allServices.find((s) =>
    normalizeForMatch(s.serviceName).startsWith(nq)
  );
  if (startsWith) return startsWith;

  // Query starts with service name (service name is prefix of query)
  const prefixMatch = allServices.find((s) =>
    nq.startsWith(normalizeForMatch(s.serviceName))
  );
  if (prefixMatch) return prefixMatch;

  // Contains match
  const contains = allServices.find(
    (s) =>
      normalizeForMatch(s.serviceName).includes(nq) ||
      nq.includes(normalizeForMatch(s.serviceName))
  );
  return contains ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessageParserModal({
  open,
  onClose,
  serviceGroups,
  onFillForm,
}: Props) {
  const [messageText, setMessageText] = useState("");
  const [parsed, setParsed] = useState<ParsedMessage | null>(null);
  const [matchedService, setMatchedService] = useState<QuickService | null>(null);
  const [parseError, setParseError] = useState("");
  const [showServicePicker, setShowServicePicker] = useState(false);

  const allServices = serviceGroups.flatMap((g) => g.services);

  const handleAnalyze = useCallback(() => {
    setParseError("");
    setShowServicePicker(false);

    if (!messageText.trim()) {
      setParseError("Vui lòng dán tin nhắn vào ô trên.");
      return;
    }

    const result = parseGroupMessage(messageText);

    if (!result.plate) {
      setParseError(
        "Không tìm thấy biển số. Kiểm tra định dạng: Hãng/Dòng xe/Biển số"
      );
      return;
    }

    const match = findBestServiceMatch(result.service, serviceGroups);
    setParsed(result);
    setMatchedService(match);
  }, [messageText, serviceGroups]);

  const handleFillForm = useCallback(() => {
    if (!parsed) return;
    onFillForm({
      plate: parsed.plate,
      matchedService,
      rawServiceName: parsed.service,
      staff: parsed.staff,
      brand: parsed.brand,
      model: parsed.model,
    });
    onClose();
    // Reset for next use
    setMessageText("");
    setParsed(null);
    setMatchedService(null);
    setParseError("");
    setShowServicePicker(false);
  }, [parsed, matchedService, onFillForm, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setMessageText("");
    setParsed(null);
    setMatchedService(null);
    setParseError("");
    setShowServicePicker(false);
  }, [onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Bottom sheet panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-base">Tạo từ tin nhắn nhóm</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4 pb-8">
          {/* Format hint */}
          <div className="p-3 rounded-xl bg-muted/50 border border-input text-xs text-muted-foreground space-y-0.5 font-mono">
            <div className="text-foreground font-semibold text-sm font-sans mb-1">Định dạng tin nhắn</div>
            <div>Honda/hrv/51K73245</div>
            <div>Rửa lv1</div>
            <div>@Trường Nam</div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Dán tin nhắn vào đây...
            </label>
            <textarea
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setParsed(null);
                setParseError("");
                setShowServicePicker(false);
              }}
              placeholder={"Honda/hrv/51K73245\nRửa lv1\n@Trường Nam"}
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          {/* Error */}
          {parseError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {parseError}
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            className="w-full h-12 rounded-xl bg-muted hover:bg-muted/80 border border-input font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Phân tích
          </button>

          {/* Preview result */}
          {parsed && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground">Kết quả phân tích</div>

              <div className="rounded-xl border border-input bg-muted/30 divide-y divide-input">
                <PreviewRow label="Biển số" value={parsed.plate} highlight />
                <PreviewRow label="Hãng xe" value={parsed.brand || "—"} />
                <PreviewRow label="Dòng xe" value={parsed.model || "—"} />
                <PreviewRow
                  label="Dịch vụ"
                  value={
                    matchedService
                      ? matchedService.serviceName
                      : parsed.service
                        ? `"${parsed.service}" — không khớp`
                        : "—"
                  }
                  status={matchedService ? "ok" : parsed.service ? "warn" : undefined}
                />
                <PreviewRow label="Nhân viên" value={parsed.staff || "—"} />
              </div>

              {/* Service picker if no match */}
              {!matchedService && parsed.service && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowServicePicker((v) => !v)}
                    className="flex items-center gap-1.5 text-sm text-primary font-medium"
                  >
                    Chọn dịch vụ thủ công
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showServicePicker ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showServicePicker && (
                    <div className="rounded-xl border border-input bg-background overflow-hidden max-h-48 overflow-y-auto">
                      {allServices.map((s) => (
                        <button
                          key={s.serviceCode}
                          onClick={() => {
                            setMatchedService(s);
                            setShowServicePicker(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent border-b border-input last:border-0"
                        >
                          {s.serviceName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fill form button */}
              <button
                onClick={handleFillForm}
                className="w-full h-13 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform py-3.5"
              >
                <CheckCircle2 className="h-5 w-5" />
                Điền vào form
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helper sub-component ─────────────────────────────────────────────────────

function PreviewRow({
  label,
  value,
  highlight,
  status,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  status?: "ok" | "warn";
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-3">
      <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-right truncate ${
          highlight ? "text-primary" : "text-foreground"
        } ${status === "warn" ? "text-amber-600 dark:text-amber-400" : ""}`}
      >
        {status === "ok" && (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 inline mr-1" />
        )}
        {status === "warn" && (
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 inline mr-1" />
        )}
        {value}
      </span>
    </div>
  );
}
