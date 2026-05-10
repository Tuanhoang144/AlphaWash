"use client";

import { useParams } from "next/navigation";
import EditInvoiceContainer from "./EditInvoiceForm";

export default function EditInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  return <EditInvoiceContainer id={id} />;
}
