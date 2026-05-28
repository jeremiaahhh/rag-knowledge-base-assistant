"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";

export function ResetDialog({ onReset }: { onReset: () => void }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleReset() {
    setBusy(true);
    try {
      const result = await api.resetKnowledgeBase();
      toast.success("Knowledge base reset", {
        description: `Removed ${result.deleted_documents} documents · ${result.deleted_chunks} chunks`,
      });
      onReset();
      setOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Reset failed.";
      toast.error("Reset failed", { description: message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Reset knowledge base
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>Reset the knowledge base?</DialogTitle>
          <DialogDescription>
            This will remove all documents, their vector embeddings, and any
            uploaded files. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={busy}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleReset} disabled={busy}>
            {busy ? "Resetting…" : "Reset everything"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
