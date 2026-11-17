"use client";

import Link from "next/link";
import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useAuth } from "../auth/auth-context";

type JobSummary = {
  id: string;
  title: string;
  hirerId: string;
  hirerName: string;
};

type OfferSummary = {
  id: string;
  jobId: string;
  providerId: string;
  providerName: string;
  status: string;
  paymentStatus: string;
};

type LocalReview = {
  id: string;
  interactionId: string;
  jobId: string;
  authorId: string;
  authorName: string;
  subjectName: string;
  stars: number;
  text: string;
  createdAt: string;
};

type LocalReport = {
  id: string;
  reporterId: string;
  jobId: string;
  category: string;
  details: string;
  createdAt: string;
};

type TrustData = {
  jobs: JobSummary[];
  offers: OfferSummary[];
  reviews: LocalReview[];
  reports: LocalReport[];
  checklist: Record<string, boolean>;
};

type TrustSnapshot = {
  userId: string;
  data: TrustData | null;
  error: string;
};

type Engagement = {
  offer: OfferSummary;
  job: JobSummary;
  subjectName: string;
};

const checklistItems = [
  {
    id: "identity",
    title: "Identity review",
    description: "Be ready to use an approved identity-check provider when one is connected.",
  },
  {
    id: "references",
    title: "Work references",
    description: "Ask referees for permission before sharing their details with a future service.",
  },
  {
    id: "expectations",
    title: "Work expectations",
    description: "Agree duties, schedule, pay, rest periods, and safety expectations in writing.",
  },
] as const;

const reportCategories = [
  "Payment disagreement",
  "Unsafe request",
  "Harassment or inappropriate conduct",
  "Misleading job or profile details",
  "Other concern",
] as const;

const jobsStorageKey = "staffconnect.marketplace.jobs.v1";
const offersStorageKey = "staffconnect.marketplace.offers.v1";
const reviewsStorageKey = "staffconnect.trust.reviews.v1";
const reportsStorageKey = "staffconnect.trust.reports.v1";
const checklistStorageKey = "staffconnect.trust.checklist.v1";
const emptySnapshot: TrustSnapshot = { userId: "", data: null, error: "" };
let cachedSnapshot = emptySnapshot;
const snapshotListeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJobSummary(value: unknown): value is JobSummary {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.hirerId === "string" &&
    typeof value.hirerName === "string"
  );
}

function isOfferSummary(value: unknown): value is OfferSummary {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.jobId === "string" &&
    typeof value.providerId === "string" &&
    typeof value.providerName === "string" &&
    typeof value.status === "string" &&
    typeof value.paymentStatus === "string"
  );
}

function isLocalReview(value: unknown): value is LocalReview {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.interactionId === "string" &&
    typeof value.jobId === "string" &&
    typeof value.authorId === "string" &&
    typeof value.authorName === "string" &&
    typeof value.subjectName === "string" &&
    typeof value.stars === "number" &&
    Number.isInteger(value.stars) &&
    value.stars >= 1 &&
    value.stars <= 5 &&
    typeof value.text === "string" &&
    typeof value.createdAt === "string"
  );
}

function isLocalReport(value: unknown): value is LocalReport {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.reporterId === "string" &&
    typeof value.jobId === "string" &&
    typeof value.category === "string" &&
    typeof value.details === "string" &&
    typeof value.createdAt === "string"
  );
}

function readList<T>(
  key: string,
  isItem: (value: unknown) => value is T,
): T[] {
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isItem)) {
    throw new Error("Saved trust and safety demo data is invalid. Clear this site's saved data to continue.");
  }
  return parsed;
}

function readChecklist(userId: string): Record<string, boolean> {
  const raw = window.localStorage.getItem(`${checklistStorageKey}:${userId}`);
  if (!raw) return {};

  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) {
    throw new Error("Your saved readiness checklist is invalid. Clear this site's saved data to continue.");
  }

  const checklist: Record<string, boolean> = {};
  for (const [id, completed] of Object.entries(parsed)) {
    if (
      !checklistItems.some((item) => item.id === id) ||
      typeof completed !== "boolean"
    ) {
      throw new Error("Your saved readiness checklist is invalid. Clear this site's saved data to continue.");
    }
    checklist[id] = completed;
  }
  return checklist;
}

