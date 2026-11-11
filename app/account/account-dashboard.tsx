"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import AccountProfileEditor from "./account-profile-editor";
import { type AccountProfile, useAuth } from "../auth/auth-context";
import { getMaidProfile, maidProfiles, type MaidProfile } from "../maids/maid-profiles";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SC"
  );
}

function budgetLimit(value: string) {
  const amounts = value.match(/\d[\d,]*/g);
  if (!amounts?.length) return null;
  return Math.max(...amounts.map((amount) => Number(amount.replaceAll(",", ""))));
}

function getMatchingProfessionals(profile: AccountProfile) {
  const needs = profile.serviceNeeds;
  const maxBudget = budgetLimit(profile.monthlyBudget);

  return maidProfiles
    .map((professional) => {
      const matchedSkills = professional.skills.filter((skill) => needs.includes(skill));
      const sameState = Boolean(profile.state && professional.state === profile.state);
      const sameArea = Boolean(profile.area && professional.area === profile.area);
      const sameArrangement = Boolean(
        profile.workArrangement &&
          professional.arrangement === profile.workArrangement,
      );
      const inBudget = maxBudget !== null && professional.salaryMax <= maxBudget;
      const score =
        matchedSkills.length * 10 +
        (sameState ? 5 : 0) +
        (sameArea ? 3 : 0) +
        (sameArrangement ? 2 : 0) +
        (inBudget ? 1 : 0);

      return {
        professional,
        matchedSkills,
        sameState,
        sameArea,
        sameArrangement,
        inBudget,
        budgetStatus:
          maxBudget === null
            ? "Set a budget for better-fit suggestions"
            : inBudget
              ? "Within your budget"
              : professional.salaryMin <= maxBudget
                ? "Price range may exceed your budget"
                : "Above your budget",
        score,
      };
    })
    .filter((match) => needs.length === 0 || match.matchedSkills.length > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 4);
}

