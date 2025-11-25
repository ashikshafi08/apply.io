"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} description={description} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
