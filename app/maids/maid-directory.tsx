"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Arrangement = "Live-in" | "Daily" | "Weekends";

type MaidProfile = {
  name: string;
  initials: string;
  area: string;
  arrangement: Arrangement;
  salaryMin: number;
  salaryMax: number;
  experience: string;
  skills: string[];
  availability: string;
  about: string;
};

const profiles: MaidProfile[] = [
  {
    name: "Amara Okafor",
    initials: "AO",
    area: "Lekki",
    arrangement: "Live-in",
    salaryMin: 120000,
    salaryMax: 150000,
    experience: "4 years’ experience",
    skills: ["Cleaning", "Laundry", "Cooking"],
    availability: "Available this month",
    about:
      "Experienced with daily home routines, laundry care, and preparing simple family meals.",
  },
  {
    name: "Chioma Eze",
    initials: "CE",
    area: "Ikeja",
    arrangement: "Daily",
    salaryMin: 100000,
    salaryMax: 130000,
    experience: "3 years’ experience",
    skills: ["Cleaning", "Childcare", "Laundry"],
    availability: "Available now",
    about:
      "Comfortable with a daily commute and helping families keep a tidy, child-friendly home.",
  },
  {
    name: "Aisha Bello",
    initials: "AB",
    area: "Yaba",
    arrangement: "Weekends",
    salaryMin: 60000,
    salaryMax: 80000,
    experience: "2 years’ experience",
    skills: ["Cleaning", "Cooking"],
    availability: "Available weekends",
    about:
      "Available for weekend cleaning and meal preparation, with a focus on consistent routines.",
  },
  {
    name: "Blessing Adeyemi",
    initials: "BA",
    area: "Surulere",
    arrangement: "Daily",
    salaryMin: 110000,
    salaryMax: 140000,
    experience: "5 years’ experience",
    skills: ["Cleaning", "Laundry", "Cooking", "Childcare"],
    availability: "Available in 2 weeks",
    about:
      "Has experience supporting busy households with cleaning, laundry, and supervised childcare.",
  },
  {
    name: "Grace Nwosu",
    initials: "GN",
    area: "Ajah",
    arrangement: "Live-in",
    salaryMin: 130000,
    salaryMax: 160000,
    experience: "6 years’ experience",
    skills: ["Cleaning", "Cooking", "Childcare"],
    availability: "Available now",
    about:
      "Seeking a live-in role and experienced in household upkeep and caring for young children.",
  },
  {
    name: "Kemi Ojo",
    initials: "KO",
    area: "Lekki",
    arrangement: "Weekends",
    salaryMin: 65000,
    salaryMax: 85000,
    experience: "3 years’ experience",
    skills: ["Cleaning", "Laundry"],
    availability: "Available weekends",
    about:
      "Available on weekends for home cleaning and laundry, with flexible start dates.",
  },
];

const arrangements = ["Any arrangement", "Live-in", "Daily", "Weekends"] as const;
const areas = ["All Lagos", "Ajah", "Ikeja", "Lekki", "Surulere", "Yaba"] as const;
const skills = ["Cleaning", "Laundry", "Cooking", "Childcare"] as const;

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function MaidDirectory() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<(typeof areas)[number]>("All Lagos");
  const [arrangement, setArrangement] =
    useState<(typeof arrangements)[number]>("Any arrangement");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"recommended" | "salary-low" | "salary-high">(
    "recommended",
  );

  const filteredProfiles = useMemo(() => {
    const search = query.trim().toLowerCase();
    const matches = profiles.filter((profile) => {
      const matchesSearch =
        !search ||
        [profile.name, profile.area, profile.experience, ...profile.skills]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesArea = area === "All Lagos" || profile.area === area;
      const matchesArrangement =
        arrangement === "Any arrangement" || profile.arrangement === arrangement;
      const matchesSkills = selectedSkills.every((skill) => profile.skills.includes(skill));

      return matchesSearch && matchesArea && matchesArrangement && matchesSkills;
    });

    if (sortOrder === "salary-low") {
      return matches.sort((first, second) => first.salaryMin - second.salaryMin);
    }

    if (sortOrder === "salary-high") {
      return matches.sort((first, second) => second.salaryMin - first.salaryMin);
    }

    return matches;
  }, [area, arrangement, query, selectedSkills, sortOrder]);

  function toggleSkill(skill: string) {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((selected) => selected !== skill)
        : [...current, skill],
    );
  }

  function clearFilters() {
    setQuery("");
    setArea("All Lagos");
    setArrangement("Any arrangement");
    setSelectedSkills([]);
    setSortOrder("recommended");
  }

  const hasFilters =
    query.trim() !== "" ||
    area !== "All Lagos" ||
    arrangement !== "Any arrangement" ||
    selectedSkills.length > 0;

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
            Find housemaids
          </span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <span aria-hidden="true">⌖</span> Lagos, Nigeria
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find the right help for your home.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Browse housemaid profiles and narrow your search by neighbourhood, skills, and
            work arrangement.
          </p>
        </div>

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
          <h2 id="filters-heading" className="mb-4 text-sm font-semibold text-slate-800">
            Search housemaids
          </h2>
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
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
              Neighbourhood
              <select
                value={area}
                onChange={(event) => setArea(event.target.value as (typeof areas)[number])}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                {areas.map((option) => (
                  <option key={option}>{option}</option>
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
            <legend className="mb-2 text-sm font-medium text-slate-700">Skills</legend>
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
        </section>

        <section aria-labelledby="results-heading" className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="results-heading" className="text-xl font-semibold">
                Housemaid profiles
              </h2>
              <p className="mt-1 text-sm text-slate-500" aria-live="polite">
                {filteredProfiles.length} sample{" "}
                {filteredProfiles.length === 1 ? "profile" : "profiles"}
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {hasFilters && (
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
                  onChange={(event) =>
                    setSortOrder(
                      event.target.value as "recommended" | "salary-low" | "salary-high",
                    )
                  }
                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 sm:flex-none"
                >
                  <option value="recommended">Recommended</option>
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
                  key={profile.name}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <article>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          aria-hidden="true"
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-900"
                        >
                          {profile.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold">{profile.name}</h3>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {profile.area}, Lagos · {profile.experience}
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

                    <details className="group mt-4 border-t border-slate-100 pt-4">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-amber-700 outline-none hover:text-amber-800 focus-visible:ring-2 focus-visible:ring-amber-500 [&::-webkit-details-marker]:hidden">
                        View sample profile
                        <span aria-hidden="true" className="ml-1 inline-block transition group-open:rotate-180">
                          ↓
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {profile.about}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-slate-500">
                        Sample information only. Identity, references, and work history have
                        not been checked.
                      </p>
                    </details>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-800">No profiles match those filters</p>
              <p className="mt-2 text-sm text-slate-500">
                Try another neighbourhood or remove a skill to see more sample profiles.
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
