/** Shown on wizard steps that are UI-only until persistence ships. */
export function PartnerStepNotPersistedBanner({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
      <p className="font-medium">{label} — draft on this device only</p>
      <p className="mt-1 text-xs opacity-90">
        This step is not saved to the network yet. Please complete{" "}
        <strong>Documents</strong>
        {label.toLowerCase().includes("rate") ? "" : " (and Rates where shown)"}{" "}
        so we have your verified details. We are enabling full save for this
        step next.
      </p>
    </div>
  );
}
