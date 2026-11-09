import Link from "next/link";
import { serviceCategories } from "./maids/services";

const steps = [
  {
    num: "01",
    title: "Tell us what you need",
    desc: "Share the kind of help you’re looking for, your location, and your preferred schedule.",
  },
  {
    num: "02",
    title: "Explore your options",
    desc: "Review profiles, experience, skills, and availability to find the right fit.",
  },
  {
    num: "03",
    title: "Connect with confidence",
    desc: "Get in touch, discuss expectations, and take the next step when you’re ready.",
  },
];

const assurances = [
  { icon: "✓", title: "Profiles you can review", detail: "See skills and experience up front" },
  { icon: "⌖", title: "Search close to home", detail: "Find household help in your area" },
  { icon: "♡", title: "A better fit for both", detail: "Clear needs, schedules, and expectations" },
];

export default function HomePage() {
  return (
    <>
      <main>
        <section className="home-motion relative isolate overflow-hidden bg-[#fbf8f2] px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
          <div aria-hidden="true" className="home-glow home-glow--amber absolute -right-32 -top-32 -z-10 h-[34rem] w-[34rem] rounded-full bg-amber-200/30 blur-3xl" />
          <div aria-hidden="true" className="home-glow home-glow--orange absolute -bottom-48 left-[-10rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-100/70 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="home-intro max-w-2xl">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-800 shadow-sm">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
                Trusted help for a happier home
              </p>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-[#172638] sm:text-6xl lg:text-[4.35rem]">
                More ease at home starts with the <span className="text-amber-600">right help.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Find household professionals who fit your needs, routine, and location — all in one welcoming place.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/maids"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#142236] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-[#20334c]"
                >
                  Find household help <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/onboarding/provider"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-bold text-[#172638] transition hover:border-amber-400 hover:bg-white"
                >
                  Create a staff profile
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                  Profiles with skills and experience
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                  Made for households in Nigeria
                </span>
              </div>
            </div>

            <div className="home-showcase relative mx-auto w-full max-w-[550px]">
              <div aria-hidden="true" className="absolute inset-8 rotate-[-5deg] rounded-[2.5rem] bg-amber-300/50" />
              <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-[0_30px_90px_-35px_rgba(27,39,54,0.35)] sm:p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700">A better way to hire</p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-[#172638]">Your home, in good hands.</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#142236] text-xl text-amber-300" aria-hidden="true">⌂</span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-[#f7f8f6] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl" aria-hidden="true">🧹</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800">Household support that fits</p>
                        <p className="mt-1 text-sm text-slate-500">Explore skills, experience, and schedules</p>
                      </div>
                      <span className="text-lg text-slate-400" aria-hidden="true">↗</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-xl" aria-hidden="true">👶</span>
                      <p className="mt-3 text-sm font-bold text-slate-800">Care & childcare</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Support for the people you love</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl" aria-hidden="true">🍳</span>
                      <p className="mt-3 text-sm font-bold text-slate-800">Everyday home help</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Make more room in your day</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#142236] px-4 py-3.5 text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-amber-300" aria-hidden="true">⌖</span>
                  <div>
                    <p className="text-sm font-bold">Start with your neighborhood</p>
                    <p className="mt-0.5 text-xs text-slate-300">Browse local profiles at your pace</p>
                  </div>
                  <span className="ml-auto text-amber-300" aria-hidden="true">→</span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700" aria-hidden="true">✓</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Find your fit</p>
                  <p className="text-xs text-slate-500">Skills that match your needs</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-motion border-y border-slate-100 bg-white px-5 py-8 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-3 sm:gap-8">
            {assurances.map((item, index) => (
              <div
                key={item.title}
                className="home-assurance flex items-start gap-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg font-bold text-amber-700" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="font-bold text-[#172638]">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="categories" className="home-motion scroll-mt-28 bg-white px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Support for your day-to-day</p>
                <h2 className="text-3xl font-bold tracking-tight text-[#172638] sm:text-4xl">Find the help you need at home.</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-500">From the everyday essentials to an extra pair of hands, start with the kind of support you’re looking for.</p>
              </div>
              <Link href="/maids" className="shrink-0 text-sm font-bold text-amber-800 transition hover:text-amber-600">
                Explore household profiles <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {serviceCategories.map((category, index) => (
                <Link
                  key={category.label}
                  href={`/maids?service=${category.id}`}
                  className="home-category-card group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-[#fffdf8] hover:shadow-lg hover:shadow-amber-900/5"
                  style={{ animationDelay: `${Math.min(index, 5) * 70}ms` }}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f8f6] text-2xl transition group-hover:bg-amber-100" aria-hidden="true">
                    {category.icon}
                  </span>
                  <span>
                    <span className="block font-bold text-[#172638]">{category.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{category.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="home-motion scroll-mt-28 bg-[#f6f7f5] px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Simple from the start</p>
              <h2 className="text-3xl font-bold tracking-tight text-[#172638] sm:text-4xl">A thoughtful way to find the right fit.</h2>
              <p className="mt-4 leading-7 text-slate-500">Take it one step at a time. You decide who to contact and when you’re ready.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.num}
                  className="home-step-card rounded-2xl border border-slate-100 bg-white p-7 shadow-sm sm:p-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-sm font-extrabold tracking-wide text-amber-800">{step.num}</span>
                  <h3 className="mt-6 text-lg font-bold text-[#172638]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#142236] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 sm:p-10 lg:flex-row lg:items-center lg:p-12">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">A little more breathing room</p>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to make home feel easier?</h2>
              <p className="mt-4 leading-7 text-slate-300">Explore profiles or tell us what kind of support would make a difference.</p>
            </div>
            <Link
              href="/onboarding/client"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-[#142236] transition hover:bg-amber-300"
            >
              Get started <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#0d1725] px-5 py-10 text-slate-400 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300" aria-label="StaffConnect home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-sm font-extrabold text-[#142236]">S</span>
              <span className="font-bold tracking-tight">Staff<span className="text-amber-300">Connect</span></span>
            </Link>
            <p className="mt-3 text-xs">© 2026 StaffConnect. All rights reserved.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link href="/maids" className="transition hover:text-white">Find household help</Link>
            <Link href="/onboarding/client" className="transition hover:text-white">Find help for your home</Link>
            <Link href="/onboarding/provider" className="transition hover:text-white">Create a staff profile</Link>
            <Link href="#how-it-works" className="transition hover:text-white">How it works</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
