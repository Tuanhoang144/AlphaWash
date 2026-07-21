"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

import { QuoteBuilder } from "../components/QuoteBuilder";
import { useQuoteService } from "@/services/useQuoteService";
import type { Quote } from "@/types/Quote";

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getQuoteById } = useQuoteService();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getQuoteById(id)
      .then(setQuote)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id, getQuoteById]);

  return (
    <SidebarInset className="relative w-full">
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/quotes">Báo Giá</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {quote?.quoteCode ?? id}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-6 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Đang tải...</span>
          </div>
        ) : error || !quote ? (
          <div className="text-center py-16 text-muted-foreground">
            Không tìm thấy báo giá.
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-3">
              <h1 className="text-2xl font-bold">Báo giá {quote.quoteCode}</h1>
            </div>
            <QuoteBuilder initialQuote={quote} />
          </>
        )}
      </div>
    </SidebarInset>
  );
}
