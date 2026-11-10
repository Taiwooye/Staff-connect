"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./auth/auth-context";

const navigationLinks = [
  { href: "/", label: "Home", detail: "Back to the welcome page" },
  { href: "/maids", label: "Find household help", detail: "Browse local profiles" },
  { href: "/#categories", label: "Services", detail: "Explore types of support" },
  { href: "/#how-it-works", label: "How it works", detail: "See how StaffConnect works" },
  { href: "/about", label: "About us", detail: "Learn what StaffConnect is building" },
  { href: "/contact", label: "Contact us", detail: "Find the right way to get started" },
  {
    href: "/signup?role=provider&next=%2Faccount",
    label: "For professionals",
    detail: "Create a Provider account",
  },
];

export default function SiteNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { status, accountType, authError, signOut } = useAuth();
  const accountLabel = accountType === "client" ? "Client" : "Provider";
  const accountLinks = status === "signed-in"
    ? [
          {
            href: "/account",
            label: `My account · ${accountLabel}`,
            detail: `You’re signed in as a ${accountLabel}.`,
          },
        ]
    : status === "loading"
      ? [
          {
            href: "/account",
            label: "Checking your account...",
            detail: "Please wait a moment",
          },
        ]
      : [
          {
            href: "/signin?next=%2Faccount",
            label: "Sign in",
            detail: "Continue to your StaffConnect account",
          },
          {
            href: "/signup",
            label: "Create an account",
            detail: "Choose a Client or Provider account",
          },
        ];

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  async function handleSignOut() {
    if (await signOut()) closeMenu();
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#142236]/75 text-white shadow-lg shadow-slate-950/5 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-3 sm:h-[76px] sm:px-8">
          <button
            type="button"
            className="group flex min-w-0 shrink items-center gap-2 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 sm:gap-2.5"
            aria-label="Open StaffConnect navigation"
            aria-expanded={isOpen}
            aria-controls="site-navigation-drawer"
            onClick={() => setIsOpen(true)}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-base font-extrabold text-[#142236] shadow-md shadow-amber-950/20 transition-transform group-hover:rotate-[-5deg] sm:h-10 sm:w-10 sm:text-lg">
              S
            </span>
            <span className="truncate text-base font-bold tracking-tight sm:text-xl">
              Staff<span className="text-amber-300">Connect</span>
            </span>
          </button>

          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            <Link href="/#how-it-works" className="text-sm font-medium text-slate-200 transition hover:text-white">
              How it works
            </Link>
            <Link href="/#categories" className="text-sm font-medium text-slate-200 transition hover:text-white">
              Services
            </Link>
            <Link
              href={
                status === "signed-in" && accountType === "provider"
                  ? "/onboarding/provider"
                  : "/signup?role=provider&next=%2Faccount"
              }
              className="text-sm font-medium text-slate-200 transition hover:text-white"
            >
              For professionals
            </Link>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
            {status === "signed-in" && accountType ? (
              <Link
                href="/account"
                aria-label={`My account, signed in as a ${accountLabel}`}
                className="rounded-full border border-white/25 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:px-3 sm:text-sm"
              >
                {accountLabel}
              </Link>
            ) : status === "signed-out" || status === "unconfigured" ? (
              <>
                <Link
                  href="/signin?next=%2Faccount"
                  className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/35 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:min-h-10 sm:px-4 sm:text-sm"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-9 items-center justify-center rounded-full bg-amber-400 px-2.5 py-2 text-xs font-bold text-[#142236] shadow-md shadow-amber-950/20 transition hover:bg-amber-300 sm:min-h-10 sm:px-4 sm:text-sm"
                >
                  Sign up
                </Link>
              </>
            ) : null}
          </div>

          <Link
            href="/maids"
            className="hidden shrink-0 rounded-full bg-amber-400 px-3 py-2 text-xs font-bold text-[#142236] shadow-md shadow-amber-950/20 transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 md:inline-flex sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <span className="sm:hidden">Find help</span>
            <span className="hidden sm:inline">Find household help</span>
          </Link>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] transition-[visibility] duration-300 ${
          isOpen ? "visible" : "invisible"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          tabIndex={isOpen ? 0 : -1}
          className={`absolute inset-0 h-full w-full bg-slate-950/20 backdrop-blur-[2px] transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closeMenu}
        />
        <aside
          id="site-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="StaffConnect navigation"
          className={`absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col border-r border-white/60 bg-white/80 p-5 text-slate-800 shadow-2xl shadow-slate-950/15 backdrop-blur-2xl transition-transform duration-300 ease-out sm:p-7 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 font-extrabold text-[#142236]">
                S
              </span>
              <span className="text-lg font-bold tracking-tight text-[#142236]">
                Staff<span className="text-amber-700">Connect</span>
              </span>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl text-slate-600 transition hover:bg-white hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              aria-label="Close navigation menu"
              tabIndex={isOpen ? 0 : -1}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            Explore StaffConnect
          </p>
          <nav aria-label="Side navigation" className="flex flex-col gap-1">
            {[...navigationLinks, ...accountLinks].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                tabIndex={isOpen ? 0 : -1}
                className="group rounded-xl px-3 py-3 transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <span className="block font-semibold text-[#142236]">{item.label}</span>
                <span className="mt-0.5 block text-sm text-slate-500 transition group-hover:text-slate-700">
                  {item.detail}
                </span>
              </Link>
            ))}
          </nav>

          {status === "signed-in" && (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              tabIndex={isOpen ? 0 : -1}
              className="mt-4 rounded-xl border border-slate-200 px-3 py-3 text-left font-semibold text-slate-700 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              Sign out
            </button>
          )}
          {authError && (
            <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
              {authError}
            </p>
          )}

          <p className="mt-auto border-t border-slate-200/80 pt-5 text-xs leading-5 text-slate-500">
            A thoughtful way to find the right support for your home.
          </p>
        </aside>
      </div>
    </>
  );
}
