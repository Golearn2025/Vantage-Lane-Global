"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${origin}/auth/callback?next=/login` },
      );
      if (resetErr) throw resetErr;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,_hsl(36_42%_58%_/_0.13),_transparent_60%),radial-gradient(ellipse_at_80%_100%,_hsl(36_42%_58%_/_0.08),_transparent_60%),hsl(var(--background))]" />

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Vantage Lane" width={56} height={56} />
          <div className="text-center">
            <p className="font-display text-2xl tracking-widest text-foreground">
              VANTAGE LANE
            </p>
            <p className="mt-0.5 text-xs tracking-wider text-muted-foreground uppercase">
              Reset password
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur">
          {done ? (
            <>
              <h1 className="mb-2 text-xl font-semibold">Check your email</h1>
              <p className="mb-5 text-sm text-muted-foreground">
                If an account exists for that address, we sent a reset link.
              </p>
              <Button asChild className="w-full rounded-full" size="lg">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-semibold">Forgot password</h1>
              <p className="mb-5 text-sm text-muted-foreground">
                We’ll email you a branded reset link.
              </p>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                {error ? (
                  <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                    {error}
                  </p>
                ) : null}
                <Button
                  className="w-full rounded-full"
                  size="lg"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Send reset link →"}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="underline underline-offset-2">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
