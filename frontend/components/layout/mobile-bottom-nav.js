"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Clock3, Home, MessageCircle, ShieldCheck, UploadCloud, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const links = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/timeline", label: "Timeline", icon: Clock3 },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/upload-record", label: "Upload", icon: UploadCloud },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const visible = links.filter((item) => {
    if (item.href === "/admin") {
      return user?.role === "admin";
    }

    if (item.href === "/upload-record") {
      return user?.role === "hospital" || user?.role === "admin";
    }

    if (item.href === "/timeline") {
      return user?.role === "patient" || user?.role === "admin";
    }

    return true;
  });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {visible.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center rounded-xl px-2 py-2 text-[12px] font-medium leading-none tracking-[0.01em] transition",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="mb-1 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
