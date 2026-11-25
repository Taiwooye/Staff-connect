"use client";

import Image from "next/image";

/**
 * Runs in <head> on every full page load, before React.
 *
 * The 5-second timing lives in CSS (see `.splash-screen` in globals.css), so the
 * countdown only starts once the loader is actually painted — on a slow first
 * load the browser shows nothing until the stylesheet arrives, and a JS timer
 * would expire before the loader was ever seen. These listeners react to the
 * CSS exit animation:
 *   active  → loader up, page scroll locked, page entrance animations paused
 *   leaving → loader fading out, page animations play underneath
 *   seen    → loader removed
 */
export const splashBootScript = `(function(){var r=document.documentElement;r.dataset.splash="active";
var exits={"splash-exit":1,"splash-skip-exit":1};
document.addEventListener("animationstart",function(e){if(exits[e.animationName]&&r.dataset.splash==="active")r.dataset.splash="leaving"},true);
document.addEventListener("animationend",function(e){if(exits[e.animationName])r.dataset.splash="seen"},true);})()`;

function skipSplash() {
  const root = document.documentElement;
  if (root.dataset.splash === "active") root.dataset.splash = "skipping";
}

export default function SplashScreen() {
  return (
    <div
      className="splash-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fbf8f2] px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading StaffConnect"
    >
      <Image
        src="/images/staffconnect-loader.svg"
        alt=""
        width={160}
        height={160}
        unoptimized
        preload
        className="h-36 w-36 sm:h-40 sm:w-40"
      />

      <p className="splash-wordmark mt-2 text-2xl font-bold tracking-[-0.03em] text-[#172638]" aria-hidden="true">
        Staff<span className="text-amber-600">Connect</span>
      </p>

      <p className="mt-3 flex items-center gap-1 text-sm text-slate-500">
        Loading
        <span className="splash-dot" aria-hidden="true">.</span>
        <span className="splash-dot" aria-hidden="true">.</span>
        <span className="splash-dot" aria-hidden="true">.</span>
      </p>

      <button
        type="button"
        onClick={skipSplash}
        className="splash-skip absolute bottom-8 right-6 rounded-full px-4 py-2 text-xs font-semibold text-slate-400 transition hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:right-8"
      >
        Skip →
      </button>
    </div>
  );
}
