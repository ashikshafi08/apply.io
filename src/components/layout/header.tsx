"use client";

import { Bell, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

interface HeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title, description, breadcrumbs }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/60 bg-background/95 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Title section */}
        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-0.5">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1.5">
                  {index > 0 && <ChevronRight className="h-3 w-3" />}
                  <span className={crumb.href ? "hover:text-foreground cursor-pointer transition-colors" : ""}>
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full transition-all hover:ring-2 hover:ring-border"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  U
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
