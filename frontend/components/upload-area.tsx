"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { CloudUpload, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api, ApiError } from "@/lib/api";
import { cn, formatBytes } from "@/lib/utils";
import type { DocumentRead } from "@/lib/types";

interface UploadAreaProps {
  onUploaded?: (doc: DocumentRead) => void;
}

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "text/markdown": [".md", ".markdown"],
};

const MAX_BYTES = 25 * 1024 * 1024;

export function UploadArea({ onUploaded }: UploadAreaProps) {
  const [uploading, setUploading] = useState(false);
  const [activeName, setActiveName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const reason = rejected[0]?.errors[0]?.message ?? "File type not supported.";
        toast.error("Upload rejected", { description: reason });
        return;
      }
      if (accepted.length === 0) return;

      setUploading(true);
      try {
        for (const file of accepted) {
          setActiveName(file.name);
          try {
            const doc = await api.uploadDocument(file);
            toast.success("Document ingested", {
              description: `${doc.filename} → ${doc.chunk_count} chunks`,
            });
            onUploaded?.(doc);
          } catch (err) {
            const message =
              err instanceof ApiError ? err.message : "Upload failed unexpectedly.";
            toast.error(`Failed: ${file.name}`, { description: message });
          }
        }
      } finally {
        setUploading(false);
        setActiveName(null);
      }
    },
    [onUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_BYTES,
    multiple: true,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/40 px-6 py-14 text-center transition-all hover:border-primary/60 hover:bg-card",
        isDragActive && "border-primary bg-primary/5 ring-4 ring-primary/15",
        uploading && "pointer-events-none opacity-90",
      )}
    >
      <input {...getInputProps()} />

      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-sky-400/15 text-primary shadow-inner ring-1 ring-primary/20">
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <CloudUpload className="h-6 w-6" />
        )}
      </div>

      <h3 className="text-base font-semibold">
        {uploading
          ? `Uploading${activeName ? ` ${activeName}` : ""}…`
          : isDragActive
            ? "Drop your files here"
            : "Drag & drop documents to ingest"}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        Accepts <span className="font-medium text-foreground">PDF</span>,{" "}
        <span className="font-medium text-foreground">TXT</span>, and{" "}
        <span className="font-medium text-foreground">Markdown</span>. Up to{" "}
        {formatBytes(MAX_BYTES, 0)} per file.
      </p>
      <button
        type="button"
        className="mt-5 inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
        onClick={(e) => e.preventDefault()}
      >
        <FileUp className="h-4 w-4" />
        Browse files
      </button>
    </div>
  );
}
