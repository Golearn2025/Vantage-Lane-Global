"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";

function InterestInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("invite") || "";
  const [state, setState] = useState<"loading" | "ok" | "bad">("loading");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token || token.length < 16) {
        if (!cancelled) setState("bad");
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase.rpc("rpc_mark_booker_interest", {
        p_token: token,
      });
      if (cancelled) return;
      if (error || !(data as { ok?: boolean } | null)?.ok) {
        setState("bad");
        return;
      }
      setState("ok");
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0b0c0e] px-6 py-16 text-center">
      <Image
        src="/logo.png"
        alt="Vantage Lane"
        width={56}
        height={56}
        className="mb-4 h-14 w-14"
        priority
      />
      <p className="mb-6 font-serif text-[11px] uppercase tracking-[0.28em] text-[#c4a574]">
        Vantage Lane
      </p>
      {state === "loading" ? (
        <p className="text-sm text-[#a39e93]">Confirming…</p>
      ) : state === "ok" ? (
        <div className="max-w-md space-y-4">
          <h1 className="font-serif text-2xl text-[#e8e2d6]">
            Thanks — we’re on it
          </h1>
          <p className="text-sm leading-relaxed text-[#a39e93]">
            Your interest is registered. Reply to{" "}
            <a
              className="text-[#c4a574] underline-offset-2 hover:underline"
              href="mailto:partnerships@vantage-lane.com?subject=Booker%20interest"
            >
              partnerships@vantage-lane.com
            </a>{" "}
            anytime with guest coverage needs.
          </p>
        </div>
      ) : (
        <div className="max-w-md space-y-4">
          <h1 className="font-serif text-2xl text-[#e8e2d6]">Link unavailable</h1>
          <p className="text-sm leading-relaxed text-[#a39e93]">
            This link may have expired. Email{" "}
            <a
              className="text-[#c4a574] underline-offset-2 hover:underline"
              href="mailto:partnerships@vantage-lane.com"
            >
              partnerships@vantage-lane.com
            </a>{" "}
            and we’ll help.
          </p>
        </div>
      )}
    </main>
  );
}

export default function InterestPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-[#0b0c0e] text-sm text-[#a39e93]">
          Loading…
        </main>
      }
    >
      <InterestInner />
    </Suspense>
  );
}
