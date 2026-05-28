"use client";

import { usePathname } from "next/navigation";
import { Github, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { cn } from "@/lib/utils";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle: "Overview, quick upload, and recent activity",
  },
  "/documents": {
    title: "Documents",
    subtitle: "Manage the documents indexed in your knowledge base",
  },
  "/chat": {
    title: "Chat",
    subtitle: "Ask questions and inspect retrieved source passages",
  },
};

export function TopNav() {
  const pathname = usePathname();
  const { status } = useBackendStatus();
  const { setTheme, resolvedTheme } = useTheme();

  const meta = TITLES[pathname] ?? { title: "RAG Assistant", subtitle: "" };

  const statusColor =
    status === "online"
      ? "bg-emerald-500"
      : status === "offline"
        ? "bg-rose-500"
        : "bg-amber-400";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {meta.title}
        </h1>
        {meta.subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{meta.subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  statusColor,
                  status === "checking" && "animate-pulse",
                )}
              />
              <span className="text-muted-foreground">
                Backend{" "}
                <span className="font-medium text-foreground">
                  {status === "online"
                    ? "online"
                    : status === "offline"
                      ? "offline"
                      : "checking"}
                </span>
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Polls <code>GET /health</code> every 15 s
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              <Github className="h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom">View source</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle theme</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
