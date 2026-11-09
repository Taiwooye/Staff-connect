"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../auth/auth-context";

export default function SaveProfileButton({
  profileId,
  profileName,
}: {
  profileId: string;
  profileName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    status,
    accountType,
    savedProfessionalIds,
    toggleSavedProfessional,
  } = useAuth();
  const [error, setError] = useState("");
  const isSaved = savedProfessionalIds.includes(profileId);

  async function toggleSaved() {
    setError("");

    if (status !== "signed-in") {
      router.push(
        `/auth?mode=signup&role=client&next=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    if (accountType !== "client") {
      setError(
        accountType === "provider"
          ? "Only Client accounts can save household professionals."
          : "Your account type could not be loaded. Open your account for details.",
      );
      return;
    }

    try {
      await toggleSavedProfessional(profileId);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update this saved profile.",
      );
    }
  }

  return (
    <div>
      <button
        type="button"
        aria-pressed={isSaved}
        disabled={status === "loading"}
        onClick={() => void toggleSaved()}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
          isSaved
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
        }`}
      >
        <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
        {isSaved
          ? "Saved to your Client account"
          : status === "signed-in" && accountType === "provider"
            ? `Save ${profileName.split(" ")[0]} (Client accounts only)`
            : `Save ${profileName.split(" ")[0]}`}
      </button>
      {status !== "signed-in" && status !== "loading" && (
        <p className="mt-2 text-sm text-slate-600">
          You’ll be asked to create a Client or Provider account before saving.
          <Link
            href={`/auth?mode=signin&next=${encodeURIComponent(pathname)}`}
            className="ml-1 font-semibold text-amber-800 underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      )}
      {accountType === "provider" && !error && (
        <p className="mt-2 text-sm text-slate-600">
          Saving is available to Client accounts.{" "}
          <Link
            href="/account"
            className="font-semibold text-amber-800 underline underline-offset-4"
          >
            View your account
          </Link>
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
