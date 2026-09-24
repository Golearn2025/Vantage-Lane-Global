"use client";

import { Button } from "@/shared/ui/button";

export function InventorySaveBar({
  onSave,
  isPending,
  disabled,
}: {
  onSave: () => void;
  isPending: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end pt-2">
      <Button
        type="button"
        className="rounded-full"
        onClick={onSave}
        disabled={disabled || isPending}
      >
        {isPending ? "Saving…" : "Save →"}
      </Button>
    </div>
  );
}
