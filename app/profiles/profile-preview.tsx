"use client";

import Link from "next/link";
import { useProfileDraft } from "../onboarding/profile-draft-context";

type Role = "client" | "provider";

export default function ProfilePreview({ role }: { role: Role }) {
  const { householdProfile, providerProfile } = useProfileDraft();
  const profile = role === "client" ? householdProfile : providerProfile;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-14">
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <strong>Private preview only.</strong> This profile exists only in this tab’s
          temporary memory. It has not been saved, published, verified, or sent anywhere.
          Refreshing the page clears it.
        </div>

        {!profile ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
            <h1 className="text-2xl font-bold">No profile preview in this tab</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
              Complete the onboarding steps to create a temporary preview. No account or
              saved profile exists yet.
            </p>
            <Link
              href={`/onboarding/${role}`}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Continue onboarding
            </Link>
          </section>
        ) : role === "client" && householdProfile ? (
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-6 py-7 text-white sm:px-8">
              <p className="text-sm font-medium text-amber-300">Household · Lagos</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                Household in {householdProfile.area}
              </h1>
              <p className="mt-2 text-sm text-slate-300">Employer profile preview</p>
            </div>
            <div className="grid gap-7 p-6 sm:grid-cols-[1.4fr_1fr] sm:p-8">
              <section>
                <h2 className="text-lg font-semibold">Help we’re looking for</h2>
                <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                  {householdProfile.needs.map((need) => (
                    <li
                      key={need}
                      className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900"
                    >
                      {need}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-slate-500">
                  Preferred arrangement
                </p>
                <p className="mt-1 font-medium">{householdProfile.arrangement}</p>
              </section>
              <section className="rounded-xl bg-slate-50 p-4">
                <h2 className="text-sm font-semibold">Preferences</h2>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Monthly salary range</dt>
                    <dd className="mt-0.5 font-medium">
                      {householdProfile.budget || "To be discussed"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Start timing</dt>
                    <dd className="mt-0.5 font-medium">
                      {householdProfile.startTiming || "Flexible"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Identity checks</dt>
                    <dd className="mt-0.5 font-medium text-amber-800">Not started</dd>
                  </div>
                </dl>
              </section>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:px-8">
              Contact details and exact address are private and not shown in this preview.
            </div>
          </article>
        ) : role === "provider" && providerProfile ? (
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-6 py-7 text-white sm:px-8">
              <p className="text-sm font-medium text-amber-300">Housemaid · Lagos</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                {providerProfile.displayName}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                {providerProfile.area} · Work profile preview
              </p>
            </div>
            <div className="grid gap-7 p-6 sm:grid-cols-[1.4fr_1fr] sm:p-8">
              <section>
                <h2 className="text-lg font-semibold">About</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {providerProfile.bio || "No introduction added."}
                </p>
                <h2 className="mt-7 text-lg font-semibold">Skills</h2>
                <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                  {providerProfile.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-slate-500">Work arrangements</p>
                <p className="mt-1 font-medium">
                  {providerProfile.arrangements.join(", ")}
                </p>
              </section>
              <section className="rounded-xl bg-slate-50 p-4">
                <h2 className="text-sm font-semibold">Work preferences</h2>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Experience</dt>
                    <dd className="mt-0.5 font-medium">
                      {providerProfile.experience || "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Availability</dt>
                    <dd className="mt-0.5 font-medium">
                      {providerProfile.availability || "To be discussed"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Expected salary</dt>
                    <dd className="mt-0.5 font-medium">
                      {providerProfile.salary || "To be discussed"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Identity and references</dt>
                    <dd className="mt-0.5 font-medium text-amber-800">Not checked</dd>
                  </div>
                </dl>
              </section>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500 sm:px-8">
              Contact details, identity documents, and referee information are private and
              not shown.
            </div>
          </article>
        ) : null}
      </main>
    </div>
  );
}
