"use client";

import { FileText } from "lucide-react";

import type { Citation } from "@/lib/types";

interface SourceCitationCardProps {
  index: number;
  citation: Citation;
}

export function SourceCitationCard({ index, citation }: SourceCitationCardProps) {
  const pct = Math.round(citation.score * 100);
  return (
    <div className="group rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
            {index}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium leading-tight">
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{citation.document_name || "Unknown"}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Chunk #{citation.chunk_index}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Match
          </div>
          <div className="text-sm font-semibold tabular-nums">{pct}%</div>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
        {citation.text}
      </p>
    </div>
  );
}
