"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  useProfileDraft,
  type HouseholdProfileDraft,
  type ProviderProfileDraft,
} from "./profile-draft-context";

type Role = "client" | "provider";

type FormDraft = {
  name: string;
  email: string;
  phone: string;
  area: string;
  needs: string[];
  arrangement: string;
  arrangements: string[];
  budget: string;
  startTiming: string;
  skills: string[];
  experience: string;
  availability: string;
  salary: string;
  bio: string;
};

const areas = ["Ajah", "Ikeja", "Lekki", "Surulere", "Yaba", "Other Lagos area"];
const householdNeeds = ["Cleaning", "Laundry", "Cooking", "Childcare"];
const providerSkills = ["Cleaning", "Laundry", "Cooking", "Childcare"];
const workArrangements = ["Live-in", "Daily", "Weekends"];

const documentGuidance = {
  client: [
    "Government-issued identity document, checked through an approved verification process.",
    "Proof of address, only if needed for the agreed verification purpose.",
  ],
  provider: [
    "Government-issued identity document, checked through an approved verification process.",
    "Work references or a guarantor, with the referee’s knowledge and consent.",
    "Payout account details only when setting up a payment with an approved payment provider.",
  ],
};

const initialDraft: FormDraft = {
  name: "",
  email: "",
  phone: "",
  area: "",
  needs: [],
  arrangement: "",
  arrangements: [],
  budget: "",
  startTiming: "",
  skills: [],
  experience: "",
  availability: "",
  salary: "",
  bio: "",
};

