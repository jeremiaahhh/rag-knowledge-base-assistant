"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ChatEmptyState } from "@/components/chat/empty-state";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble, type ChatMessage } from "@/components/chat/message-bubble";
import { SourceCitationCard } from "@/components/chat/source-citation-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, ApiError } from "@/lib/api";
import type { ChatResponse } from "@/lib/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latest, setLatest] = useState<ChatResponse | null>(null);
  const [hasDocuments, setHasDocuments] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .listDocuments()
      .then((d) => setHasDocuments(d.total > 0))
      .catch(() => setHasDocuments(false));
  }, []);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, pending]);

  const ask = useCallback(async (question: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };
    const placeholderId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      userMsg,
      { id: placeholderId, role: "assistant", content: "", pending: true },
    ]);
    setPending(true);

    try {
      const response = await api.chat(question);
      setLatest(response);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === placeholderId
            ? { ...msg, content: response.answer, pending: false }
            : msg,
        ),
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Chat failed.";
      toast.error("Chat failed", { description: message });
      setMessages((m) =>
        m.map((msg) =>
          msg.id === placeholderId
            ? {
                ...msg,
                content:
                  "Sorry — I couldn't reach the backend to answer that. Try again in a moment.",
                pending: false,
              }
            : msg,
        ),
      );
    } finally {
      setPending(false);
    }
  }, []);

  const showEmpty = messages.length === 0;

  return (
    <div className="mx-auto grid h-[calc(100vh-9rem)] max-w-7xl gap-6 lg:grid-cols-[1fr_380px]">
      <section className="flex min-h-0 flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{messages.length === 0 ? "New conversation" : `${Math.ceil(messages.length / 2)} exchange${messages.length > 2 ? "s" : ""}`}</span>
          </div>
          {latest ? (
            <Badge variant={latest.used_mock ? "info" : "success"}>
              {latest.used_mock ? "Mock answer" : "Live answer"} ·{" "}
              {(latest.confidence * 100).toFixed(0)}% confidence
            </Badge>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div
            ref={threadRef}
            className="scrollbar-thin flex-1 overflow-y-auto px-4 py-5 sm:px-6"
          >
            {showEmpty ? (
              <ChatEmptyState
                hasDocuments={hasDocuments ?? false}
                onSuggest={(q) => ask(q)}
              />
            ) : (
              <div className="space-y-5">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t bg-background/40 p-4">
            <ChatInput onSubmit={ask} disabled={pending} />
          </div>
        </div>
      </section>

      <aside className="hidden min-h-0 flex-col lg:flex">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Sources</h3>
            <p className="text-xs text-muted-foreground">
              Top retrieved passages, with similarity scores
            </p>
          </div>
          {latest?.citations.length ? (
            <span className="text-[11px] text-muted-foreground">
              {latest.citations.length} chunk{latest.citations.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
          <ScrollArea className="flex-1 p-3">
            {pending ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : latest && latest.citations.length > 0 ? (
              <div className="space-y-3">
                {latest.citations.map((c, i) => (
                  <SourceCitationCard
                    key={`${c.document_id}-${c.chunk_index}`}
                    index={i + 1}
                    citation={c}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">No sources yet</div>
                <div className="max-w-xs text-xs text-muted-foreground">
                  Ask a question — retrieved chunks will appear here with similarity
                  scores.
                </div>
              </div>
            )}
          </ScrollArea>

          {latest && latest.source_documents.length > 0 ? (
            <div className="border-t bg-muted/30 p-3 text-xs">
              <div className="mb-1.5 flex items-center gap-1.5 font-medium text-muted-foreground">
                <Info className="h-3 w-3" />
                Source documents
              </div>
              <div className="flex flex-wrap gap-1.5">
                {latest.source_documents.map((name) => (
                  <Badge key={name} variant="secondary" className="font-normal">
                    <FileText className="mr-1 h-3 w-3" />
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
