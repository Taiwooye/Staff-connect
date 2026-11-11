import type { Metadata } from "next";
import JobsBoard from "./jobs-board";

export const metadata: Metadata = {
  title: "Jobs and work opportunities",
  description:
    "Browse local work opportunities, compare hiring details, and connect through StaffConnect.",
};

export default function JobsPage() {
  return <JobsBoard />;
}