export default function OnboardingFlow({ role }: { role: Role }) {
  const router = useRouter();
  const { saveHouseholdProfile, saveProviderProfile } = useProfileDraft();
  const [draft, setDraft] = useState<FormDraft>(initialDraft);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const isClient = role === "client";
  const stepTitles = ["Contact", "Your needs", "Verification & review"];
  const pageTitle = isClient ? "Set up your household profile" : "Set up your work profile";

  function updateDraft<Key extends keyof FormDraft>(key: Key, value: FormDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleChoice(key: "needs" | "skills" | "arrangements", value: string) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((choice) => choice !== value)
        : [...current[key], value],
    }));
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (step === 1) {
      const selections = isClient ? draft.needs : draft.skills;

      if (selections.length === 0) {
        setError(
          isClient
            ? "Choose at least one kind of help."
            : "Choose at least one skill for your profile.",
        );
        return;
      }

      if (isClient && !draft.arrangement) {
        setError("Choose the work arrangement that suits your household.");
        return;
      }

      if (!isClient && draft.arrangements.length === 0) {
        setError("Choose at least one work arrangement.");
        return;
      }
    }

    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    const displayName = draft.name.trim();

    if (isClient) {
      const profile: HouseholdProfileDraft = {
        displayName,
        area: draft.area,
        needs: draft.needs,
        arrangement: draft.arrangement,
        budget: draft.budget,
        startTiming: draft.startTiming,
      };
      saveHouseholdProfile(profile);
      router.push("/profiles/household");
      return;
    }

    const profile: ProviderProfileDraft = {
      displayName,
      area: draft.area,
      skills: draft.skills,
      arrangements: draft.arrangements,
      experience: draft.experience,
      availability: draft.availability,
      salary: draft.salary,
      bio: draft.bio.trim(),
    };
    saveProviderProfile(profile);
    router.push("/profiles/provider");
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/onboarding"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Choose account type
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            {isClient ? "Employer" : "Housemaid"} · Lagos, Nigeria
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {pageTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Three short steps. Email and phone stay in this temporary form and are discarded
            when you preview your profile.
          </p>
        </div>

        <aside className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <strong>Demo only:</strong> Use fictional information. This form does not create an
          account or transmit or save your details. Do not enter real contact information,
          upload documents, or share NIN, BVN, bank credentials, or full home addresses.
        </aside>

        <ol
          aria-label="Profile setup progress"
          className="mt-8 grid list-none grid-cols-3 gap-2 p-0"
        >
          {stepTitles.map((title, index) => {
            const active = step === index;
            const complete = step > index;

            return (
              <li
                key={title}
                aria-current={active ? "step" : undefined}
                className={`border-t-2 pt-2 text-xs font-medium sm:text-sm ${
                  active || complete
                    ? "border-amber-500 text-amber-800"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                <span className="mr-1">{String(index + 1).padStart(2, "0")}</span>
                {title}
              </li>
            );
          })}
        </ol>

        <form
          onSubmit={submitStep}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {step === 0 && (
            <section aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="text-xl font-semibold">
                How can we identify your profile?
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Contact verification is a future step; this demo sends no code.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  {isClient ? "Your name" : "Name to show on your profile"}
                  <input
                    autoComplete="name"
                    required
                    maxLength={80}
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    placeholder="Use a fictional name"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Email address
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={draft.email}
                    onChange={(event) => updateDraft("email", event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Nigerian phone number
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={20}
                    value={draft.phone}
                    onChange={(event) => updateDraft("phone", event.target.value)}
                    placeholder="+234 800 000 0000"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Lagos neighbourhood
                  <select
                    required
                    value={draft.area}
                    onChange={(event) => updateDraft("area", event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">Choose an area</option>
                    {areas.map((area) => (
                      <option key={area}>{area}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          )}

          {step === 1 && isClient && (
            <section aria-labelledby="needs-heading">
              <h2 id="needs-heading" className="text-xl font-semibold">
                What help does your household need?
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Keep it general. Don’t include children’s names, your full address, or
                sensitive household details.
              </p>
              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-medium text-slate-700">
                  Type of help <span className="text-rose-600">*</span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {householdNeeds.map((need) => (
                    <label
                      key={need}
                      className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={draft.needs.includes(need)}
                        onChange={() => toggleChoice("needs", need)}
                        className="h-4 w-4 accent-amber-600"
                      />
                      {need}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Work arrangement
                  <select
                    required
                    value={draft.arrangement}
                    onChange={(event) => updateDraft("arrangement", event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">Choose an arrangement</option>
                    {workArrangements.map((arrangement) => (
                      <option key={arrangement}>{arrangement}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Monthly salary range (optional)
                  <select
                    value={draft.budget}
                    onChange={(event) => updateDraft("budget", event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">Not decided yet</option>
                    <option>Under ₦100,000</option>
                    <option>₦100,000–₦150,000</option>
                    <option>₦150,000–₦200,000</option>
                    <option>Over ₦200,000</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  When do you need help? (optional)
                  <select
                    value={draft.startTiming}
                    onChange={(event) => updateDraft("startTiming", event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">I’m flexible</option>
                    <option>As soon as possible</option>
                    <option>Within 2 weeks</option>
                    <option>Within a month</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          {step === 1 && !isClient && (
            <section aria-labelledby="skills-heading">
              <h2 id="skills-heading" className="text-xl font-semibold">
                Tell us about the work you’re looking for
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Share work preferences, not identity numbers or private documents.
              </p>
              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-medium text-slate-700">
                  Your skills <span className="text-rose-600">*</span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {providerSkills.map((skill) => (
                    <label
                      key={skill}
                      className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={draft.skills.includes(skill)}
                        onChange={() => toggleChoice("skills", skill)}
                        className="h-4 w-4 accent-amber-600"
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-medium text-slate-700">
                  Work arrangement <span className="text-rose-600">*</span>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {workArrangements.map((arrangement) => (
                    <label
                      key={arrangement}
                      className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={draft.arrangements.includes(arrangement)}
                        onChange={() =>
                          toggleChoice("arrangements", arrangement)
                        }
                        className="h-4 w-4 accent-amber-600"
                      />
                      {arrangement}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Years of experience
                  <select
                    value={draft.experience}
                    onChange={(event) => updateDraft("experience", event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">Prefer not to say</option>
                    <option>New to this work</option>
                    <option>1–2 years</option>
                    <option>3–5 years</option>
                    <option>6+ years</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Expected monthly salary (optional)
                  <select
                    value={draft.salary}
                    onChange={(event) => updateDraft("salary", event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">Let’s discuss</option>
                    <option>Under ₦100,000</option>
                    <option>₦100,000–₦150,000</option>
                    <option>₦150,000–₦200,000</option>
                    <option>Over ₦200,000</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Availability
                  <select
                    value={draft.availability}
                    onChange={(event) => updateDraft("availability", event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">Choose availability</option>
                    <option>Available now</option>
                    <option>Available within 2 weeks</option>
                    <option>Available within a month</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Short introduction (optional)
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={draft.bio}
                    onChange={(event) => updateDraft("bio", event.target.value)}
                    placeholder="Describe your work experience. Avoid contact details and identity numbers."
                    className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                  <span className="mt-1 block text-right text-xs font-normal text-slate-400">
                    {draft.bio.length}/300
                  </span>
                </label>
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="verification-heading">
              <h2 id="verification-heading" className="text-xl font-semibold">
                {isClient ? "What to prepare before verification" : "Verification and safety"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Identity checks are not part of this demo. The list below is planning
                guidance, not a final legal or provider-approved requirement.
              </p>
              <ul className="mt-5 space-y-3">
                {documentGuidance[role].map((document) => (
                  <li
                    key={document}
                    className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700"
                  >
                    <span aria-hidden="true" className="font-semibold text-amber-700">
                      →
                    </span>
                    <span>{document}</span>
                  </li>
                ))}
              </ul>
              <aside className="mt-5 rounded-lg border border-slate-200 p-4 text-sm leading-relaxed text-slate-600">
                Never collect or share BVN, bank login details, or a guarantor’s personal
                details in a public profile. Before launch, confirm lawful purpose, consent,
                retention, and secure handling with Nigerian privacy counsel and the chosen
                verification and payment providers. Confirm age eligibility and household
                safeguarding requirements for Lagos before launch; this demo does not collect
                dates of birth or identity numbers.
              </aside>
              <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                <strong>Profile visibility:</strong> Your home address, phone, email,
                identity information, and referee details are not included in your profile
                preview.
              </p>
              <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                <input
                  required
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-amber-600"
                />
                I understand this is a fictional demo. My information will not be sent,
                stored, verified, or published.
              </label>
            </section>
          )}

          {error && (
            <p role="alert" className="mt-5 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep((current) => current - 1);
                }}
                className="min-h-11 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              {step === 2 ? "Preview my profile" : "Continue"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          Document requirements depend on the verification provider and use case. This
          prototype is not legal advice. Review privacy obligations with the{" "}
          <a
            href="https://ndpc.gov.ng/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-amber-800 underline underline-offset-2"
          >
            Nigeria Data Protection Commission
          </a>
          .
        </p>
      </div>
    </main>
  );
}