function getTrustSnapshot(userId: string): TrustSnapshot {
  if (!userId) return emptySnapshot;
  if (cachedSnapshot.userId === userId) return cachedSnapshot;

  try {
    cachedSnapshot = {
      userId,
      data: {
        jobs: readList(jobsStorageKey, isJobSummary),
        offers: readList(offersStorageKey, isOfferSummary),
        reviews: readList(reviewsStorageKey, isLocalReview),
        reports: readList(reportsStorageKey, isLocalReport),
        checklist: readChecklist(userId),
      },
      error: "",
    };
  } catch (error) {
    cachedSnapshot = {
      userId,
      data: null,
      error:
        error instanceof Error ? error.message : "Could not load saved trust and safety data.",
    };
  }
  return cachedSnapshot;
}

function notifySnapshotListeners() {
  snapshotListeners.forEach((listener) => listener());
}

function publishTrustSnapshot(snapshot: TrustSnapshot) {
  cachedSnapshot = snapshot;
  notifySnapshotListeners();
}

function subscribeToTrustSnapshot(listener: () => void) {
  snapshotListeners.add(listener);
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("staffconnect-marketplace-change", handleMarketplaceChange);
  return () => {
    snapshotListeners.delete(listener);
    window.removeEventListener("staffconnect-marketplace-change", handleMarketplaceChange);
    if (snapshotListeners.size === 0) {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

function handleStorageChange(event: StorageEvent) {
  if (
    event.key === null ||
    event.key === jobsStorageKey ||
    event.key === offersStorageKey ||
    event.key === reviewsStorageKey ||
    event.key === reportsStorageKey ||
    event.key.startsWith(`${checklistStorageKey}:`)
  ) {
    invalidateTrustSnapshot();
  }
}

function handleMarketplaceChange() {
  invalidateTrustSnapshot();
}

function invalidateTrustSnapshot() {
  cachedSnapshot = emptySnapshot;
  notifySnapshotListeners();
}

export default function TrustCenter() {
  const { status, user, profile } = useAuth();
  const userId = status === "signed-in" ? user?.id ?? "" : "";
  const getSnapshot = useCallback(() => getTrustSnapshot(userId), [userId]);
  const snapshot = useSyncExternalStore(
    subscribeToTrustSnapshot,
    getSnapshot,
    () => emptySnapshot,
  );
  const data = snapshot.data;
  const storageError = snapshot.error;
  const [actionMessage, setActionMessage] = useState("");

  const engagements = useMemo(() => {
    if (!data || !user) return [];
    const jobsById = new Map(data.jobs.map((job) => [job.id, job]));

    return data.offers.flatMap((offer): Engagement[] => {
      const job = jobsById.get(offer.jobId);
      if (
        !job ||
        offer.status !== "hired" ||
        offer.paymentStatus !== "received" ||
        (offer.providerId !== user.id && job.hirerId !== user.id)
      ) {
        return [];
      }

      return [
        {
          offer,
          job,
          subjectName: offer.providerId === user.id ? job.hirerName : offer.providerName,
        },
      ];
    });
  }, [data, user]);

  const relatedJobs = useMemo(() => {
    if (!data || !user) return [];
    const offeredJobIds = new Set(
      data.offers
        .filter((offer) => offer.providerId === user.id)
        .map((offer) => offer.jobId),
    );
    return data.jobs.filter(
      (job) => job.hirerId === user.id || offeredJobIds.has(job.id),
    );
  }, [data, user]);

  function saveTrustList<T>(
    key: string,
    items: T[],
    update: (current: TrustData) => TrustData,
  ): boolean {
    if (!data) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
      publishTrustSnapshot({
        ...snapshot,
        data: update(data),
      });
      setActionMessage("Saved in this browser only. It has not been sent to StaffConnect.");
      return true;
    } catch (error) {
      setActionMessage(
        error instanceof Error ? `Could not save your update: ${error.message}` : "Could not save your update.",
      );
      return false;
    }
  }

  function toggleChecklistItem(itemId: string) {
    if (!data || !user) return;
    const nextChecklist = {
      ...data.checklist,
      [itemId]: !data.checklist[itemId],
    };
    try {
      window.localStorage.setItem(
        `${checklistStorageKey}:${user.id}`,
        JSON.stringify(nextChecklist),
      );
      publishTrustSnapshot({
        ...snapshot,
        data: { ...data, checklist: nextChecklist },
      });
      setActionMessage("Readiness checklist saved in this browser only. No check has been performed.");
    } catch (error) {
      setActionMessage(
        error instanceof Error ? `Could not save your checklist: ${error.message}` : "Could not save your checklist.",
      );
    }
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || !user) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const interactionId = String(formData.get("interaction") ?? "");
    const engagement = engagements.find((item) => item.offer.id === interactionId);
    const stars = Number(formData.get("stars"));
    const text = String(formData.get("review") ?? "").trim();

    if (!engagement || !Number.isInteger(stars) || stars < 1 || stars > 5 || !text) {
      setActionMessage("Choose a completed engagement, a 1–5 rating, and add brief feedback.");
      return;
    }
    if (
      data.reviews.some(
        (review) => review.interactionId === interactionId && review.authorId === user.id,
      )
    ) {
      setActionMessage("You have already left feedback for this engagement.");
      return;
    }

    const review: LocalReview = {
      id: crypto.randomUUID(),
      interactionId,
      jobId: engagement.job.id,
      authorId: user.id,
      authorName: profile?.displayName || user.email || "StaffConnect member",
      subjectName: engagement.subjectName,
      stars,
      text,
      createdAt: new Date().toISOString(),
    };
    if (
      saveTrustList(reviewsStorageKey, [...data.reviews, review], (current) => ({
        ...current,
        reviews: [...current.reviews, review],
      }))
    ) {
      form.reset();
    }
  }

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || !user) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const jobId = String(formData.get("job") ?? "");
    const category = String(formData.get("category") ?? "");
    const details = String(formData.get("details") ?? "").trim();

    if (
      !relatedJobs.some((job) => job.id === jobId) ||
      !reportCategories.some((item) => item === category) ||
      !details
    ) {
      setActionMessage("Choose a related job, issue type, and brief description.");
      return;
    }

    const report: LocalReport = {
      id: crypto.randomUUID(),
      reporterId: user.id,
      jobId,
      category,
      details,
      createdAt: new Date().toISOString(),
    };
    if (
      saveTrustList(reportsStorageKey, [...data.reports, report], (current) => ({
        ...current,
        reports: [...current.reports, report],
      }))
    ) {
      form.reset();
    }
  }

  if (status === "loading") {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-12">
        <p className="text-sm text-slate-600">Loading your trust and safety tools...</p>
      </main>
    );
  }

  const signedIn = status === "signed-in" && Boolean(user);
  const reviewedInteractionIds = new Set(
    data?.reviews.filter((review) => review.authorId === user?.id).map((review) => review.interactionId) ?? [],
  );
  const reviewableEngagements = engagements.filter(
    (engagement) => !reviewedInteractionIds.has(engagement.offer.id),
  );
  const myReviews = data?.reviews.filter((review) => review.authorId === user?.id) ?? [];
  const myReports = data?.reports.filter((report) => report.reporterId === user?.id) ?? [];

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-[2rem] bg-[#142236] px-6 py-9 text-white sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">
            Trust and safety · prototype
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Clear expectations. Safer connections.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Prepare for future identity and reference checks, leave feedback after a recorded engagement,
            and note a concern. These are local demonstrations, not real verification or support services.
          </p>
        </header>

        <aside className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Prototype limits:</strong> No identity documents, referee contact details, or sensitive
          information should be entered here. Nothing is sent to StaffConnect. For immediate danger,
          contact local emergency services; this prototype is not monitored.
        </aside>

        {actionMessage && (
          <p role="status" aria-live="polite" className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            {actionMessage}
          </p>
        )}

        {!signedIn ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-[#142236]">Sign in to use the demo tools</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Browsing this page is public, but checklist progress, engagement feedback, and reports are
              associated with your local demo account.
            </p>
            <Link
              href="/signin?next=%2Ftrust"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#142236] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20334c]"
            >
              Sign in
            </Link>
          </section>
        ) : storageError ? (
          <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {storageError}
          </p>
        ) : !data || snapshot.userId !== user?.id ? (
          <p className="mt-8 text-sm text-slate-600">Loading your local demo data...</p>
        ) : (
          <div className="mt-8 space-y-8">
            <section aria-labelledby="readiness-heading" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Verification and references</p>
                  <h2 id="readiness-heading" className="mt-2 text-2xl font-bold text-[#142236]">Readiness checklist</h2>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">Self-reported · not verified</span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Use this checklist to prepare for a future review. Checking an item only records your
                readiness in this browser; it does not prove identity, contact details, references, or qualifications.
              </p>
              <ul className="mt-5 space-y-3">
                {checklistItems.map((item) => (
                  <li key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-[#142236]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={Boolean(data.checklist[item.id])}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                        data.checklist[item.id]
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {data.checklist[item.id] ? "Marked ready · undo" : "Mark ready"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="reviews-heading" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Ratings and reviews</p>
              <h2 id="reviews-heading" className="mt-2 text-2xl font-bold text-[#142236]">Feedback after a completed engagement</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The demo only offers feedback for a hired job where the worker has confirmed payment received.
                Reviews stay in this browser and are not verified or published on profiles.
              </p>
              {reviewableEngagements.length > 0 ? (
                <form onSubmit={submitReview} className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4 sm:p-5">
                  <div>
                    <label htmlFor="review-interaction" className="block text-sm font-semibold text-slate-800">Completed engagement</label>
                    <select id="review-interaction" name="interaction" required defaultValue="" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">
                      <option value="" disabled>Choose an engagement</option>
                      {reviewableEngagements.map(({ offer, job, subjectName }) => (
                        <option key={offer.id} value={offer.id}>{job.title} · feedback for {subjectName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="review-stars" className="block text-sm font-semibold text-slate-800">Rating</label>
                    <select id="review-stars" name="stars" required defaultValue="" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm sm:max-w-xs">
                      <option value="" disabled>Choose a rating</option>
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <option key={stars} value={stars}>{stars} out of 5</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="review-text" className="block text-sm font-semibold text-slate-800">What went well or could improve?</label>
                    <textarea id="review-text" name="review" required maxLength={500} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm" placeholder="Keep feedback respectful and focused on the work." />
                  </div>
                  <button type="submit" className="min-h-11 rounded-full bg-[#142236] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20334c]">Save demo review</button>
                </form>
              ) : (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  {engagements.length > 0
                    ? "You have already left feedback for each completed engagement."
                    : "No eligible completed engagement is available in this browser yet."}
                </p>
              )}
              {myReviews.length > 0 && (
                <ul className="mt-5 space-y-3">
                  {myReviews.map((review) => (
                    <li key={review.id} className="rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold text-[#142236]">
                        {review.subjectName} · {review.stars}/5
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{review.text}</p>
                      <p className="mt-2 text-xs text-slate-500">Saved locally · {new Date(review.createdAt).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="report-heading" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Safety and disputes</p>
              <h2 id="report-heading" className="mt-2 text-2xl font-bold text-[#142236]">Record a concern in this demo</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Reports are not delivered to a support team and cannot trigger an investigation or resolve a dispute.
                Do not include names, phone numbers, addresses, identity details, or urgent incident information.
              </p>
              {relatedJobs.length > 0 ? (
                <form onSubmit={submitReport} className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4 sm:p-5">
                  <div>
                    <label htmlFor="report-job" className="block text-sm font-semibold text-slate-800">Related job</label>
                    <select id="report-job" name="job" required defaultValue="" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">
                      <option value="" disabled>Choose a job</option>
                      {relatedJobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="report-category" className="block text-sm font-semibold text-slate-800">Concern type</label>
                    <select id="report-category" name="category" required defaultValue="" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">
                      <option value="" disabled>Choose a concern</option>
                      {reportCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="report-details" className="block text-sm font-semibold text-slate-800">Brief, non-sensitive note</label>
                    <textarea id="report-details" name="details" required maxLength={500} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm" placeholder="Do not include personal or urgent details." />
                  </div>
                  <button type="submit" className="min-h-11 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100">Save local demo report</button>
                </form>
              ) : (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  A report can be associated with a job you posted or applied to in this browser.
                </p>
              )}
              {myReports.length > 0 && (
                <ul className="mt-5 space-y-3">
                  {myReports.map((report) => (
                    <li key={report.id} className="rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold text-[#142236]">{report.category} · saved locally</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{report.details}</p>
                      <p className="mt-2 text-xs text-slate-500">No support follow-up · {new Date(report.createdAt).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        <p className="mt-8 text-sm text-slate-600">
          Need to review or update your profile?{" "}
          <Link href="/account" className="font-semibold text-amber-900 underline underline-offset-4">Open your account</Link>.
        </p>
      </div>
    </main>
  );
}
