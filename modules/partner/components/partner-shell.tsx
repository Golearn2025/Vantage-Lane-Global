"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Anchor,
  Building2,
  Car,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartPulse,
  Home,
  LogOut,
  MapPin,
  Menu,
  Pencil,
  Plane,
  PoundSterling,
  Shield,
  Sparkles,
  Star,
  Tv2,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { signOut, useSessionProfile } from "@/modules/identity/session";
import { useQuery } from "@tanstack/react-query";
import { fetchPartnerOrgContext, fetchServiceTypeConfig } from "@/modules/partner/api";
import { useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { RelationshipStatusBadge } from "@/shared/components/status-badges";

/* ─── Icon maps ─────────────────────────────────────────────── */

const STEP_ICONS: Record<string, React.ElementType> = {
  profile: Home,
  documents: FileText,
  fleet: Car,
  rates: PoundSterling,
  aircraft: Plane,
  operatives: Users,
  security_services: Shield,
  properties: Star,
  specialisations: Sparkles,
  availability: MapPin,
  coverage: MapPin,
  vessels: Anchor,
  services: HeartPulse,
  capabilities: Tv2,
  review: CheckSquare,
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  GROUND_TRANSPORTATION: Car,
  AVIATION: Plane,
  SECURITY: Shield,
  HOSPITALITY: Star,
  CONCIERGE: Sparkles,
  YACHT: Anchor,
  MEDICAL: HeartPulse,
  EVENTS: Tv2,
};

const SERVICE_LABELS: Record<string, string> = {
  GROUND_TRANSPORTATION: "Ground Transportation",
  AVIATION: "Aviation",
  SECURITY: "Security",
  HOSPITALITY: "Hospitality",
  CONCIERGE: "Concierge",
  YACHT: "Yacht & Marine",
  MEDICAL: "Medical & Wellness",
  EVENTS: "Events & Protocol",
};

/* ─── Nav builder ───────────────────────────────────────────── */

type NavItem = { href: string; label: string; icon: React.ElementType; exact?: boolean };

const STEP_ROUTES: Record<string, string> = {
  documents: "/partner/documents",
  fleet: "/partner/fleet",
  rates: "/partner/rates",
  aircraft: "/partner/aircraft",
  operatives: "/partner/operatives",
  security_services: "/partner/security-services",
  properties: "/partner/properties",
  specialisations: "/partner/specialisations",
  availability: "/partner/coverage",
  coverage: "/partner/coverage",
  vessels: "/partner/vessels",
  services: "/partner/services",
  capabilities: "/partner/capabilities",
};

function buildNavItems(wizardSteps: { key: string; label: string }[]): NavItem[] {
  const items: NavItem[] = [{ href: "/partner", label: "Home", icon: Home, exact: true }];
  const added = new Set(["/partner"]);
  for (const step of wizardSteps) {
    if (step.key === "profile" || step.key === "review") continue;
    const href = STEP_ROUTES[step.key];
    if (href && !added.has(href)) {
      added.add(href);
      items.push({ href, label: step.label, icon: STEP_ICONS[step.key] ?? FileText });
    }
  }
  if (!added.has("/partner/documents")) {
    items.push({ href: "/partner/documents", label: "Documents", icon: FileText });
  }
  return items;
}

/* ─── Avatar component ──────────────────────────────────────── */

function OrgAvatar({
  logoUrl,
  displayName,
  size = 32,
  className,
}: {
  logoUrl?: string | null;
  displayName?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = (displayName ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={displayName ?? "Logo"}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

/* ─── Profile dropdown ──────────────────────────────────────── */

function ProfileMenu({
  email,
  displayName,
  logoUrl,
  onSignOut,
}: {
  email?: string;
  displayName?: string;
  logoUrl?: string | null;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border/60 bg-card/80 py-1 pl-1 pr-3 text-sm transition-colors hover:bg-card"
        aria-expanded={open}
      >
        <OrgAvatar logoUrl={logoUrl} displayName={displayName} size={28} />
        <span className="hidden max-w-[120px] truncate text-xs font-medium md:block">
          {displayName ?? email}
        </span>
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-border/60 bg-card shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
              <OrgAvatar logoUrl={logoUrl} displayName={displayName} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{displayName ?? "Partner"}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link
                href="/partner/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                My profile
              </Link>
              <Link
                href="/partner/profile#company"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company details
              </Link>
              <Link
                href="/partner/profile#logo"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
                Upload logo
              </Link>
            </div>

            <div className="border-t border-border/60 p-1.5">
              <button
                type="button"
                onClick={() => { setOpen(false); onSignOut(); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/8"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Nav links ─────────────────────────────────────────────── */

function NavLinks({
  navItems,
  collapsed,
  onNavigate,
  className,
}: {
  navItems: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              collapsed ? "justify-center" : "",
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Main shell ────────────────────────────────────────────── */

export function PartnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useSessionProfile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const org = useQuery({ queryKey: ["partner", "org"], queryFn: fetchPartnerOrgContext });
  const serviceCode = org.data?.serviceCode ?? "GROUND_TRANSPORTATION";

  const configQ = useQuery({
    queryKey: ["partner", "service-config", serviceCode],
    queryFn: () => fetchServiceTypeConfig(serviceCode),
    enabled: Boolean(org.data),
  });

  const navItems = buildNavItems(configQ.data?.wizardSteps ?? []);
  const ServiceIcon = SERVICE_ICONS[serviceCode] ?? Car;

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const logoUrl = org.data?.logoUrl ?? null;
  const displayName = org.data?.displayName;
  const email = profile.data?.email;

  return (
    <div className="min-h-dvh bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,_hsl(36_42%_58%_/_0.06),_transparent_50%),hsl(var(--background))]" />

      <div className="flex min-h-dvh">
        {/* ── Desktop sidebar ─────────────────────────────────── */}
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border/60 bg-background/90 backdrop-blur transition-all duration-200 md:flex",
            collapsed ? "w-14 px-2 py-4" : "w-52 px-3 py-4",
          )}
        >
          {/* Logo */}
          <div className={cn("mb-5 flex items-center", collapsed ? "justify-center" : "gap-2 px-1")}>
            <Image src="/logo.png" alt="VL" width={28} height={28} className="shrink-0" />
            {!collapsed && (
              <div>
                <p className="font-display text-xs font-semibold tracking-widest">VANTAGE LANE</p>
                <p className="text-[9px] tracking-widest text-muted-foreground uppercase">Partner</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <NavLinks navItems={navItems} collapsed={collapsed} />

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "mt-4 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed ? "justify-center" : "",
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* Bottom: org avatar + sign out */}
          <div className={cn("mt-auto border-t border-border/60 pt-3", collapsed ? "flex justify-center" : "")}>
            {collapsed ? (
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="rounded-full transition-opacity hover:opacity-70"
              >
                <OrgAvatar logoUrl={logoUrl} displayName={displayName} size={32} />
              </button>
            ) : (
              <div className="space-y-2 px-1">
                <div className="flex items-center gap-2">
                  <OrgAvatar logoUrl={logoUrl} displayName={displayName} size={28} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{displayName}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{email}</p>
                  </div>
                </div>
                <Link
                  href="/partner/profile"
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3 w-3" />
                  Edit profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-danger transition-colors hover:bg-danger/8"
                >
                  <LogOut className="h-3 w-3" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main area ────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/60 bg-background/90 px-4 py-2.5 backdrop-blur">
            {/* Left: mobile menu + org name */}
            <div className="flex items-center gap-2 min-w-0">
              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-full flex-col px-3 py-4">
                    <SheetHeader className="mb-5">
                      <SheetTitle className="flex items-center gap-2 text-left">
                        <Image src="/logo.png" alt="VL" width={24} height={24} />
                        <span className="font-display text-xs tracking-widest">VANTAGE LANE</span>
                      </SheetTitle>
                    </SheetHeader>
                    <NavLinks navItems={navItems} onNavigate={() => setMobileOpen(false)} />
                    <div className="mt-auto border-t border-border/60 pt-3 space-y-1">
                      <Link
                        href="/partner/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => { setMobileOpen(false); handleSignOut(); }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-danger hover:bg-danger/8"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Org name + service */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-none">
                  {displayName ?? "Partner"}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ServiceIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{SERVICE_LABELS[serviceCode] ?? serviceCode}</span>
                  {org.data?.relationshipStatus && (
                    <RelationshipStatusBadge status={org.data.relationshipStatus as never} />
                  )}
                </div>
              </div>
            </div>

            {/* Right: profile pill */}
            <ProfileMenu
              email={email ?? undefined}
              displayName={displayName}
              logoUrl={logoUrl}
              onSignOut={handleSignOut}
            />
          </header>

          {/* Content */}
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28 md:pb-8">
            {children}
          </main>

          {/* Mobile bottom nav */}
          <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
            <div className="flex items-stretch justify-around px-1 py-2">
              {navItems.slice(0, 5).map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active && "text-primary")} />
                    <span className="leading-none">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
