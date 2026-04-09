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
    <aside className="glass hidden w-72 shrink-0 rounded-3xl border border-border/80 p-4 shadow-[0_18px_40px_rgba(5,20,34,0.2)] ring-1 ring-white/25 lg:block dark:ring-emerald-300/10">
      <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/18 via-accent/14 to-cyan-500/12 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.24em] text-primary">Workspace</p>
        <h2 className="mt-2 text-lg font-semibold">Care Collaboration Hub</h2>
        <p className="mt-2 text-[12px] leading-5 text-muted-foreground">Signed in as {role || "member"}</p>
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
                active
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_10px_24px_rgba(5,150,105,0.28)]"
                  : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-border/80 bg-background/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
        <div className="flex items-start gap-3">
          <Users className="mt-1 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">Cross-network sync active</p>
            <p className="text-[12px] leading-5 text-muted-foreground">Records stream updates in real-time-like polling</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
