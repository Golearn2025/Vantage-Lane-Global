"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { signOut } from "@/modules/identity/session";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Platform access required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This application shell is for Vantage Lane platform staff. Your
            account is authenticated, but does not have platform CRM access.
            Database RLS remains the authority.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
            >
              Logout
            </Button>
            <Button asChild variant="secondary">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
