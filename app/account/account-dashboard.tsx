"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../auth/auth-context";
import { getMaidProfile } from "../maids/maid-profiles";

export default function AccountDashboard() {
  const router = useRouter();
  const [saveError, setSaveError] = useState("");
  const {
    status,
    user,
    accountType,
    savedProfessionalIds,
    authError,
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

  if (status !== "signed-in" || !user || !accountType) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
            StaffConnect account
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#142236]">
            {status === "signed-in" && user
              ? "We couldn’t load your account type."
              : "Sign in to see your account"}
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            {status === "signed-in" && user
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
  const savedProfiles = savedProfessionalIds
    .map((id) => getMaidProfile(id))
    .filter((profile) => profile !== undefined);

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[2rem] bg-[#142236] p-6 text-white sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-300">
            My account
          </p>
          <h1 className="mt-3 text-3xl font-bold">You’re signed in as a {accountLabel}.</h1>
          <p className="mt-3 text-slate-300">{user.email}</p>
          {authError && (
            <p role="alert" className="mt-4 rounded-xl bg-rose-100 p-3 text-sm text-rose-900">
              {authError}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={accountType === "client" ? "/maids" : "/onboarding/provider"}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-[#142236] hover:bg-amber-300"
            >
              {accountType === "client"
                ? "Find household help"
                : "Open your profile preview"}
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </section>

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