function ProfileAvatar({
  name,
  photo,
  size = "large",
}: {
  name: string;
  photo: string;
  size?: "large" | "small";
}) {
  const sizeClass = size === "large" ? "h-24 w-24 text-2xl" : "h-14 w-14 text-lg";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-100 font-bold text-amber-900 ring-4 ring-white ${sizeClass}`}
    >
      {photo ? (
        <Image
          src={photo}
          alt={`${name || "Your"} profile photo`}
          fill
          unoptimized
          sizes={size === "large" ? "96px" : "56px"}
          className="object-cover"
        />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function MatchCard({
  professional,
  matchedSkills,
  sameState,
  sameArea,
  sameArrangement,
  inBudget,
  budgetStatus,
}: {
  professional: MaidProfile;
  matchedSkills: string[];
  sameState: boolean;
  sameArea: boolean;
  sameArrangement: boolean;
  inBudget: boolean;
  budgetStatus: string;
}) {
  const reasons = [
    ...(matchedSkills.length
      ? [`${matchedSkills.length} service${matchedSkills.length === 1 ? "" : "s"} match`]
      : []),
    ...(sameArea ? ["same area"] : sameState ? ["same state"] : []),
    ...(sameArrangement ? ["preferred schedule"] : []),
    ...(inBudget ? ["within budget"] : []),
  ];

  return (
    <li className="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-900">
          {professional.initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-[#142236]">{professional.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {professional.area}, {professional.state} · {professional.experience}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {professional.skills.map((skill) => (
          <span
            key={skill}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              matchedSkills.includes(skill)
                ? "bg-emerald-50 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {skill}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold text-[#142236]">
        Expected monthly pay: {naira.format(professional.salaryMin)}–
        {naira.format(professional.salaryMax)}
      </p>
      <p className="mt-1 text-xs text-slate-600">{budgetStatus}</p>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-amber-800">☆ Not rated yet</span>
        <span className="text-slate-500">{professional.arrangement}</span>
      </div>
      {reasons.length > 0 && (
        <p className="mt-3 text-xs leading-5 text-emerald-800">
          Match details: {reasons.join(" · ")}
        </p>
      )}
      <Link
        href={`/maids/${professional.id}`}
        className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-amber-800 underline underline-offset-4"
      >
        View full profile
      </Link>
      <Link
        href={`/jobs?professional=${professional.id}`}
        className="ml-4 inline-flex min-h-10 items-center text-sm font-semibold text-emerald-800 underline underline-offset-4"
      >
        Post a related job
      </Link>
    </li>
  );
}

export default function AccountDashboard() {
  const router = useRouter();
  const [saveError, setSaveError] = useState("");
  const {
    status,
    user,
    accountType,
    profile,
    savedProfessionalIds,
    authError,
    demoMode,
    signOut,
    toggleSavedProfessional,
  } = useAuth();

  async function handleSignOut() {
    if (await signOut()) router.replace("/");
  }

  async function removeSavedProfile(profileId: string) {
    setSaveError("");
    try {
      await toggleSavedProfessional(profileId);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not remove this saved profile.",
      );
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-16">
        <p className="mx-auto max-w-3xl text-sm text-slate-600">Loading your account...</p>
      </main>
    );
  }

  if (status !== "signed-in" || !user || !accountType || !profile) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
            StaffConnect account
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#142236]">
            {status === "signed-in" && user && accountType
              ? accountType && !profile
                ? "We couldn’t load your profile."
                : "We couldn’t load your account type."
              : "Sign in to see your account"}
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            {status === "signed-in" && user && accountType && !profile
              ? "Your profile could not be loaded from this browser. Refresh to retry or clear this site’s saved data."
              : status === "signed-in" && user
              ? "Your session is active, but account details could not be loaded. Refresh to retry."
              : "Your account page shows whether you joined as a Client or Provider."}
          </p>
          {status === "unconfigured" && (
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Account sign-in is being set up. You can still browse household
              professionals while we get things ready.{" "}
              <Link
                href="/maids"
                className="font-semibold underline underline-offset-4"
              >
                Browse profiles
              </Link>
            </p>
          )}
          {authError && (
            <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
              {authError}
            </p>
          )}
          {status === "signed-in" && user ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#142236] px-5 py-3 text-sm font-semibold text-white hover:bg-[#20334c]"
            >
              Refresh account
            </button>
          ) : (
            <Link
              href="/signin?next=%2Faccount"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#142236] px-5 py-3 text-sm font-semibold text-white hover:bg-[#20334c]"
            >
              Sign in
            </Link>
          )}
        </section>
      </main>
    );
  }

  const accountLabel = accountType === "client" ? "Client" : "Provider";
  const isProvider = accountType === "provider";
  const savedProfiles = savedProfessionalIds
    .map((id) => getMaidProfile(id))
    .filter((profile) => profile !== undefined);
  const matches = isProvider ? [] : getMatchingProfessionals(profile);

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProfileAvatar name={profile.displayName} photo={profile.photoDataUrl} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-800">
                {accountLabel} profile
              </p>
              <h1 className="mt-2 break-words text-3xl font-bold text-[#142236]">
                {profile.displayName || user.email}
              </h1>
              <p className="mt-2 text-sm text-slate-600">{user.email}</p>
              <p className="mt-2 text-sm text-slate-600">
                {[profile.area, profile.state].filter(Boolean).join(", ") ||
                  "Add your current location"}
                {profile.stateOfOrigin ? ` · From ${profile.stateOfOrigin}` : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                  {accountLabel} account
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  ☆ {isProvider ? "Not rated yet" : "Ratings appear after a hire"}
                </span>
                {isProvider && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Likes · coming soon
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 sm:flex-col">
              <Link
                href="/jobs"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#142236] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20334c]"
              >
                {isProvider ? "Browse jobs and offers" : "Manage my job posts"}
              </Link>
              {!isProvider && (
                <Link
                  href="/maids"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Find household help
                </Link>
              )}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>
          {isProvider ? (
            <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Experience
                </p>
                <p className="mt-1 font-semibold text-[#142236]">
                  {profile.experienceYears
                    ? `${profile.experienceYears} years`
                    : "Not added yet"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expected monthly pay
                </p>
                <p className="mt-1 font-semibold text-[#142236]">
                  {profile.expectedSalary || "Add your expected pay"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Availability
                </p>
                <p className="mt-1 font-semibold text-[#142236]">
                  {profile.availability || "Not added yet"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-7 border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Household support you need
              </p>
              <p className="mt-1 font-semibold text-[#142236]">
                {profile.serviceNeeds.length
                  ? profile.serviceNeeds.join(" · ")
                  : "Choose services to see relevant sample matches"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Budget: {profile.monthlyBudget || "not set"} · Schedule:{" "}
                {profile.workArrangement || "not set"} · Start:{" "}
                {profile.startTiming || "not set"}
              </p>
            </div>
          )}
          {isProvider && (
            <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  About
                </h2>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                  {profile.bio || "Add an introduction so households can get to know you."}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Skills
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {profile.skills.length ? profile.skills.join(" · ") : "No skills added yet"}
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Languages
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {profile.languages || "No languages added yet"}
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Previous work
                </h2>
                {profile.previousWork ? (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-slate-700">
                    {profile.previousWork
                      .split("\n")
                      .filter((item) => item.trim())
                      .map((item, index) => (
                        <li key={`${index}-${item}`}>{item}</li>
                      ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    No work history added yet
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Qualifications
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {profile.qualifications || "No qualifications added yet"}
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Work arrangements
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {profile.arrangements.length
                      ? profile.arrangements.join(" · ")
                      : "No work arrangements selected"}
                  </p>
                </div>
              </div>
            </div>
          )}
          {demoMode && (
            <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Demo profile: changes are saved in this browser only. Your email
              hasn’t been verified, and your profile isn’t public or verified.
            </p>
          )}
          {!demoMode && (
            <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              Profile details are saved in this browser only and are not yet
              published or synced to your account online.
            </p>
          )}
          {authError && (
            <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
              {authError}
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-[#142236]">Edit your profile</h2>
          <AccountProfileEditor accountType={accountType} profile={profile} />
        </section>

        {!isProvider && (
          <section className="mt-10">
            <div>
              <h2 className="text-2xl font-bold text-[#142236]">Suggested professionals</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Suggestions are ranked by your selected services, location, schedule,
                and budget.
                Prices and profiles are samples, not verified or live listings.
              </p>
            </div>
            {!profile.serviceNeeds.length ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
                Select the services you need in your profile to see relevant
                suggestions instead of a generic list.
              </div>
            ) : matches.length ? (
              <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
                {matches.map((match) => (
                  <MatchCard key={match.professional.id} {...match} />
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
                There are no sample profiles for those service needs yet. Try
                adjusting your selected services or check back later.
              </div>
            )}
          </section>
        )}

        {accountType === "client" ? (
          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#142236]">Saved professionals</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Your saved profiles are attached to your Client account.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                {savedProfiles.length}
              </span>
            </div>
            {saveError && (
              <p role="alert" className="mt-4 text-sm text-rose-700">
                {saveError}
              </p>
            )}
            {savedProfiles.length ? (
              <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
                {savedProfiles.map((profile) => (
                  <li
                    key={profile.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-bold text-[#142236]">{profile.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {profile.area}, {profile.state} · {profile.experience}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/maids/${profile.id}`}
                        className="text-sm font-semibold text-amber-800 underline underline-offset-4"
                      >
                        View profile
                      </Link>
                      <Link
                        href={`/jobs?professional=${profile.id}`}
                        className="text-sm font-semibold text-emerald-800 underline underline-offset-4"
                      >
                        Post a related job
                      </Link>
                      <Link
                        href={`/jobs?professional=${profile.id}`}
                        className="text-sm font-semibold text-emerald-800 underline underline-offset-4"
                      >
                        Post a related job
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeSavedProfile(profile.id)}
                        className="text-sm font-semibold text-slate-600 underline underline-offset-4"
                      >
                        Remove saved profile
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-7 text-center">
                <p className="font-semibold text-slate-800">No saved profiles yet</p>
                <p className="mt-2 text-sm text-slate-600">
                  Browse professionals and save profiles you’d like to revisit.
                </p>
              </div>
            )}
          </section>
        ) : (
          <aside className="mt-8 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            Your Provider account type is saved. Provider profile publishing and
            permanent work-profile storage will be added when those features are
            connected.
          </aside>
        )}
      </div>
    </main>
  );
}
