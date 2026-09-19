"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/modules/organizations/schemas";
import { signInWithPassword } from "@/modules/identity/session";
import { createClient } from "@/shared/lib/supabase/client";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PasswordInput } from "@/shared/components/password-input";

type FormValues = z.infer<typeof loginSchema>;

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await signInWithPassword(values.email, values.password);
      const supabase = createClient();
      const { data: isPlatform } = await supabase.rpc("is_platform_user");
      const next = searchParams.get("next");

      if (isPlatform) {
        router.replace(next && next !== "/login" ? next : "/organizations");
      } else {
        const { data: membership } = await supabase
          .from("organization_memberships")
          .select("id")
          .eq("status", "ACTIVE")
          .is("archived_at", null)
          .limit(1)
          .maybeSingle();
        router.replace(
          next && next.startsWith("/partner")
            ? next
            : membership
              ? "/partner"
              : "/join/setup",
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      {/* Background */}
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
              Global Network
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur">
          <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
          <p className="mb-5 text-sm text-muted-foreground">
            Platform staff or partner account.{" "}
            <Link
              href="/join"
              className="font-medium text-foreground underline underline-offset-2"
            >
              New partner? Join here
            </Link>
          </p>

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...form.register("email")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                {...form.register("password")}
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
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in…" : "Sign in →"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
