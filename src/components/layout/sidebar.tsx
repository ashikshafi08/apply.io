"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  User,
  FileText,
  Search,
  Settings,
  LogOut,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Search Jobs",
    href: "/search",
    icon: Search,
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    href: "/applications",
    icon: FileText,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/60 bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Compass className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Apply.io</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && [
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                      "shadow-sm",
                    ]
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="border-t border-border/60 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && [
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                      "shadow-sm",
                    ]
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-3 bg-border/60" />

        {/* User section */}
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-9 w-9 ring-2 ring-background">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              N
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User</p>
            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
