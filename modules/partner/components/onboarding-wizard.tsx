"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  fetchPartnerOrgContext,
  fetchServiceTypeConfig,
} from "@/modules/partner/api";
import { Button } from "@/shared/ui/button";

// Step components
import { PartnerDocumentsPanel } from "./documents-panel";
import { PartnerFleetForm } from "./fleet-form";
import { PartnerRatesForm } from "./rates-form";
import { AircraftStep } from "./wizard-steps/aircraft-step";
import { OperativesStep } from "./wizard-steps/operatives-step";
import { PropertiesStep } from "./wizard-steps/properties-step";
import { SpecialisationsStep } from "./wizard-steps/specialisations-step";
import { AvailabilityStep } from "./wizard-steps/availability-step";
import { VesselsStep } from "./wizard-steps/vessels-step";
import { ServicesStep } from "./wizard-steps/services-step";
import { CapabilitiesStep } from "./wizard-steps/capabilities-step";
import { ReviewStep } from "./wizard-steps/review-step";

type Props = {
  currentStepKey: string;
  onNavigate: (stepKey: string) => void;
};

function StepComponent({
  stepKey,
  serviceCode,
}: {
  stepKey: string;
  serviceCode: string;
}) {
  if (stepKey === "documents") return <PartnerDocumentsPanel />;
  if (stepKey === "fleet") return <PartnerFleetForm />;
  if (stepKey === "rates") return <PartnerRatesForm />;
  if (stepKey === "aircraft") return <AircraftStep />;
  if (stepKey === "operatives") return <OperativesStep />;
  if (stepKey === "properties") return <PropertiesStep />;
  if (stepKey === "specialisations") return <SpecialisationsStep />;
  if (stepKey === "availability" || stepKey === "coverage")
    return <AvailabilityStep />;
  if (stepKey === "vessels") return <VesselsStep />;
  if (stepKey === "services") return <ServicesStep />;
  if (stepKey === "capabilities") return <CapabilitiesStep />;
  if (stepKey === "review") return <ReviewStep />;
  // profile step — show a placeholder
  if (stepKey === "profile") {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your company profile was set up during registration. You can update
          your details from your account settings.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <p className="text-sm text-muted-foreground">
        Step <strong>{stepKey}</strong> for{" "}
        <strong>{serviceCode}</strong> — coming soon.
      </p>
    </div>
  );
}

export function OnboardingWizard({ currentStepKey, onNavigate }: Props) {
  const orgQ = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });

  const serviceCode = orgQ.data?.serviceCode ?? "GROUND_TRANSPORTATION";

  const configQ = useQuery({
    queryKey: ["partner", "service-config", serviceCode],
    queryFn: () => fetchServiceTypeConfig(serviceCode),
    enabled: Boolean(serviceCode),
  });

  const steps = configQ.data?.wizardSteps ?? [];
  const currentIndex = steps.findIndex((s) => s.key === currentStepKey);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;

  const prevStep = safeIndex > 0 ? steps[safeIndex - 1] : null;
  const nextStep = safeIndex < steps.length - 1 ? steps[safeIndex + 1] : null;

  if (orgQ.isLoading || configQ.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress stepper */}
      {steps.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-4 shadow-sm">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Step {safeIndex + 1} of {steps.length}
          </p>
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
            {steps.map((step, idx) => {
              const isActive = idx === safeIndex;
              const isDone = idx < safeIndex;
              return (
                <li key={step.key} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onNavigate(step.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                          ? "text-primary hover:bg-primary/10"
                          : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                    <span className="capitalize">{step.label}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <span className="text-border/60 text-xs">›</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Step content */}
      <StepComponent
        stepKey={currentStepKey}
        serviceCode={serviceCode}
      />

      {/* Navigation */}
      {steps.length > 0 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={!prevStep}
            onClick={() => prevStep && onNavigate(prevStep.key)}
          >
            Back
          </Button>
          {nextStep ? (
            <Button
              className="rounded-full"
              onClick={() => onNavigate(nextStep.key)}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="rounded-full"
              onClick={() => onNavigate("review")}
            >
              Review &amp; Submit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
