"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Mail } from "lucide-react";

export function JoinCheckEmail() {
  const params = useSearchParams();
  const email = params.get("email");

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,_hsl(36_42%_58%_/_0.13),_transparent_60%),radial-gradient(ellipse_at_80%_100%,_hsl(36_42%_58%_/_0.08),_transparent_60%),hsl(var(--background))]" />

      <div className="w-full max-w-md">
        {/* Logo + brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Vantage Lane" width={56} height={56} />
          <div className="text-center">
            <p className="font-display text-2xl tracking-widest text-foreground">
              VANTAGE LANE
            </p>
            <p className="mt-0.5 text-xs tracking-wider text-muted-foreground uppercase">
              Partner Network
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-xl">
          <CardHeader className="pb-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link
              {email ? (
                <>
                  {" "}
                  to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </>
              ) : null}
              . Open it to verify your address, then continue setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder. The link expires
              in 24 hours.
            </p>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
