import type { Metadata } from "next";
import { Suspense } from "react";
import MaidDirectory from "./maid-directory";
import { isServiceCategoryId } from "./services";

export const metadata: Metadata = {
  title: "Find household professionals in Lagos and Oyo",
  description:
    "Browse household professional profiles in Lagos and Oyo and filter by location, qualifications, skills, and work arrangement.",
};

async function MaidsDirectoryContent({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] | undefined }>;
}) {
  const { service } = await searchParams;
  const initialService =
    typeof service === "string" && isServiceCategoryId(service) ? service : "all";

  return <MaidDirectory initialService={initialService} />;
}

export default function MaidsPage(props: PageProps<"/maids">) {
  return (
    <Suspense
      fallback={
        <main aria-busy="true" className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm text-slate-500">Loading matching profiles...</p>
        </main>
      }
    >
      <MaidsDirectoryContent searchParams={props.searchParams} />
    </Suspense>
  );
}
