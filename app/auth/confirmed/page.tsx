import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function EmailConfirmedPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,_hsl(36_42%_58%_/_0.13),_transparent_60%),radial-gradient(ellipse_at_80%_100%,_hsl(36_42%_58%_/_0.08),_transparent_60%),hsl(var(--background))]" />

      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Vantage Lane" width={56} height={56} />
          <div>
            <p className="font-display text-2xl tracking-widest text-foreground">
              VANTAGE LANE
            </p>
            <p className="mt-0.5 text-xs tracking-wider text-muted-foreground uppercase">
              Partner Network
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-semibold">Email verified</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Your email address has been confirmed. Sign in to continue setting
            up your partner account.
          </p>

          <Button asChild size="lg" className="w-full rounded-full">
            <Link href="/login?next=/join/setup">Sign in and continue →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
