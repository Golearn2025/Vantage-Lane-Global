"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/modules/organizations/schemas";
import { signInWithPassword } from "@/modules/identity/session";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

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
        router.replace("/unauthorized");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.18),_transparent_50%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)))]" />
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader>
          <p className="font-display text-2xl tracking-tight">Vantage Lane</p>
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Internal Network CRM for platform staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button
              className="w-full"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
