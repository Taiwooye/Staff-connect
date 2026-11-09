import type { Metadata } from "next";
import OnboardingFlow from "../onboarding-flow";

export const metadata: Metadata = {
  title: "Household professional onboarding",
  description: "Create a household professional work profile on StaffConnect.",
};

export default function ProviderOnboardingPage() {
  return <OnboardingFlow role="provider" />;
}
