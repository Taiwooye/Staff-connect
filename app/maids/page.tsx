import type { Metadata } from "next";
import MaidDirectory from "./maid-directory";

export const metadata: Metadata = {
  title: "Find housemaids in Lagos",
  description:
    "Browse housemaid profiles in Lagos and narrow your search by area, skills, and work arrangement.",
};

export default function MaidsPage() {
  return <MaidDirectory />;
}
