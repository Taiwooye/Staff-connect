import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SaveProfileButton from "./save-profile-button";
import { getMaidProfile, maidProfiles } from "../maid-profiles";

export function generateStaticParams() {
  return maidProfiles.map((profile) => ({ id: profile.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/maids/[id]">): Promise<Metadata> {
  const { id } = await params;
  const profile = getMaidProfile(id);

  if (!profile) {
    return { title: "Profile not found" };
  }

  return {
    title: `${profile.name} — household professional`,
    description: `View ${profile.name}'s sample profile, skills, qualifications, and availability in ${profile.area}, ${profile.state}.`,
  };
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default async function MaidProfilePage({
  params,
}: PageProps<"/maids/[id]">) {
  const { id } = await params;
  const profile = getMaidProfile(id);

  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
        <Link href="/maids" className="hover:text-slate-900">Find professionals</Link>
        <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
        <span aria-current="page" className="font-medium text-slate-700">{profile.name}</span>
      </nav>

      <aside className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        <strong>Sample profile:</strong> This fictional preview is for demonstration only.
        Qualifications, references, and work history have not been independently checked.
      </aside>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="bg-[#142236] px-5 py-7 text-white sm:px-9 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-300 text-xl font-bold text-[#142236]">
                {profile.initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-amber-200">
                  {profile.area}, {profile.state}, Nigeria
                </p>
                <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">
                  {profile.name}
                </h1>
                <p className="mt-1 text-sm text-slate-300">{profile.experience}</p>
              </div>
            </div>
            <SaveProfileButton profileId={profile.id} profileName={profile.name} />
          </div>
        </header>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-8">
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-lg font-bold text-[#142236]">About</h2>
              <p className="mt-3 leading-7 text-slate-600">{profile.about}</p>
            </section>

            <section aria-labelledby="skills-heading">
              <h2 id="skills-heading" className="text-lg font-bold text-[#142236]">Skills</h2>
              <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                {profile.skills.map((skill) => (
                  <li key={skill} className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="qualifications-heading">
              <h2 id="qualifications-heading" className="text-lg font-bold text-[#142236]">
                Qualifications & training
              </h2>
              <ul className="mt-3 space-y-3">
                {profile.qualifications.map((qualification) => (
                  <li key={qualification} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700">•</span>
                    <span>{qualification}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="languages-heading">
              <h2 id="languages-heading" className="text-lg font-bold text-[#142236]">Languages</h2>
              <p className="mt-3 text-sm text-slate-600">{profile.languages.join(", ")}</p>
            </section>

            <section aria-labelledby="interests-heading">
              <h2 id="interests-heading" className="text-lg font-bold text-[#142236]">Interests</h2>
              <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                {profile.interests.map((interest) => (
                  <li key={interest} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                    {interest}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="h-fit space-y-5 rounded-2xl bg-[#f7f8f6] p-5">
            <h2 className="text-base font-bold text-[#142236]">Work preferences</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Work arrangement</dt>
                <dd className="mt-1 font-semibold text-slate-800">{profile.arrangement}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Availability</dt>
                <dd className="mt-1 font-semibold text-slate-800">{profile.availability}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Expected monthly salary</dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {naira.format(profile.salaryMin)}–{naira.format(profile.salaryMax)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Identity and references</dt>
                <dd className="mt-1 font-semibold text-amber-800">Not verified in this demo</dd>
              </div>
            </dl>
            <Link
              href="/maids"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#142236] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#20334c]"
            >
              Browse more profiles
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}
