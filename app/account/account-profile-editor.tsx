"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  type AccountProfile,
  type AccountType,
  useAuth,
} from "../auth/auth-context";
import { getAreasForState, launchStates } from "../locations";

const householdSkills = ["Cleaning", "Laundry", "Cooking", "Childcare"];
const workerSkills = [
  ...householdSkills,
  "Teaching",
  "Tutoring",
  "Mathematics",
  "Event planning",
  "Event service",
  "Customer service",
  "Dry cleaning",
  "Garment care",
  "Tailoring",
  "Sales",
  "Driving",
  "Maintenance",
];
const workArrangements = ["Live-in", "Daily", "Weekends"];
const maxPhotoSize = 5 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

function getInitials(name: string) {
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

export default function AccountProfileEditor({
  accountType,
  profile,
}: {
  accountType: AccountType;
  profile: AccountProfile;
}) {
  const { saveProfile } = useAuth();
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isProvider = accountType === "provider";
  const areas = getAreasForState(draft.state);

  function updateField<Key extends keyof AccountProfile>(
    key: Key,
    value: AccountProfile[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function toggleListValue(key: "skills" | "arrangements" | "serviceNeeds", value: string) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
    setSaved(false);
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (!allowedPhotoTypes.includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image for your profile photo.");
      return;
    }

    if (file.size > maxPhotoSize) {
      setError("Choose a profile photo smaller than 5 MB.");
      return;
    }

    try {
      const sourceDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("Could not read this photo. Try another image."));
            return;
          }
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error("Could not read this photo. Try again."));
        reader.onabort = () => reject(new Error("Photo upload was cancelled."));
        reader.readAsDataURL(file);
      });

      const photoDataUrl = await new Promise<string>((resolve, reject) => {
        const image = document.createElement("img");
        image.onload = () => {
          const maxDimension = 640;
          const scale = Math.min(
            1,
            maxDimension / image.naturalWidth,
            maxDimension / image.naturalHeight,
          );
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Could not prepare this photo. Try another image."));
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/webp", 0.8));
        };
        image.onerror = () => reject(new Error("Could not prepare this photo. Try another image."));
        image.src = sourceDataUrl;
      });

      updateField("photoDataUrl", photoDataUrl);
      setError("");
    } catch (photoError) {
      setError(
        photoError instanceof Error
          ? photoError.message
          : "Could not read this photo. Try again.",
      );
    }
  }

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isProvider && !draft.bio.trim()) {
      setError("Add a short bio so households can learn a little about you.");
      return;
    }

    if (isProvider && !draft.languages.split(",").some((language) => language.trim())) {
      setError("Add at least one language so households know how you communicate.");
      return;
    }

    setIsSaving(true);
    try {
      const nextProfile = {
        ...draft,
        displayName: draft.displayName.trim(),
        bio: draft.bio.trim(),
        previousWork: draft.previousWork.trim(),
        qualifications: draft.qualifications.trim(),
        languages: draft.languages.trim(),
      };
      saveProfile(nextProfile);
      setDraft(nextProfile);
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const fieldClass =
    "mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
  const textAreaClass =
    "mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
  const photoChanged = draft.photoDataUrl !== profile.photoDataUrl;

  return (
    <form onSubmit={submitProfile} className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-slate-700 bg-[#142236] p-5 text-white shadow-xl shadow-slate-900/10 sm:p-7">
        <div aria-hidden="true" className="absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 left-1/3 -z-10 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_19rem] lg:items-center">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Your profile photo
            </p>
            <h2 className="mt-4 max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
              Put a friendly face to your profile.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Choose a clear, recent photo that helps people recognize you. You can change or remove it at any time.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-bold text-[#142236] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-amber-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber-200">
                <span aria-hidden="true" className="text-base leading-none">↑</span>
                {draft.photoDataUrl ? "Choose a different photo" : "Upload a photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => void handlePhotoChange(event)}
                  className="sr-only"
                  aria-label="Upload a profile photo"
                />
              </label>
              {draft.photoDataUrl && (
                <button
                  type="button"
                  onClick={() => updateField("photoDataUrl", "")}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-rose-200/60 hover:bg-rose-400/10 hover:text-white"
                >
                  Remove photo
                </button>
              )}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              JPEG, PNG, or WebP · 5 MB maximum · automatically resized before saving
            </p>
          </div>

          <aside className="rounded-[1.5rem] border border-white/15 bg-white p-4 text-[#142236] shadow-2xl shadow-black/15 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Profile preview
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  photoChanged
                    ? "bg-amber-100 text-amber-900"
                    : draft.photoDataUrl
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {photoChanged
                  ? "Unsaved change"
                  : draft.photoDataUrl
                    ? "Saved on this device"
                    : "No photo yet"}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[#f6f7f5] p-4">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-100 text-xl font-bold text-amber-900 ring-4 ring-white shadow-md">
                {draft.photoDataUrl ? (
                  <Image
                    src={draft.photoDataUrl}
                    alt={`${draft.displayName || "Your"} profile photo preview`}
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  getInitials(draft.displayName)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{draft.displayName || "Your name"}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {draft.photoDataUrl ? "Your photo is ready to preview." : "Your initials appear until you add a photo."}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Preview only. Changes are saved in this browser when you select “Save profile”.
            </p>
          </aside>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">
            Your name
            <input
              required
              maxLength={80}
              value={draft.displayName}
              onChange={(event) => updateField("displayName", event.target.value)}
              placeholder="Your full name"
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Phone number <span className="font-normal text-slate-500">(optional)</span>
            <input
              type="tel"
              autoComplete="tel"
              value={draft.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+234..."
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            State of origin <span className="font-normal text-slate-500">(optional)</span>
            <input
              value={draft.stateOfOrigin}
              onChange={(event) => updateField("stateOfOrigin", event.target.value)}
              placeholder="e.g. Oyo"
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Where are you based?
            <select
              value={draft.state}
              onChange={(event) => {
                updateField("state", event.target.value);
                updateField("area", "");
              }}
              className={fieldClass}
            >
              <option value="">Choose a state</option>
              {launchStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Area
            <select
              value={draft.area}
              onChange={(event) => updateField("area", event.target.value)}
              disabled={!draft.state}
              className={fieldClass}
            >
              <option value="">Choose an area</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {isProvider ? (
        <>
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div>
              <h2 className="text-xl font-bold text-[#142236]">Your work profile</h2>
              <p className="mt-1 text-sm text-slate-600">
                Help hirers understand your experience, skills, and the work you offer.
              </p>
            </div>
            <label className="mt-5 block text-sm font-semibold text-slate-800">
              About you
              <textarea
                required
                maxLength={1000}
                value={draft.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                placeholder="Tell people about your experience, strengths, and the kind of support you provide."
                className={textAreaClass}
              />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                Years of experience
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={draft.experienceYears}
                  onChange={(event) => updateField("experienceYears", event.target.value)}
                  placeholder="e.g. 4"
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Availability
                <input
                  value={draft.availability}
                  onChange={(event) => updateField("availability", event.target.value)}
                  placeholder="e.g. Available now"
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Previous work experience
                <textarea
                  value={draft.previousWork}
                  onChange={(event) => updateField("previousWork", event.target.value)}
                  placeholder={"One role per line, for example:\nHousehold assistant · Lekki · 2022–2024"}
                  className={textAreaClass}
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Share only details you’re comfortable showing. Don’t include a past
                  employer’s private contact details.
                </span>
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Qualifications or training
                <textarea
                  value={draft.qualifications}
                  onChange={(event) => updateField("qualifications", event.target.value)}
                  placeholder="Separate each with a comma"
                  className={textAreaClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Languages <span className="font-normal text-rose-700">· required</span>
                <textarea
                  value={draft.languages}
                  onChange={(event) => updateField("languages", event.target.value)}
                  placeholder="e.g. English, Yoruba"
                  required
                  className={textAreaClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Expected monthly pay
                <input
                  value={draft.expectedSalary}
                  onChange={(event) => updateField("expectedSalary", event.target.value)}
                  placeholder="e.g. ₦100,000–₦140,000, depending on duties"
                  className={fieldClass}
                />
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-slate-800">
                Skills and services you offer
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {workerSkills.map((skill) => (
                  <label
                    key={skill}
                    className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                      draft.skills.includes(skill)
                        ? "border-amber-400 bg-amber-50 font-semibold text-amber-950"
                        : "border-slate-200 text-slate-700 hover:border-amber-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={draft.skills.includes(skill)}
                      onChange={() => toggleListValue("skills", skill)}
                      className="accent-amber-600"
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-slate-800">
                Work arrangements you can consider
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {workArrangements.map((arrangement) => (
                  <label
                    key={arrangement}
                    className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                      draft.arrangements.includes(arrangement)
                        ? "border-amber-400 bg-amber-50 font-semibold text-amber-950"
                        : "border-slate-200 text-slate-700 hover:border-amber-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={draft.arrangements.includes(arrangement)}
                      onChange={() => toggleListValue("arrangements", arrangement)}
                      className="accent-amber-600"
                    />
                    {arrangement}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Demo profile only: work history and qualifications are self-entered and
            haven’t been checked. Ratings and likes will appear only after real
            interactions are connected.
          </aside>
        </>
      ) : (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <h2 className="text-xl font-bold text-[#142236]">What are you looking for?</h2>
            <p className="mt-1 text-sm text-slate-600">
              We’ll use these preferences to show household professionals who may
              suit your needs.
            </p>
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-slate-800">
              Services you need
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {householdSkills.map((skill) => (
                <label
                  key={skill}
                  className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                    draft.serviceNeeds.includes(skill)
                      ? "border-amber-400 bg-amber-50 font-semibold text-amber-950"
                      : "border-slate-200 text-slate-700 hover:border-amber-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={draft.serviceNeeds.includes(skill)}
                    onChange={() => toggleListValue("serviceNeeds", skill)}
                    className="accent-amber-600"
                  />
                  {skill}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">
              Work arrangement
              <select
                value={draft.workArrangement}
                onChange={(event) => updateField("workArrangement", event.target.value)}
                className={fieldClass}
              >
                <option value="">Any arrangement</option>
                {workArrangements.map((arrangement) => (
                  <option key={arrangement} value={arrangement}>
                    {arrangement}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Monthly budget
              <input
                value={draft.monthlyBudget}
                onChange={(event) => updateField("monthlyBudget", event.target.value)}
                placeholder="e.g. ₦100,000–₦140,000"
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
              When do you need help?
              <input
                value={draft.startTiming}
                onChange={(event) => updateField("startTiming", event.target.value)}
                placeholder="e.g. As soon as possible"
                className={fieldClass}
              />
            </label>
          </div>
          <label className="mt-5 block text-sm font-semibold text-slate-800">
            Anything else a professional should know?
            <textarea
              value={draft.bio}
              onChange={(event) => updateField("bio", event.target.value)}
              placeholder="Share helpful details about your household needs. Please don’t include your exact home address."
              className={textAreaClass}
            />
          </label>
        </section>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
          Profile saved in this browser.
        </p>
      )}
      <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#142236] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20334c] disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-48"
        >
          {isSaving ? "Saving..." : saved ? "Profile saved" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
