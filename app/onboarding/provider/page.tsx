import type { Metadata } from "next";
import OnboardingFlow from "../onboarding-flow";

export const metadata: Metadata = {
  title: "Housemaid onboarding",
  description: "Preview a housemaid work profile on StaffConnect.",
};

export default function ProviderOnboardingPage() {
  return <OnboardingFlow role="provider" />;
}
