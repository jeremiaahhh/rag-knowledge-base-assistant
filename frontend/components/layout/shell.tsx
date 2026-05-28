import { Sidebar } from "./sidebar";
import { TopNav } from "./topnav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg flex h-full min-h-screen w-full">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
