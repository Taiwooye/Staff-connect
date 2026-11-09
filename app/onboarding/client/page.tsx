import type { Metadata } from "next";
import OnboardingFlow from "../onboarding-flow";

export const metadata: Metadata = {
  title: "Client onboarding",
  description: "Preview a household profile for a StaffConnect search in Lagos or Oyo.",
};

export default function ClientOnboardingPage() {
  return <OnboardingFlow role="client" />;
}
