"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/shared/lib/supabase/client";
import { persistInviteToken } from "@/modules/invites/invite-token";
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
import { PhoneInput } from "@/shared/components/phone-input";
import { PasswordInput } from "@/shared/components/password-input";
import { toE164, findDialCountry } from "@/shared/lib/phone/dial-countries";

const schema = z
  .object({
    firstName: z.string().min(1, "First name required"),
    surname: z.string().min(1, "Surname required"),
    email: z.string().email(),
    phoneE164: z
      .string()
      .min(10, "Enter a valid phone number")
      .regex(/^\+\d{8,15}$/, "Enter a valid phone number"),
    password: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function JoinSignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      surname: "",
      email: "",
      phoneE164: toE164(findDialCountry("GB").dial, ""),
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    persistInviteToken(searchParams.get("invite"));
  }, [searchParams]);

  async function onSubmit(values: FormValues) {
    setError(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const displayName = `${values.firstName.trim()} ${values.surname.trim()}`.replace(
      /\s+/g,
      " ",
    );
    const invite = searchParams.get("invite");
    persistInviteToken(invite);
    const nextSetup = invite
      ? `/join/setup?invite=${encodeURIComponent(invite)}`
      : "/join/setup";

    const { data, error: signErr } = await supabase.auth.signUp({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextSetup)}`,
        data: {
          display_name: displayName,
          first_name: values.firstName.trim(),
          surname: values.surname.trim(),
          phone: values.phoneE164,
          invite_token: invite || undefined,
        },
      },
    });
    if (signErr) {
      setError(signErr.message);
      return;
    }

    if (data.session?.user) {
      await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          phone: values.phoneE164,
        })
        .eq("id", data.session.user.id);
      router.replace(nextSetup);
      return;
    }

    const q = new URLSearchParams({
      email: values.email.trim().toLowerCase(),
    });
    router.replace(`/join/check-email?${q.toString()}`);
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,_hsl(36_42%_58%_/_0.13),_transparent_60%),radial-gradient(ellipse_at_80%_100%,_hsl(36_42%_58%_/_0.08),_transparent_60%),hsl(var(--background))]" />

      <div className="w-full max-w-md md:max-w-lg">
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
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your details — we&apos;ll verify your email, then you set up
            your company and service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName ? (
                  <p className="text-xs text-danger">
                    {form.formState.errors.firstName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  autoComplete="family-name"
                  {...form.register("surname")}
                />
                {form.formState.errors.surname ? (
                  <p className="text-xs text-danger">
                    {form.formState.errors.surname.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-danger">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <PhoneInput
              valueE164={form.watch("phoneE164")}
              onChangeE164={(v) =>
                form.setValue("phoneE164", v, { shouldValidate: true })
              }
              defaultIso2="GB"
              error={form.formState.errors.phoneE164?.message}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p className="text-xs text-danger">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword ? (
                  <p className="text-xs text-danger">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>
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
              {form.formState.isSubmitting ? "Creating…" : "Create account →"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
