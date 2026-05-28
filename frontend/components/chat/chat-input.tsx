"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function send() {
    const q = value.trim();
    if (!q || disabled) return;
    onSubmit(q);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask anything about your documents… (Shift+Enter for newline)"
        rows={2}
        disabled={disabled}
        className="min-h-[60px] resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex items-center justify-between pt-2">
        <p className="px-2 text-xs text-muted-foreground">
          Answers cite source passages from your knowledge base.
        </p>
        <Button onClick={send} disabled={disabled || !value.trim()} size="sm">
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
