import type { Metadata } from "next";
import MaidDirectory from "./maid-directory";

export const metadata: Metadata = {
  title: "Find household professionals in Lagos and Oyo",
  description:
    "Browse household professional profiles in Lagos and Oyo and filter by location, qualifications, skills, and work arrangement.",
};

export default function MaidsPage() {
  return <MaidDirectory />;
}
