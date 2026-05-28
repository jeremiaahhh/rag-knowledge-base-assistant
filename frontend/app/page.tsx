"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Database,
  FileText,
  MessageSquareText,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/documents/status-badge";
import { UploadArea } from "@/components/upload-area";
import { api } from "@/lib/api";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import type { DocumentRead } from "@/lib/types";

export default function DashboardPage() {
  const [docs, setDocs] = useState<DocumentRead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const result = await api.listDocuments();
      setDocs(result.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
      setDocs([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalChunks = (docs ?? []).reduce((sum, d) => sum + d.chunk_count, 0);
  const totalBytes = (docs ?? []).reduce((sum, d) => sum + d.size_bytes, 0);
  const ready = (docs ?? []).filter((d) => d.status === "ready").length;
  const latest = docs?.[0]?.updated_at;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Turn your documents into a searchable assistant.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Upload PDFs, Markdown, or text files. Ask questions and get answers
              grounded in your own knowledge base — with source citations on every
              response.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/chat">
                  Open chat <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/documents">Manage documents</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Stat icon={FileText} label="Documents" value={docs?.length ?? "—"} loading={!docs} />
            <Stat icon={Boxes} label="Chunks" value={totalChunks || "—"} loading={!docs} />
            <Stat icon={Database} label="Indexed size" value={formatBytes(totalBytes)} loading={!docs} />
            <Stat
              icon={Timer}
              label="Last activity"
              value={latest ? formatRelativeTime(latest) : "—"}
              loading={!docs}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Quick upload</CardTitle>
            <CardDescription>
              Drop files here to ingest them into the knowledge base. They&apos;re
              chunked, embedded, and indexed automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadArea onUploaded={() => load()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              {ready === 0
                ? "Three steps to a working demo."
                : "Try a few of these to see the citation panel in action."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Step
              done={ready > 0}
              n={1}
              title="Upload at least one document"
              caption="Use the dropzone, or run scripts/seed.sh for sample data."
            />
            <Step
              done={false}
              n={2}
              title="Ask a question in chat"
              caption="The assistant will cite the chunks it used to answer."
              href="/chat"
            />
            <Step
              done={false}
              n={3}
              title="Switch to a real model"
              caption="Set USE_MOCK_AI=false and add OPENAI_API_KEY in backend/.env."
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Recent documents</h3>
            <p className="text-xs text-muted-foreground">
              The five most recently ingested files.
            </p>
          </div>
          <Link
            href="/documents"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {error}
            </CardContent>
          </Card>
        ) : !docs ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : docs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">No documents yet</div>
                <div className="text-sm text-muted-foreground">
                  Upload one above to get started.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Document</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Chunks</th>
                  <th className="px-5 py-3 font-medium">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {docs.slice(0, 5).map((doc) => (
                  <tr key={doc.id} className="border-t hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{doc.filename}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-5 py-3 tabular-nums">{doc.chunk_count}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatRelativeTime(doc.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-muted/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Ready to ask?</CardTitle>
                <CardDescription>
                  Jump into chat to query the knowledge base.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/chat">
                Open chat <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-background/70 px-4 py-3 shadow-sm transition-colors hover:bg-background">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">
        {loading ? <Skeleton className="h-6 w-16" /> : value}
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  caption,
  href,
  done,
}: {
  n: number;
  title: string;
  caption: string;
  href?: string;
  done: boolean;
}) {
  const body = (
    <div className="flex items-start gap-3 rounded-lg border bg-background/50 p-3 transition hover:bg-background">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          done
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
            : "bg-primary/10 text-primary"
        }`}
      >
        {n}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium leading-tight">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{caption}</div>
      </div>
      {href ? <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" /> : null}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
