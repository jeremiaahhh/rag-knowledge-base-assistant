"use client";

import { FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/documents/status-badge";
import { api, ApiError } from "@/lib/api";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import type { DocumentRead } from "@/lib/types";

interface DocumentTableProps {
  documents: DocumentRead[];
  onDeleted: (id: string) => void;
}

export function DocumentTable({ documents, onDeleted }: DocumentTableProps) {
  async function handleDelete(doc: DocumentRead) {
    try {
      await api.deleteDocument(doc.id);
      onDeleted(doc.id);
      toast.success("Document removed", { description: doc.filename });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to delete document.";
      toast.error("Delete failed", { description: message });
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">Document</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Chunks</th>
            <th className="px-5 py-3 font-medium">Size</th>
            <th className="px-5 py-3 font-medium">Uploaded</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-t transition-colors hover:bg-muted/30">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium leading-tight">{doc.filename}</div>
                    <div className="text-xs text-muted-foreground">
                      {doc.content_type || "unknown type"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={doc.status} />
                {doc.status === "failed" && doc.error_message ? (
                  <div className="mt-1 max-w-xs truncate text-xs text-destructive">
                    {doc.error_message}
                  </div>
                ) : null}
              </td>
              <td className="px-5 py-4 tabular-nums">{doc.chunk_count}</td>
              <td className="px-5 py-4 tabular-nums">{formatBytes(doc.size_bytes)}</td>
              <td className="px-5 py-4 text-muted-foreground">
                {formatRelativeTime(doc.created_at)}
              </td>
              <td className="px-5 py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Row actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(doc)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
