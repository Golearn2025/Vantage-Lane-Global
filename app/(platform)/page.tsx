import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Internal ops home for the Ground Transportation network CRM.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Search operators, manage leads, and open profiles.
            </p>
            <Button asChild>
              <Link href="/organizations">Open organizations</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Network</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Find who covers an airport or place, by relationship bucket.
            </p>
            <Button asChild variant="secondary">
              <Link href="/network">Open network</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create a new operator Lead in one transactional step.
            </p>
            <Button asChild variant="outline">
              <Link href="/organizations/new">Add Operator</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
