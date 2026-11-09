import type { Metadata } from "next";
import ProfilePreview from "../profile-preview";

export const metadata: Metadata = {
  title: "Household profile preview",
  description: "Preview a household profile for a StaffConnect domestic staff search.",
};

export default function HouseholdProfilePage() {
  return <ProfilePreview role="client" />;
}
