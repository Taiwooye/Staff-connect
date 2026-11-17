import type { Metadata } from "next";
import TrustCenter from "./trust-center";

export const metadata: Metadata = {
  title: "Trust and safety",
  description:
    "Review StaffConnect's prototype verification, references, feedback, and safety workflows.",
};

export default function TrustPage() {
  return <TrustCenter />;
}
