"use client";

import Image from "next/image";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

const CITATION_RE = /\[(\d{1,2})\]/g;

function renderWithCitations(text: string) {
  const parts: Array<string | { citation: number }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CITATION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ citation: Number(match[1]) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.map((part, idx) =>
    typeof part === "string" ? (
      <span key={idx}>{part}</span>
    ) : (
      <span key={idx} className="citation-pill">
        {part.citation}
      </span>
    ),
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-card text-muted-foreground shadow-sm",
          isUser ? "border-primary/30 text-primary" : "border-border",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm border bg-card",
          message.pending && "opacity-70",
        )}
      >
        {message.pending ? (
          <div className="flex items-center gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {isUser ? message.content : renderWithCitations(message.content)}
          </div>
        )}
      </div>
    </div>
  );
}
