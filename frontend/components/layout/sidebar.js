"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, FileClock, LayoutDashboard, MessageCircle, ScanLine, Shield, Upload, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/timeline", label: "Timeline", icon: FileClock },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/upload-record", label: "Upload Record", icon: Upload },
  { href: "/scan-patient", label: "Scan Patient", icon: ScanLine },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/admin", label: "Admin", icon: Shield }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role;
  const visibleLinks = links.filter((item) => {
    if (item.href === "/admin") {
      return role === "admin";
    }

    if (item.href === "/scan-patient") {
      return role === "hospital" || role === "admin";
    }
    if (item.href === "/upload-record") {
      return role === "hospital" || role === "admin";
    }

    if (item.href === "/timeline") {
      return role === "patient" || role === "admin";
    }

    return true;
  });

  return (
    <aside className="glass hidden w-72 shrink-0 rounded-3xl p-4 lg:block">
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/20 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Workspace</p>
        <h2 className="mt-2 text-lg font-semibold">Care Collaboration Hub</h2>
        <p className="mt-2 text-xs text-muted-foreground">Signed in as {role || "member"}</p>
      </div>

      <nav className="space-y-1">
        {visibleLinks.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-border/80 bg-background/60 p-4">
        <div className="flex items-start gap-3">
          <Users className="mt-1 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">Cross-network sync active</p>
            <p className="text-xs text-muted-foreground">Records stream updates in real-time-like polling</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
