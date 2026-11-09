"use client";

import { useProfileDraft } from "../../onboarding/profile-draft-context";

export default function SaveProfileButton({
  profileId,
  profileName,
}: {
  profileId: string;
  profileName: string;
}) {
  const { savedProfileIds, toggleSavedProfile } = useProfileDraft();
  const isSaved = savedProfileIds.includes(profileId);

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      onClick={() => toggleSavedProfile(profileId)}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
        isSaved
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
      }`}
    >
      <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
      {isSaved ? "Saved to your list" : `Save ${profileName.split(" ")[0]}`}
    </button>
  );
}
