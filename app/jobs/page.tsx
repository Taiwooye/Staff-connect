import type { Metadata } from "next";
import { Suspense } from "react";
import JobsBoard from "./jobs-board";
import { getMaidProfile } from "../maids/maid-profiles";

export const metadata: Metadata = {
  title: "Jobs and work opportunities",
  description:
    "Browse local work opportunities, compare hiring details, and connect through StaffConnect.",
};

async function JobsPageContent({
  searchParams,
}: Pick<PageProps<"/jobs">, "searchParams">) {
  const params = await searchParams;
  const profileId =
    typeof params.professional === "string" ? params.professional : "";
  const profile = getMaidProfile(profileId);

  return (
    <JobsBoard
      initialProfessional={
        profile
          ? {
              name: profile.name,
              id: profile.id,
              skills: profile.skills,
              state: profile.state,
              area: profile.area,
              salaryMin: profile.salaryMin,
              salaryMax: profile.salaryMax,
              arrangement: profile.arrangement,
            }
          : null
      }
    />
  );
}

export default function JobsPage(props: PageProps<"/jobs">) {
  return (
    <Suspense
      fallback={
        <main aria-busy="true" className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm text-slate-500">Loading job opportunities...</p>
        </main>
      }
    >
      <JobsPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}