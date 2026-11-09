import type { Metadata } from "next";
import ProfilePreview from "../profile-preview";

export const metadata: Metadata = {
  title: "Housemaid profile preview",
  description: "Preview a housemaid profile on StaffConnect.",
};

export default function ProviderProfilePage() {
  return <ProfilePreview role="provider" />;
}
