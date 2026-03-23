"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, CircleDot, Menu, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { useSharedNotifications } from "@/hooks/use-shared-notifications";
import { useToast } from "@/hooks/use-toast";
import { fetchRecords } from "@/services/record.service";

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { isAuthenticated, logout, user } = useAuth();
  const toast = useToast();
  const debouncedSearch = useDebounce(searchInput, 350);
  const isSearchingRef = useRef(false);

  const {
    notifications,
    unreadCount,
    markRead
  } = useSharedNotifications({
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 60000 : false,
    refetchIntervalInBackground: false
  });

  useEffect(() => {
    if (!isAuthenticated || !debouncedSearch.trim()) {
      setSearchResults([]);
      setSearchPanelOpen(false);
      return;
    }

    let mounted = true;

    const run = async () => {
      if (isSearchingRef.current) {
        return;
      }

      try {
        isSearchingRef.current = true;
        const response = await fetchRecords({ search: debouncedSearch.trim(), limit: 8, page: 1 });
        const records = response?.data?.records || [];
        const parsed = records.filter((item) => {
          const normalizedDate = new Date(item.recordDate || item.createdAt).toLocaleDateString();
          const q = debouncedSearch.toLowerCase();
          return normalizedDate.toLowerCase().includes(q) || `${item.type} ${item.hospitalName} ${item.description}`.toLowerCase().includes(q);
        });

        if (mounted) {
          setSearchResults(parsed);
          setSearchPanelOpen(true);
        }
      } catch {
        if (mounted) {
          setSearchResults([]);
          setSearchPanelOpen(true);
        }
      } finally {
        isSearchingRef.current = false;
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [debouncedSearch, isAuthenticated]);

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
    { href: "/profile", label: "Profile" },
    { href: "/timeline", label: "Timeline" },
    { href: "/chat", label: "Chat" },
    { href: "/upload-record", label: "Upload" },
    { href: "/scan-patient", label: "Scan" },
    { href: "/notifications", label: "Alerts" }
  ];

  const visibleLinks = links.filter((link) => {
    if (link.href === "/upload-record") {
      return user?.role === "hospital" || user?.role === "admin";
    }

    if (link.href === "/scan-patient") {
      return user?.role === "hospital" || user?.role === "admin";
    }
    if (link.href === "/timeline") {
      return user?.role === "patient" || user?.role === "admin";
    }
    return true;
  });

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
    } catch {
      toast.error("Unable to mark notification as read");
    }
  };

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
            <div className="relative hidden lg:block">
              <div className="relative">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onFocus={() => {
                    if (searchInput.trim()) {
                      setSearchPanelOpen(true);
                    }
                  }}
                  placeholder="Search records, hospitals, type, date"
                  className="h-9 w-80 rounded-xl border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35"
                />
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>

              {searchPanelOpen ? (
                <div className="absolute right-0 top-11 z-40 w-[420px] rounded-2xl border border-border/80 bg-card/95 p-2 shadow-soft">
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Global Search</p>
                  <div className="max-h-80 space-y-1 overflow-auto">
                    {searchResults.length ? (
                      searchResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-full rounded-xl px-2 py-2 text-left hover:bg-muted"
                          onClick={() => {
                            setSearchPanelOpen(false);
                            setSearchInput("");
                            router.push("/timeline");
                          }}
                        >
                          <p className="text-xs font-semibold capitalize text-foreground">{item.type} • {item.hospitalName}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                          <p className="text-[11px] text-muted-foreground">{new Date(item.recordDate || item.createdAt).toLocaleDateString()}</p>
                        </button>
                      ))
                    ) : (
                      <p className="px-2 py-3 text-xs text-muted-foreground">No records found for this query.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {isAuthenticated ? (
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                className="relative"
                aria-label="Open notifications"
                onClick={() => setPanelOpen((value) => !value)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount ? (
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-danger text-[10px] text-danger-foreground">
                    {Math.min(unreadCount, 9)}
                  </span>
                ) : null}
              </Button>

              {panelOpen ? (
                <div className="absolute right-0 top-11 w-[320px] rounded-2xl border border-border/80 bg-card/95 p-2 shadow-soft">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <p className="text-sm font-semibold">Notifications</p>
                    <Link href="/notifications" className="text-xs font-medium text-primary" onClick={() => setPanelOpen(false)}>
                      View all
                    </Link>
                  </div>
                  <div className="max-h-80 space-y-1 overflow-auto">
                    {notifications.slice(0, 6).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full rounded-xl px-2 py-2 text-left hover:bg-muted"
                        onClick={() => handleMarkRead(item.id)}
                      >
                        <p className="text-xs font-semibold capitalize text-foreground">{item.type?.replaceAll("_", " ")}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
                      </button>
                    ))}
                    {!notifications.length ? <p className="px-2 py-4 text-xs text-muted-foreground">No updates yet</p> : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

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
          <div className="mb-3 flex items-center justify-between rounded-xl bg-card/60 p-2">
            <span className="text-xs text-muted-foreground">Live sync</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
              <CircleDot className="h-3 w-3" />
              connected
            </span>
          </div>
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

      <MobileBottomNav />
    </header>
  );
}
