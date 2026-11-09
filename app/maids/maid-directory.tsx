"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAreasForState, launchStates } from "../locations";
import { useProfileDraft } from "../onboarding/profile-draft-context";
import { maidProfiles } from "./maid-profiles";
import {
  allHouseholdSkills,
  serviceFilters,
  type ServiceCategoryId,
} from "./services";

const arrangements = ["Any arrangement", "Live-in", "Daily", "Weekends"] as const;
const sortOptions = [
  "recommended",
  "location",
  "experience",
  "gender",
  "availability",
  "arrangement",
  "salary-low",
  "salary-high",
] as const;

type SortOrder = (typeof sortOptions)[number];

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function availabilityRank(availability: string) {
  if (availability === "Available now") return 0;
  if (availability.includes("2 weeks")) return 1;
  if (availability === "Available this month") return 2;
  return 3;
}

export default function MaidDirectory({
  initialService,
}: {
  initialService: ServiceCategoryId;
}) {
  const router = useRouter();
  const {
    savedProfileIds,
    toggleSavedProfile,
    providerProfileSaved,
  } = useProfileDraft();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [area, setArea] = useState("");
  const serviceId = initialService;
  const [arrangement, setArrangement] =
    useState<(typeof arrangements)[number]>("Any arrangement");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recommended");
  const [showFilters, setShowFilters] = useState(initialService !== "all");
  const service =
    serviceFilters.find((option) => option.id === serviceId) ?? serviceFilters[0];
  const skills = serviceId === "all" ? allHouseholdSkills : service.skills;

  function changeService(value: string) {
    const nextService = serviceFilters.find((option) => option.id === value);
    if (!nextService) return;

    setSelectedSkills([]);
    setShowFilters(true);
    router.push(
      nextService.id === "all" ? "/maids" : `/maids?service=${nextService.id}`,
      { scroll: false },
    );
  }

  const areaOptions = state
    ? getAreasForState(state)
    : launchStates.flatMap((locationState) => getAreasForState(locationState));

  const search = query.trim().toLowerCase();
  const matches = maidProfiles.filter((profile) => {
      const matchesSearch =
        !search ||
        [
          profile.name,
          profile.state,
          profile.area,
          profile.experience,
          profile.gender,
          ...profile.skills,
          ...profile.qualifications,
          ...profile.languages,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesState = !state || profile.state === state;
      const matchesArea = !area || profile.area === area;
      const matchesArrangement =
        arrangement === "Any arrangement" || profile.arrangement === arrangement;
      const matchesService =
        serviceId === "all" || service.skills.some((skill) => profile.skills.includes(skill));
      const matchesSkills = selectedSkills.every((skill) => profile.skills.includes(skill));
      const matchesSaved = !showSavedOnly || savedProfileIds.includes(profile.id);

      return (
        matchesSearch &&
        matchesState &&
        matchesArea &&
        matchesArrangement &&
        matchesService &&
        matchesSkills &&
        matchesSaved
      );
  });
  const filteredProfiles = [...matches].sort((first, second) => {
    switch (sortOrder) {
      case "location":
        return first.state.localeCompare(second.state) || first.area.localeCompare(second.area);
      case "experience":
        return second.experienceYears - first.experienceYears;
      case "gender":
        return first.gender.localeCompare(second.gender);
      case "availability":
        return availabilityRank(first.availability) - availabilityRank(second.availability);
      case "arrangement":
        return (
          arrangements.indexOf(first.arrangement) - arrangements.indexOf(second.arrangement)
        );
      case "salary-low":
        return first.salaryMin - second.salaryMin;
      case "salary-high":
        return second.salaryMin - first.salaryMin;
      default:
        return 0;
    }
  });

  function toggleSkill(skill: string) {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((selected) => selected !== skill)
        : [...current, skill],
    );
  }

  function clearFilters() {
    setQuery("");
    setState("");
    setArea("");
    setArrangement("Any arrangement");
    setSelectedSkills([]);
    setShowSavedOnly(false);
    setSortOrder("recommended");
    router.replace("/maids", { scroll: false });
  }

  const activeFilters = [
    ...(serviceId !== "all" ? [service.label] : []),
    ...(query.trim() ? [`Search: ${query.trim()}`] : []),
    ...(state ? [state] : []),
    ...(area ? [area] : []),
    ...(arrangement !== "Any arrangement" ? [arrangement] : []),
    ...selectedSkills,
    ...(showSavedOnly ? ["Saved profiles"] : []),
  ];
  const activeFilterCount = activeFilters.length;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-7 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <span aria-hidden="true" className="mx-2 text-slate-300">
            /
          </span>
          <span aria-current="page" className="font-medium text-slate-700">
            Find professionals
          </span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <span aria-hidden="true">⌖</span> Lagos and Oyo, Nigeria
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find household professionals near you.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Browse sample profiles currently available in Lagos and Oyo. Compare skills,
            qualifications, location, and work arrangements.
          </p>
        </div>

        {providerProfileSaved && (
          <aside
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950"
          >
            <strong>Your provider profile draft is saved for this tab.</strong>{" "}
            It is not published or visible to clients. Explore the sample household
            listings below; your draft will clear when this session ends.
          </aside>
        )}

        <aside
          aria-label="Sample listing notice"
          className="mb-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"
        >
          <span aria-hidden="true" className="mt-0.5 text-lg">
            ℹ
          </span>
          <p>
            <strong>Prototype listings:</strong> These sample profiles are for preview only.
            No identity checks or references have been completed, so they are not verified
            candidates.
          </p>
        </aside>

        <section
          aria-labelledby="filters-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="filters-heading" className="text-sm font-semibold text-slate-800">
              Find a better match
            </h2>
            <button
              type="button"
              aria-controls="directory-filters"
              aria-expanded={showFilters}
              onClick={() => setShowFilters((current) => !current)}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 sm:self-auto"
            >
              <span aria-hidden="true">☷</span>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              <span aria-hidden="true">{showFilters ? "−" : "+"}</span>
            </button>
          </div>
          {showFilters && (
            <div id="directory-filters" className="mt-5 border-t border-slate-100 pt-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.2fr_1fr_1fr_1fr]">
                <label className="text-sm font-medium text-slate-700">
                  Type of help
                  <select
                    value={serviceId}
                    onChange={(event) => changeService(event.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    {serviceFilters.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
              Name or skill
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try cooking or Amara"
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </label>
                <label className="text-sm font-medium text-slate-700">
              State
              <select
                value={state}
                onChange={(event) => {
                  setState(event.target.value);
                  setArea("");
                }}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">All launch locations</option>
                {launchStates.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
                <label className="text-sm font-medium text-slate-700">
              City / area
              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">All areas</option>
                {areaOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
                <label className="text-sm font-medium text-slate-700">
              Work arrangement
              <select
                value={arrangement}
                onChange={(event) =>
                  setArrangement(event.target.value as (typeof arrangements)[number])
                }
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                {arrangements.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-medium text-slate-700">
                  Skills for {service.label.toLowerCase()}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const selected = selectedSkills.includes(skill);

                    return (
                      <button
                        key={skill}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          selected
                            ? "border-amber-500 bg-amber-50 font-medium text-amber-900"
                            : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <button
                type="button"
                aria-pressed={showSavedOnly}
                onClick={() => setShowSavedOnly((current) => !current)}
                className={`mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  showSavedOnly
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-700"
                }`}
              >
                <span aria-hidden="true">♡</span>
                Saved profiles <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs">{savedProfileIds.length}</span>
              </button>
              <p className="mt-2 text-xs text-slate-500">
                Saved profiles are kept for this browser session only.
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="results-heading" className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="results-heading" className="text-xl font-semibold">
                {serviceId === "all" ? "Household professionals" : service.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500" aria-live="polite">
                {filteredProfiles.length} sample{" "}
                {filteredProfiles.length === 1 ? "profile" : "profiles"}
                {serviceId !== "all" ? ` for ${service.label.toLowerCase()}` : ""}
              </p>
              {activeFilters.length > 0 && (
                <p className="mt-2 text-sm text-amber-900">
                  <span className="font-semibold">Filters applied:</span>{" "}
                  {activeFilters.join(" · ")}
                </p>
              )}
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                >
                  Clear filters
                </button>
              )}
              <label className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                Sort
                <select
                  value={sortOrder}
                  onChange={(event) => {
                    const selectedSort = sortOptions.find(
                      (option) => option === event.target.value,
                    );
                    if (selectedSort) {
                      setSortOrder(selectedSort);
                    }
                  }}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 sm:flex-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="location">Location: state and area</option>
                  <option value="experience">Experience: most first</option>
                  <option value="gender">Gender: A to Z</option>
                  <option value="availability">Availability: soonest</option>
                  <option value="arrangement">Work arrangement</option>
                  <option value="salary-low">Salary: low to high</option>
                  <option value="salary-high">Salary: high to low</option>
                </select>
              </label>
            </div>
          </div>

          {filteredProfiles.length > 0 ? (
            <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
              {filteredProfiles.map((profile) => (
                <li
                  key={profile.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <article>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Link
                          href={`/maids/${profile.id}`}
                          aria-label={`View ${profile.name}'s profile`}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-900 transition hover:ring-2 hover:ring-amber-400"
                        >
                          {profile.initials}
                        </Link>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold">
                            <Link href={`/maids/${profile.id}`} className="transition hover:text-amber-800">
                              {profile.name}
                            </Link>
                          </h3>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {profile.area}, {profile.state} · {profile.gender} · {profile.experience}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Sample
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-md bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-900">
                        {profile.arrangement}
                      </span>
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-slate-100 px-2.5 py-1 text-sm text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">Qualifications:</span>{" "}
                      {profile.qualifications.slice(0, 2).join(" · ")}
                    </p>

                    <div className="mt-5 flex flex-col gap-1 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Expected monthly salary
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {naira.format(profile.salaryMin)}–{naira.format(profile.salaryMax)}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500">{profile.availability}</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <Link
                        href={`/maids/${profile.id}`}
                        className="text-sm font-semibold text-amber-800 hover:text-amber-600"
                      >
                        View full profile <span aria-hidden="true">→</span>
                      </Link>
                      <button
                        type="button"
                        aria-pressed={savedProfileIds.includes(profile.id)}
                        aria-label={
                          savedProfileIds.includes(profile.id)
                            ? `Remove ${profile.name} from saved profiles`
                            : `Save ${profile.name} profile`
                        }
                        onClick={() => toggleSavedProfile(profile.id)}
                        className={`flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                          savedProfileIds.includes(profile.id)
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-700"
                        }`}
                      >
                        <span aria-hidden="true">{savedProfileIds.includes(profile.id) ? "♥" : "♡"}</span>
                        {savedProfileIds.includes(profile.id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-800">
                {showSavedOnly && savedProfileIds.length === 0
                  ? "You haven’t saved any profiles yet"
                  : serviceId !== "all"
                    ? `No sample profiles for ${service.label.toLowerCase()} yet`
                    : "No profiles match those filters"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {showSavedOnly && savedProfileIds.length === 0
                  ? "Save a professional’s profile to find it here during this session."
                  : serviceId !== "all"
                    ? "This category is ready for matching listings when the endpoint is connected. We’ll only show profiles with skills for this kind of work."
                    : "Try another location or remove a skill to see more sample profiles."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
