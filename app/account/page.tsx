import type { Metadata } from "next";
import AccountDashboard from "./account-dashboard";

export const metadata: Metadata = {
  title: "My account",
  description: "See your StaffConnect account type and saved professionals.",
};

export default function AccountPage() {
  return <AccountDashboard />;
}
