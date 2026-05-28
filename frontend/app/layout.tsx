import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { AppShell } from "@/components/layout/shell";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "RAG Knowledge Base Assistant",
    template: "%s · RAG Knowledge Base Assistant",
  },
  description:
    "Upload PDFs, Markdown, and text files; ask questions and get answers with source citations from your own knowledge base.",
  applicationName: "RAG Knowledge Base Assistant",
  keywords: [
    "Retrieval-Augmented Generation",
    "RAG",
    "ChromaDB",
    "FastAPI",
    "Next.js",
    "Vector search",
    "AI assistant",
  ],
  openGraph: {
    title: "RAG Knowledge Base Assistant",
    description: "RAG dashboard with source-grounded answers.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider delayDuration={150}>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="bottom-right" closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
