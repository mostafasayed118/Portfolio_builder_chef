"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useDirection } from "@/hooks/useDirection";

type Props = {
  title: string;
};

export function AdminTopbar({ title }: Props) {
  const { username } = useAdminAuth();
  const { isRTL } = useDirection();
  const initial = username?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="shrink-0" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side={isRTL ? "right" : "left"} className="p-0 w-72">
          <AdminSidebar />
        </SheetContent>
      </Sheet>
      <h1 className="text-lg font-semibold text-foreground flex-1 truncate">
        {title}
      </h1>
      <Avatar className="h-8 w-8 shrink-0 border border-border/50">
        <AvatarFallback className="bg-accent/10 text-accent text-xs">
          {initial}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
