"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentTable } from "@/components/documents/document-table";
import { ResetDialog } from "@/components/documents/reset-dialog";
import { UploadArea } from "@/components/upload-area";
import { api } from "@/lib/api";
import type { DocumentRead } from "@/lib/types";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      const result = await api.listDocuments();
      setDocs(result.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
      setDocs([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Knowledge base
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload, inspect, and remove the documents that power retrieval.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCcw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
          <ResetDialog onReset={load} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload documents</CardTitle>
          <CardDescription>
            Drag and drop or browse to add PDF, Markdown, or text files. Each file is
            chunked, embedded, and indexed before it appears below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadArea onUploaded={() => load()} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              Indexed documents{docs ? ` · ${docs.length}` : ""}
            </h3>
            <p className="text-xs text-muted-foreground">
              Status reflects the ingestion pipeline. Failed rows show the error inline.
            </p>
          </div>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {error}
            </CardContent>
          </Card>
        ) : !docs ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : docs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">No documents indexed</div>
                <div className="text-sm text-muted-foreground">
                  Upload your first document above to get started.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <DocumentTable
            documents={docs}
            onDeleted={(id) => setDocs((d) => (d ?? []).filter((doc) => doc.id !== id))}
          />
        )}
      </section>
    </div>
  );
}
