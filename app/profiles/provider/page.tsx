import type { Metadata } from "next";
import ProfilePreview from "../profile-preview";

export const metadata: Metadata = {
  title: "Household professional profile preview",
  description: "Preview a household professional profile on StaffConnect.",
};

export default function ProviderProfilePage() {
  return <ProfilePreview role="provider" />;
}
