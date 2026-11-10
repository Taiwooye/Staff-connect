import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "StaffConnect account",
  description: "Continue to your StaffConnect account.",
};

async function RedirectAuthPage({
  searchParams,
}: Pick<PageProps<"/auth">, "searchParams">): Promise<never> {
  const params = await searchParams;
  const mode = params.mode === "signin" ? "signin" : "signup";
  const destination = mode === "signin" ? "/signin" : "/signup";
  const search = new URLSearchParams();

  for (const key of ["next", "role", "error"] as const) {
    const value = params[key];
    if (typeof value === "string") search.set(key, value);
  }

  redirect(`${destination}${search.size ? `?${search.toString()}` : ""}`);
}

export default function AuthPage({
  searchParams,
}: PageProps<"/auth">) {
  return (
    <Suspense
      fallback={
        <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-16">
          <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-sm text-slate-600 shadow-sm">
            Taking you to your account page...
          </div>
        </main>
      }
    >
      <RedirectAuthPage searchParams={searchParams} />
    </Suspense>
  );
}
