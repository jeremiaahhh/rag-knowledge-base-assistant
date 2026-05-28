"use client";

import Link from "next/link";
import { ArrowRight, MessageCircleQuestion, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChatEmptyStateProps {
  hasDocuments: boolean;
  onSuggest: (q: string) => void;
}

const SUGGESTIONS = [
  "Summarize the engineering on-call process.",
  "What are the pricing tiers and what does each include?",
  "What's the company policy on remote work?",
  "How does the runbook escalate severity 1 issues?",
];

export function ChatEmptyState({ hasDocuments, onSuggest }: ChatEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center sm:px-8">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-sky-400/15 text-primary shadow-inner ring-1 ring-primary/20">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        {hasDocuments ? "Ask your knowledge base anything" : "Your knowledge base is empty"}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {hasDocuments
          ? "Type a question below. Answers include numbered citations linked to the source passages on the right."
          : "Upload a few PDFs, Markdown notes, or text files to get started. Then come back here to ask questions."}
      </p>

      {hasDocuments ? (
        <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => onSuggest(q)}
              className="group flex items-center justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3 text-left text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow"
            >
              <span className="flex items-start gap-2">
                <MessageCircleQuestion className="mt-0.5 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                <span>{q}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          ))}
        </div>
      ) : (
        <Button asChild className="mt-6">
          <Link href="/documents">
            <Upload className="mr-1.5 h-4 w-4" />
            Upload documents
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
