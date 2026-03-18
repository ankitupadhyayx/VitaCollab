"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/login");
    setMobileOpen(false);
  };

  const marketingLinks = [
    { href: "/about", label: "About" },
    { href: "/features", label: "Features" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" }
  ];

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/timeline", label: "Timeline" },
    { href: "/upload-record", label: "Upload" },
    { href: "/notifications", label: "Alerts" }
  ];

  const visibleLinks = links.filter((link) => {
    if (link.href === "/upload-record") {
      return user?.role === "hospital" || user?.role === "admin";
    }
    if (link.href === "/timeline") {
      return user?.role === "patient" || user?.role === "admin";
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">VitaCollab</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {marketingLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
          {visibleLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden rounded-full bg-muted px-2 py-1 text-xs capitalize text-muted-foreground sm:inline">{user?.role}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="secondary" size="sm" className="hidden sm:inline-flex">Sign In</Button></Link>
              <Link href="/signup"><Button size="sm">Get Started</Button></Link>
            </>
          )}
          <Button variant="ghost" size="sm" className="md:hidden" aria-label="Open menu" onClick={() => setMobileOpen((value) => !value)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border/70 bg-background p-3 md:hidden">
          <nav className="space-y-1">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
