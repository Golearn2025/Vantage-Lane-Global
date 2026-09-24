import { Suspense } from "react";
import { BookersWorkspace } from "@/modules/bookers/components/bookers-workspace";

export default function BookersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <Suspense fallback={null}>
        <BookersWorkspace />
      </Suspense>
    </div>
  );
}
