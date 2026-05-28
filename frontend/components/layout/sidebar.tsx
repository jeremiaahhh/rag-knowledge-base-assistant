"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  MessageSquareText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquareText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { health } = useBackendStatus();
  const mockMode = health?.mock_ai ?? true;
  const version = health?.version;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card/60 md:backdrop-blur">
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <Image
          src="/logo.png"
          alt="RAG Assistant logo"
          width={36}
          height={36}
          priority
          className="h-9 w-9 rounded-lg shadow-sm ring-1 ring-border"
        />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">RAG Assistant</div>
          <div className="text-[11px] text-muted-foreground">Knowledge Base</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground/80 group-hover:text-foreground",
                )}
              />
              <span>{label}</span>
              {active ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t p-4">
        <div className="rounded-lg border bg-background/60 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Mode</span>
            {mockMode ? (
              <Badge variant="info">Mock</Badge>
            ) : (
              <Badge variant="success">Live</Badge>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {mockMode
              ? "Running without an API key. Flip USE_MOCK_AI=false and provide an OPENAI_API_KEY for live model answers."
              : "Connected to OpenAI. Real model-generated answers are enabled."}
          </p>
        </div>
        {version ? (
          <div className="flex items-center justify-between px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Build</span>
            <span className="font-mono">v{version}</span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
