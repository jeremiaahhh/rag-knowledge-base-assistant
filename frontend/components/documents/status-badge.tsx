import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/lib/types";

const LABELS: Record<DocumentStatus, string> = {
  uploaded: "Uploaded",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

const VARIANTS: Record<DocumentStatus, "success" | "warning" | "info" | "destructive"> = {
  uploaded: "info",
  processing: "warning",
  ready: "success",
  failed: "destructive",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
