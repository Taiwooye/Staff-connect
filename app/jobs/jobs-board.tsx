"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getAreasForState, launchStates } from "../locations";
import { useAuth, type AccountProfile } from "../auth/auth-context";

type PayUnit = "hour" | "day" | "shift" | "month" | "project";
type HiringCategory = "Household" | "Education" | "Events" | "Business" | "Other";
type JobStatus = "open" | "reserved" | "filled";
type OfferStatus = "pending" | "accepted" | "hired" | "declined";
type PaymentStatus = "unpaid" | "paid" | "received";

type ConversationMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
};

type JobPost = {
  id: string;
  hirerId: string;
  hirerName: string;
  organizationName: string;
  hirerAbout: string;
  title: string;
  category: HiringCategory;
  state: string;
  area: string;
  description: string;
  requiredSkills: string[];
  schedule: string;
  openings: number;
  budgetMin: number;
  budgetMax: number;
  payUnit: PayUnit;
  status: JobStatus;
  createdAt: string;
};

type WorkerOffer = {
  id: string;
  jobId: string;
  providerId: string;
  providerName: string;
  providerLocation: string;
  providerBio: string;
  providerSkills: string[];
  providerExperience: string;
  providerAvailability: string;
  providerQualifications?: string;
  providerLanguages?: string;
  providerPreviousWork?: string;
  providerExpectedSalary?: string;
  providerArrangements?: string[];
  askingPrice: number;
  message: string;
  status: OfferStatus;
  paymentStatus: PaymentStatus;
  messages?: ConversationMessage[];
  createdAt: string;
};

const JOBS_STORAGE_KEY = "staffconnect.marketplace.jobs.v1";
const OFFERS_STORAGE_KEY = "staffconnect.marketplace.offers.v1";
const payUnits: { value: PayUnit; label: string }[] = [
  { value: "hour", label: "per hour" },
  { value: "day", label: "per day" },
  { value: "shift", label: "per shift" },
  { value: "month", label: "per month" },
  { value: "project", label: "per project" },
];
const categories: HiringCategory[] = [
  "Household",
  "Education",
  "Events",
  "Business",
  "Other",
];
const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const exampleJobs: JobPost[] = [
  {
    id: "example-school-tutor",
    hirerId: "example:school",
    hirerName: "Mrs. Adeyemi",
    organizationName: "Bright Future School",
    hirerAbout: "A sample school looking for a patient, experienced maths tutor.",
    title: "Part-time maths tutor",
    category: "Education",
    state: "Lagos",
    area: "Ikeja",
    description:
      "Support secondary school students with maths lessons twice a week. Share your teaching approach and relevant experience.",
    requiredSkills: ["Teaching", "Mathematics", "Tutoring"],
    schedule: "Two afternoons each week",
    openings: 1,
    budgetMin: 12000,
    budgetMax: 18000,
    payUnit: "hour",
    status: "open",
    createdAt: "2026-11-10T09:00:00.000Z",
  },
  {
    id: "example-event-servers",
    hirerId: "example:events",
    hirerName: "Tola Events",
    organizationName: "Tola Events",
    hirerAbout: "A sample event-planning team coordinating a celebration in Lekki.",
    title: "Event servers for a Saturday reception",
    category: "Events",
    state: "Lagos",
    area: "Lekki",
    description:
      "Looking for friendly, punctual servers to help guests and support the event team during setup and service.",
    requiredSkills: ["Event service", "Customer service"],
    schedule: "Saturday · 2 pm–11 pm",
    openings: 4,
    budgetMin: 25000,
    budgetMax: 35000,
    payUnit: "shift",
    status: "open",
    createdAt: "2026-11-09T14:30:00.000Z",
  },
  {
    id: "example-dry-cleaner",
    hirerId: "example:cleaners",
    hirerName: "Kemi A.",
    organizationName: "Fresh Press Laundry",
    hirerAbout: "A sample local dry-cleaning business growing its laundry team.",
    title: "Laundry assistant",
    category: "Business",
    state: "Oyo",
    area: "Ibadan",
    description:
      "Help sort, wash, press, and package customer garments. Careful garment handling is important.",
    requiredSkills: ["Laundry", "Garment care", "Attention to detail"],
    schedule: "Weekdays, 8 am–5 pm",
    openings: 2,
    budgetMin: 100000,
    budgetMax: 140000,
    payUnit: "month",
    status: "open",
    createdAt: "2026-11-08T11:00:00.000Z",
  },
];

const emptyJobForm = {
  organizationName: "",
  hirerAbout: "",
  title: "",
  category: "Other" as HiringCategory,
  state: "",
  area: "",
  description: "",
  requiredSkills: "",
  schedule: "",
  openings: "1",
  budgetMin: "",
  budgetMax: "",
  payUnit: "shift" as PayUnit,
};

type InitialProfessional = {
  id: string;
  name: string;
  skills: string[];
  state: string;
  area: string;
  salaryMin: number;
  salaryMax: number;
  arrangement: string;
};

function isJobPost(value: unknown): value is JobPost {
  if (!value || typeof value !== "object") return false;
  const job = value as Partial<JobPost>;
  return (
    typeof job.id === "string" &&
    typeof job.hirerId === "string" &&
    typeof job.hirerName === "string" &&
    typeof job.organizationName === "string" &&
    typeof job.hirerAbout === "string" &&
    typeof job.title === "string" &&
    categories.includes(job.category as HiringCategory) &&
    typeof job.state === "string" &&
    typeof job.area === "string" &&
    typeof job.description === "string" &&
    Array.isArray(job.requiredSkills) &&
    job.requiredSkills.every((skill) => typeof skill === "string") &&
    typeof job.schedule === "string" &&
    typeof job.openings === "number" &&
    typeof job.budgetMin === "number" &&
    typeof job.budgetMax === "number" &&
    payUnits.some((unit) => unit.value === job.payUnit) &&
    (job.status === "open" ||
      job.status === "reserved" ||
      job.status === "filled") &&
    typeof job.createdAt === "string"
  );
}

function isWorkerOffer(value: unknown): value is WorkerOffer {
  if (!value || typeof value !== "object") return false;
  const offer = value as Partial<WorkerOffer>;
  return (
    typeof offer.id === "string" &&
    typeof offer.jobId === "string" &&
    typeof offer.providerId === "string" &&
    typeof offer.providerName === "string" &&
    typeof offer.providerLocation === "string" &&
    typeof offer.providerBio === "string" &&
    Array.isArray(offer.providerSkills) &&
    offer.providerSkills.every((skill) => typeof skill === "string") &&
    typeof offer.providerExperience === "string" &&
    typeof offer.providerAvailability === "string" &&
    (offer.providerQualifications === undefined ||
      typeof offer.providerQualifications === "string") &&
    (offer.providerLanguages === undefined ||
      typeof offer.providerLanguages === "string") &&
    (offer.providerPreviousWork === undefined ||
      typeof offer.providerPreviousWork === "string") &&
    (offer.providerExpectedSalary === undefined ||
      typeof offer.providerExpectedSalary === "string") &&
    (offer.providerArrangements === undefined ||
      (Array.isArray(offer.providerArrangements) &&
        offer.providerArrangements.every(
          (arrangement) => typeof arrangement === "string",
        ))) &&
    typeof offer.askingPrice === "number" &&
    typeof offer.message === "string" &&
    (offer.status === "pending" ||
      offer.status === "accepted" ||
      offer.status === "hired" ||
      offer.status === "declined") &&
    (offer.paymentStatus === "unpaid" ||
      offer.paymentStatus === "paid" ||
      offer.paymentStatus === "received") &&
    (offer.messages === undefined ||
      (Array.isArray(offer.messages) &&
        offer.messages.every(
          (message) =>
            message &&
            typeof message.id === "string" &&
            typeof message.senderId === "string" &&
            typeof message.senderName === "string" &&
            typeof message.text === "string" &&
            typeof message.createdAt === "string",
        ))) &&
    typeof offer.createdAt === "string"
  );
}

function loadStoredRows<T>(
  key: string,
  isRow: (value: unknown) => value is T,
  label: string,
): T[] {
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isRow)) {
    throw new Error(`Saved ${label} could not be read. Clear this site's saved data and try again.`);
  }
  return parsed;
}

function formatPrice(amount: number, unit: PayUnit) {
  return `${naira.format(amount)} ${payUnits.find((option) => option.value === unit)?.label}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function profileSkills(profile: AccountProfile) {
  return profile.skills.filter((skill) => skill.trim());
}

function getJobStatus(
  bookedCount: number,
  hiredCount: number,
  openings: number,
): JobStatus {
  if (hiredCount >= openings) return "filled";
  return bookedCount >= openings ? "reserved" : "open";
}

function JobCard({
  job,
  isExample,
  canWork,
  canHire,
  alreadyOffered,
  onApply,
  onSignUp,
  onCreateJob,
}: {
  job: JobPost;
  isExample: boolean;
  canWork: boolean;
  canHire: boolean;
  alreadyOffered: boolean;
  onApply: (jobId: string) => void;
  onSignUp: () => void;
  onCreateJob: () => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
          {job.category}
        </span>
        <span className="text-xs text-slate-500">
          {isExample ? "Example opportunity" : `Posted ${formatDate(job.createdAt)}`}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-bold text-[#142236]">{job.title}</h2>
      <p className="mt-1 text-sm font-medium text-slate-700">
        {job.organizationName} · {job.hirerName}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {job.area}, {job.state} · {job.schedule} · {job.openings} position
        {job.openings === 1 ? "" : "s"}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-600">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {job.requiredSkills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-[#f7f8f6] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Hirer profile
        </p>
        <p className="mt-1 text-sm font-semibold text-[#142236]">
          {job.organizationName}
        </p>
        <p className="mt-1 text-sm leading-5 text-slate-600">{job.hirerAbout}</p>
      </div>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hirer budget
          </p>
          <p className="mt-1 font-bold text-emerald-800">
            {formatPrice(job.budgetMin, job.payUnit)} –{" "}
            {formatPrice(job.budgetMax, job.payUnit)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {alreadyOffered ? (
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              Offer sent
            </span>
          ) : job.status !== "open" ? (
            <span className="text-sm font-semibold text-slate-500">
              {job.status === "filled"
                ? "Positions filled"
                : "Waiting on worker confirmations"}
            </span>
          ) : isExample ? (
            <span className="text-xs text-slate-500">
              Example only · create a real post to test offers
            </span>
          ) : canWork ? (
            <button
              type="button"
              onClick={() => onApply(job.id)}
              className="min-h-11 rounded-full bg-[#142236] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20334c]"
            >
              Send your price
            </button>
          ) : canHire ? (
            <button
              type="button"
              onClick={onCreateJob}
              className="min-h-11 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Post a job
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignUp}
              className="min-h-11 rounded-full bg-[#142236] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20334c]"
            >
              Join to send your price
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function ConversationPanel({
  offer,
  currentUserId,
  onSend,
}: {
  offer: WorkerOffer;
  currentUserId: string;
  onSend: (offer: WorkerOffer, text: string) => void;
}) {
  const messages = offer.messages ?? [];
  if (offer.status === "declined") return null;

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = String(data.get("message") ?? "").trim();
    if (!text) return;
    onSend(offer, text);
    form.reset();
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4" aria-label={`Conversation with ${offer.providerName}`}>
      <h5 className="font-semibold text-[#142236]">Conversation</h5>
      {messages.length > 0 ? (
        <ol className="mt-3 space-y-2">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`max-w-[95%] rounded-xl px-3 py-2 text-sm leading-5 ${
                message.senderId === currentUserId
                  ? "ml-auto bg-[#142236] text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <p className="text-xs font-semibold opacity-80">{message.senderName}</p>
              <p className="mt-1 whitespace-pre-wrap">{message.text}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          Ask questions and confirm the work details here before agreeing to start.
        </p>
      )}
      <form onSubmit={submitMessage} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`message-${offer.id}`}>Write a message</label>
        <input
          id={`message-${offer.id}`}
          name="message"
          required
          maxLength={1000}
          placeholder="Write a message about the work or terms"
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        />
        <button
          type="submit"
          className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Send message
        </button>
      </form>
      <p className="mt-2 text-xs text-slate-500">
        Demo conversation: visible only in this browser.
      </p>
    </section>
  );
}

export default function JobsBoard({
  initialProfessional,
}: {
  initialProfessional: InitialProfessional | null;
}) {
  const router = useRouter();
  const { status, user, accountType, profile } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [offers, setOffers] = useState<WorkerOffer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageLoadFailed, setStorageLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [jobFormOpen, setJobFormOpen] = useState(Boolean(initialProfessional));
  const [jobForm, setJobForm] = useState(() =>
    initialProfessional
      ? {
          ...emptyJobForm,
          organizationName: "",
          title: `Looking for a ${initialProfessional.skills[0]?.toLowerCase() ?? "household"} professional`,
          category: "Household" as HiringCategory,
          state: initialProfessional.state,
          area: initialProfessional.area,
          description: `Looking for support with ${initialProfessional.skills.join(", ")}. Inspired by ${initialProfessional.name}'s sample profile; describe your exact needs and invite workers to apply.`,
          requiredSkills: initialProfessional.skills.join(", "),
          schedule: initialProfessional.arrangement,
          budgetMin: String(initialProfessional.salaryMin),
          budgetMax: String(initialProfessional.salaryMax),
          payUnit: "month" as PayUnit,
        }
      : emptyJobForm,
  );
  const [activeOfferJobId, setActiveOfferJobId] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");

  const isClient = status === "signed-in" && accountType === "client";
  const isProvider = status === "signed-in" && accountType === "provider";
  const allJobs = useMemo(() => [...jobs, ...exampleJobs], [jobs]);
  const filteredJobs = allJobs.filter((job) => {
    const query = search.trim().toLowerCase();
    const matchesText =
      !query ||
      [
        job.title,
        job.organizationName,
        job.hirerName,
        job.area,
        job.state,
        job.description,
        ...job.requiredSkills,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return (
      matchesText &&
      (categoryFilter === "All categories" || job.category === categoryFilter)
    );
  });
  const ownJobs =
    isClient && user ? jobs.filter((job) => job.hirerId === user.id) : [];
  const ownJobIds = new Set(ownJobs.map((job) => job.id));
  const ownOffers =
    isProvider && user
      ? offers.filter((offer) => offer.providerId === user.id)
      : [];
  const areas = jobForm.state ? getAreasForState(jobForm.state) : [];

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setJobs(loadStoredRows(JOBS_STORAGE_KEY, isJobPost, "job posts"));
        setOffers(loadStoredRows(OFFERS_STORAGE_KEY, isWorkerOffer, "worker offers"));
        setStorageLoadFailed(false);
        setError("");
      } catch (loadError) {
        setStorageLoadFailed(true);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Saved marketplace data could not be loaded.",
        );
      } finally {
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  function persistJobs(nextJobs: JobPost[]) {
    window.localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(nextJobs));
    setJobs(nextJobs);
  }

  function persistOffers(nextOffers: WorkerOffer[]) {
    window.localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(nextOffers));
    setOffers(nextOffers);
  }

  function openSignup(role: "client" | "provider", returnTo = "/jobs") {
    router.push(`/signup?role=${role}&next=${encodeURIComponent(returnTo)}`);
  }

  function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!loaded || storageLoadFailed) {
      setError("Marketplace data has not loaded. Refresh the page before trying again.");
      return;
    }
    if (!isClient || !user || !profile) {
      setError("Sign in with a hirer account before posting a job.");
      return;
    }

    const budgetMin = Number(jobForm.budgetMin);
    const budgetMax = Number(jobForm.budgetMax);
    const openings = Number(jobForm.openings);
    if (
      !Number.isFinite(budgetMin) ||
      !Number.isFinite(budgetMax) ||
      budgetMin <= 0 ||
      budgetMax < budgetMin
    ) {
      setError("Enter a valid budget range. The maximum must be at least the minimum.");
      return;
    }
    if (!Number.isInteger(openings) || openings < 1 || openings > 100) {
      setError("Choose between 1 and 100 positions.");
      return;
    }

    const nextJob: JobPost = {
      id: crypto.randomUUID(),
      hirerId: user.id,
      hirerName: profile.displayName || user.email,
      organizationName: jobForm.organizationName.trim(),
      hirerAbout: jobForm.hirerAbout.trim(),
      title: jobForm.title.trim(),
      category: jobForm.category,
      state: jobForm.state,
      area: jobForm.area,
      description: jobForm.description.trim(),
      requiredSkills: jobForm.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      schedule: jobForm.schedule.trim(),
      openings,
      budgetMin,
      budgetMax,
      payUnit: jobForm.payUnit,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    try {
      persistJobs([nextJob, ...jobs]);
      setJobForm(emptyJobForm);
      setJobFormOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not save your job post: ${saveError.message}`
          : "Could not save your job post.",
      );
    }
  }

  function submitOffer(event: FormEvent<HTMLFormElement>, job: JobPost) {
    event.preventDefault();
    setError("");
    if (!loaded || storageLoadFailed) {
      setError("Marketplace data has not loaded. Refresh the page before trying again.");
      return;
    }
    if (!isProvider || !user || !profile) {
      setError("Sign in with a worker account to send a price offer.");
      return;
    }

    const skills = profileSkills(profile);
    if (!profile.bio.trim() || skills.length === 0) {
      setError(
        "Complete your work profile with a short bio and at least one skill before sending an offer.",
      );
      return;
    }
    const askingPrice = Number(offerPrice);
    if (!Number.isFinite(askingPrice) || askingPrice <= 0) {
      setError("Enter a valid asking price.");
      return;
    }
    if (offers.some((offer) => offer.jobId === job.id && offer.providerId === user.id)) {
      setError("You have already sent an offer for this job.");
      return;
    }

    const offer: WorkerOffer = {
      id: crypto.randomUUID(),
      jobId: job.id,
      providerId: user.id,
      providerName: profile.displayName || user.email,
      providerLocation: [profile.area, profile.state].filter(Boolean).join(", "),
      providerBio: profile.bio.trim(),
      providerSkills: skills,
      providerExperience: profile.experienceYears,
      providerAvailability: profile.availability,
      providerQualifications: profile.qualifications,
      providerLanguages: profile.languages,
      providerPreviousWork: profile.previousWork,
      providerExpectedSalary: profile.expectedSalary,
      providerArrangements: profile.arrangements,
      askingPrice,
      message: offerMessage.trim(),
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
    };

    try {
      persistOffers([offer, ...offers]);
      setActiveOfferJobId("");
      setOfferPrice("");
      setOfferMessage("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not send your offer: ${saveError.message}`
          : "Could not send your offer.",
      );
    }
  }

  function respondToOffer(offer: WorkerOffer, decision: "accepted" | "declined") {
    if (!loaded || storageLoadFailed) {
      setError("Marketplace data has not loaded. Refresh the page before trying again.");
      return;
    }
    if (!isClient || !user || !ownJobIds.has(offer.jobId)) {
      setError("Only the hirer who posted this job can respond to its offers.");
      return;
    }
    const job = jobs.find((item) => item.id === offer.jobId);
    if (!job) return;
    if (decision === "accepted") {
      const alreadyBooked = offers.filter(
        (item) =>
          item.jobId === job.id &&
          (item.status === "accepted" || item.status === "hired"),
      ).length;
      if (alreadyBooked >= job.openings) {
        setError("All positions on this post have already been filled.");
        return;
      }
    }

    let nextOffers = offers.map((item) =>
      item.id === offer.id
        ? { ...item, status: decision, paymentStatus: "unpaid" as PaymentStatus }
        : item,
    );
    const bookedCount = nextOffers.filter(
      (item) =>
        item.jobId === job.id &&
        (item.status === "accepted" || item.status === "hired"),
    ).length;
    if (bookedCount >= job.openings) {
      nextOffers = nextOffers.map((item) =>
        item.jobId === job.id && item.status === "pending"
          ? { ...item, status: "declined" }
          : item,
      );
    }
    const finalBookedCount = nextOffers.filter(
      (item) =>
        item.jobId === job.id &&
        (item.status === "accepted" || item.status === "hired"),
    ).length;
    const hiredCount = nextOffers.filter(
      (item) => item.jobId === job.id && item.status === "hired",
    ).length;
    const nextJobStatus = getJobStatus(
      finalBookedCount,
      hiredCount,
      job.openings,
    );
    const nextJobs = jobs.map((item) =>
      item.id === job.id
        ? { ...item, status: nextJobStatus }
        : item,
    );
    try {
      persistOffers(nextOffers);
      persistJobs(nextJobs);
      setError("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not update the offer: ${saveError.message}`
          : "Could not update the offer.",
      );
    }
  }

  function confirmHiringOffer(offer: WorkerOffer, decision: "hired" | "declined") {
    if (!loaded || storageLoadFailed) {
      setError("Marketplace data has not loaded. Refresh the page before trying again.");
      return;
    }
    if (!isProvider || !user || offer.providerId !== user.id || offer.status !== "accepted") {
      setError("Only the worker who received this offer can accept or decline it.");
      return;
    }

    const nextOffers = offers.map((item) =>
      item.id === offer.id ? { ...item, status: decision } : item,
    );
    const job = jobs.find((item) => item.id === offer.jobId);
    const bookedCount = nextOffers.filter(
      (item) =>
        item.jobId === offer.jobId &&
        (item.status === "accepted" || item.status === "hired"),
    ).length;
    const hiredCount = nextOffers.filter(
      (item) => item.jobId === offer.jobId && item.status === "hired",
    ).length;
    const nextJobs = job
      ? jobs.map((item) =>
          item.id === job.id
            ? {
                ...item,
                status: getJobStatus(bookedCount, hiredCount, item.openings),
              }
            : item,
        )
      : jobs;

    try {
      persistOffers(nextOffers);
      if (job) persistJobs(nextJobs);
      setError("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not update the work agreement: ${saveError.message}`
          : "Could not update the work agreement.",
      );
    }
  }

  function sendOfferMessage(offer: WorkerOffer, text: string) {
    if (!loaded || storageLoadFailed || !user || !profile) {
      setError("Sign in and wait for marketplace data to load before messaging.");
      return;
    }
    const isHirer = ownJobIds.has(offer.jobId);
    const isWorker = offer.providerId === user.id;
    if ((!isHirer && !isWorker) || offer.status === "declined") {
      setError("Only the hirer and worker on this offer can send messages.");
      return;
    }

    const message: ConversationMessage = {
      id: crypto.randomUUID(),
      senderId: user.id,
      senderName: profile.displayName || user.email,
      text,
      createdAt: new Date().toISOString(),
    };
    try {
      persistOffers(
        offers.map((item) =>
          item.id === offer.id
            ? { ...item, messages: [...(item.messages ?? []), message] }
            : item,
        ),
      );
      setError("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not send your message: ${saveError.message}`
          : "Could not send your message.",
      );
    }
  }

  function updatePayment(offer: WorkerOffer, nextStatus: PaymentStatus) {
    if (!loaded || storageLoadFailed) {
      setError("Marketplace data has not loaded. Refresh the page before trying again.");
      return;
    }
    const isHirer = Boolean(user && ownJobIds.has(offer.jobId));
    const isWorker = Boolean(user && offer.providerId === user.id);
    if (
      offer.status !== "hired" ||
      (nextStatus === "paid" && !isHirer) ||
      (nextStatus === "received" && (!isWorker || offer.paymentStatus !== "paid"))
    ) {
      setError("Only the hirer can record payment, and only the worker can confirm receipt.");
      return;
    }
    try {
      persistOffers(
        offers.map((item) =>
          item.id === offer.id ? { ...item, paymentStatus: nextStatus } : item,
        ),
      );
      setError("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not update payment status: ${saveError.message}`
          : "Could not update payment status.",
      );
    }
  }

  function getJob(jobId: string) {
    return jobs.find((job) => job.id === jobId);
  }

  function paymentLabel(statusValue: PaymentStatus) {
    if (statusValue === "received") return "Worker confirmed receipt";
    if (statusValue === "paid") return "Hirer recorded payment · awaiting confirmation";
    return "Payment not yet recorded";
  }

  function offerStatusLabel(statusValue: OfferStatus) {
    if (statusValue === "accepted") return "Work offer sent · awaiting worker";
    if (statusValue === "hired") return "Hired · work agreed";
    if (statusValue === "declined") return "Declined";
    return "Application received";
  }

  const fieldClass =
    "mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
  const textAreaClass =
    "mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
          <span aria-current="page" className="font-medium text-slate-700">Jobs and work</span>
        </nav>

        <section className="rounded-[2rem] bg-[#142236] p-6 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
            StaffConnect opportunities
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Good work starts with a clear connection.
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Hirers post the work and their budget. Workers share a profile and asking
                price. Both sides can review who they’re connecting with before agreeing.
              </p>
            </div>
            {isClient ? (
              <button
                type="button"
                onClick={() => setJobFormOpen((current) => !current)}
                className="min-h-12 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-[#142236] hover:bg-amber-300"
              >
                {jobFormOpen
                  ? "Close job form"
                  : initialProfessional
                    ? "Create a related job post"
                    : "Post a job"}
              </button>
            ) : isProvider ? (
              <Link
                href="/account"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-[#142236] hover:bg-amber-300"
              >
                View my work profile
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openSignup(
                    "client",
                    initialProfessional
                      ? `/jobs?professional=${initialProfessional.id}`
                      : "/jobs",
                  )
                }
                className="min-h-12 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-[#142236] hover:bg-amber-300"
              >
                {initialProfessional ? "Create a related job post" : "Sign up to hire"}
              </button>
            )}
          </div>
        </section>

        <aside className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Prototype notice:</strong> Posts and offers are saved in this browser only.
          Payment actions only record whether the hirer says they paid and the worker confirms
          receipt. <strong>No money is transferred by StaffConnect.</strong>
        </aside>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </p>
        )}

        {jobFormOpen && isClient && (
          <form
            onSubmit={createJob}
            className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">For hirers</p>
              <h2 className="mt-1 text-2xl font-bold text-[#142236]">Post a clear opportunity</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Schools, businesses, event planners, households, and teams can post.
                Workers will see your organization, work details, and budget.
              </p>
              {initialProfessional && (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-950">
                  This draft is based on {initialProfessional.name}&apos;s sample profile.
                  It won&apos;t contact that fictional sample person; publishing lets real
                  workers apply so you can message and hire a candidate.
                </p>
              )}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-800">
                Organization or hirer name
                <input
                  required
                  maxLength={100}
                  value={jobForm.organizationName}
                  onChange={(event) => setJobForm({ ...jobForm, organizationName: event.target.value })}
                  placeholder="e.g. Bright Future School"
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Hiring category
                <select
                  value={jobForm.category}
                  onChange={(event) => setJobForm({ ...jobForm, category: event.target.value as HiringCategory })}
                  className={fieldClass}
                >
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Short introduction
                <input
                  required
                  maxLength={220}
                  value={jobForm.hirerAbout}
                  onChange={(event) => setJobForm({ ...jobForm, hirerAbout: event.target.value })}
                  placeholder="Tell workers who you are and what your organization does."
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Job or role title
                <input
                  required
                  maxLength={100}
                  value={jobForm.title}
                  onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })}
                  placeholder="e.g. Primary school teacher"
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Number of people needed
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={jobForm.openings}
                  onChange={(event) => setJobForm({ ...jobForm, openings: event.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                State
                <select
                  required
                  value={jobForm.state}
                  onChange={(event) => setJobForm({ ...jobForm, state: event.target.value, area: "" })}
                  className={fieldClass}
                >
                  <option value="">Choose a state</option>
                  {launchStates.map((state) => <option key={state}>{state}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Area
                <select
                  required
                  value={jobForm.area}
                  disabled={!jobForm.state}
                  onChange={(event) => setJobForm({ ...jobForm, area: event.target.value })}
                  className={fieldClass}
                >
                  <option value="">Choose an area</option>
                  {areas.map((area) => <option key={area}>{area}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Work details
                <textarea
                  required
                  maxLength={1600}
                  value={jobForm.description}
                  onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })}
                  placeholder="Describe the work, expectations, and what a good fit looks like."
                  className={textAreaClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Skills needed <span className="font-normal text-slate-500">(comma-separated)</span>
                <input
                  value={jobForm.requiredSkills}
                  onChange={(event) => setJobForm({ ...jobForm, requiredSkills: event.target.value })}
                  placeholder="e.g. Teaching, Mathematics"
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Schedule or dates
                <input
                  required
                  maxLength={100}
                  value={jobForm.schedule}
                  onChange={(event) => setJobForm({ ...jobForm, schedule: event.target.value })}
                  placeholder="e.g. Weekdays, 8 am–3 pm"
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Minimum budget (NGN)
                <input
                  required
                  type="number"
                  min="1"
                  value={jobForm.budgetMin}
                  onChange={(event) => setJobForm({ ...jobForm, budgetMin: event.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Maximum budget (NGN)
                <input
                  required
                  type="number"
                  min="1"
                  value={jobForm.budgetMax}
                  onChange={(event) => setJobForm({ ...jobForm, budgetMax: event.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Payment unit
                <select
                  value={jobForm.payUnit}
                  onChange={(event) => setJobForm({ ...jobForm, payUnit: event.target.value as PayUnit })}
                  className={fieldClass}
                >
                  {payUnits.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
                </select>
              </label>
            </div>
            <button
              type="submit"
              disabled={!loaded}
              className="mt-6 min-h-11 rounded-full bg-[#142236] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20334c] disabled:opacity-50"
            >
              Publish job post
            </button>
          </form>
        )}

        {isClient && ownJobs.length > 0 && (
          <section className="mt-10" aria-labelledby="my-posts-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Hirer workspace</p>
                <h2 id="my-posts-heading" className="mt-1 text-2xl font-bold text-[#142236]">My job posts and offers</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Message applicants, send a work offer at the agreed price, then wait for
                  the worker to confirm before work starts.
                </p>
              </div>
              <span className="text-sm text-slate-500">{ownJobs.length} post{ownJobs.length === 1 ? "" : "s"}</span>
            </div>
            <div className="space-y-5">
              {ownJobs.map((job) => {
                const jobOffers = offers.filter((offer) => offer.jobId === job.id);
                return (
                  <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#142236]">{job.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{job.organizationName} · {job.area}, {job.state} · {job.openings} needed</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${job.status === "filled" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                        {job.status === "filled"
                          ? "Positions filled"
                          : job.status === "reserved"
                            ? "Work offers awaiting confirmation"
                            : "Open"}
                      </span>
                    </div>
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <h4 className="font-semibold text-[#142236]">Worker offers ({jobOffers.length})</h4>
                      {jobOffers.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">No offers yet. Workers can see your post on the public board.</p>
                      ) : (
                        <ul className="mt-3 space-y-3">
                          {jobOffers.map((offer) => (
                            <li key={offer.id} className="rounded-2xl bg-[#f7f8f6] p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="font-bold text-[#142236]">{offer.providerName}</h5>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{offerStatusLabel(offer.status)}</span>
                                  </div>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {[offer.providerLocation, offer.providerExperience && `${offer.providerExperience} years’ experience`, offer.providerAvailability].filter(Boolean).join(" · ") || "Location and availability not added"}
                                  </p>
                                  <p className="mt-2 text-sm leading-5 text-slate-700">{offer.providerBio}</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {offer.providerSkills.map((skill) => <span key={skill} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">{skill}</span>)}
                                  </div>
                                  {(offer.providerQualifications ||
                                    offer.providerLanguages ||
                                    offer.providerPreviousWork ||
                                    offer.providerArrangements?.length) && (
                                    <dl className="mt-4 grid gap-3 border-t border-slate-200 pt-3 text-sm sm:grid-cols-2">
                                      {offer.providerQualifications && (
                                        <div>
                                          <dt className="font-semibold text-slate-700">Qualifications</dt>
                                          <dd className="mt-1 whitespace-pre-wrap text-slate-600">{offer.providerQualifications}</dd>
                                        </div>
                                      )}
                                      {offer.providerLanguages && (
                                        <div>
                                          <dt className="font-semibold text-slate-700">Languages</dt>
                                          <dd className="mt-1 text-slate-600">{offer.providerLanguages}</dd>
                                        </div>
                                      )}
                                      {offer.providerArrangements?.length ? (
                                        <div>
                                          <dt className="font-semibold text-slate-700">Work arrangements</dt>
                                          <dd className="mt-1 text-slate-600">{offer.providerArrangements.join(" · ")}</dd>
                                        </div>
                                      ) : null}
                                      {offer.providerExpectedSalary && (
                                        <div>
                                          <dt className="font-semibold text-slate-700">Worker&apos;s profile price range</dt>
                                          <dd className="mt-1 text-slate-600">{offer.providerExpectedSalary}</dd>
                                        </div>
                                      )}
                                      {offer.providerPreviousWork && (
                                        <div className="sm:col-span-2">
                                          <dt className="font-semibold text-slate-700">Previous work</dt>
                                          <dd className="mt-1 whitespace-pre-wrap text-slate-600">{offer.providerPreviousWork}</dd>
                                        </div>
                                      )}
                                    </dl>
                                  )}
                                  {offer.message && <p className="mt-3 text-sm text-slate-700">Message: {offer.message}</p>}
                                  {offer.status === "hired" && (
                                    <p className="mt-3 text-xs font-medium text-amber-900">{paymentLabel(offer.paymentStatus)}</p>
                                  )}
                                  <ConversationPanel
                                    offer={offer}
                                    currentUserId={user?.id ?? ""}
                                    onSend={sendOfferMessage}
                                  />
                                </div>
                                <div className="shrink-0 sm:text-right">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Worker asks</p>
                                  <p className="mt-1 text-lg font-bold text-emerald-800">{formatPrice(offer.askingPrice, job.payUnit)}</p>
                                  {offer.status === "pending" && job.status === "open" && (
                                    <div className="mt-3 flex gap-2 sm:justify-end">
                                      <button type="button" onClick={() => respondToOffer(offer, "accepted")} className="min-h-10 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Send work offer</button>
                                      <button type="button" onClick={() => respondToOffer(offer, "declined")} className="min-h-10 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Decline</button>
                                    </div>
                                  )}
                                  {offer.status === "accepted" && (
                                    <p className="mt-3 max-w-48 text-xs leading-5 text-amber-900">
                                      Waiting for {offer.providerName} to confirm the terms and start work.
                                    </p>
                                  )}
                                  {offer.status === "hired" && offer.paymentStatus === "unpaid" && (
                                    <button type="button" onClick={() => updatePayment(offer, "paid")} className="mt-3 min-h-10 rounded-full bg-[#142236] px-4 py-2 text-xs font-semibold text-white hover:bg-[#20334c]">Record payment sent</button>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {isProvider && (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="my-offers-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Worker workspace</p>
                <h2 id="my-offers-heading" className="mt-1 text-2xl font-bold text-[#142236]">My price offers</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Talk through the details. When a hirer sends a work offer, accept it only
                  if you agree with the price and schedule.
                </p>
              </div>
              <span className="text-sm text-slate-500">{ownOffers.length} offer{ownOffers.length === 1 ? "" : "s"}</span>
            </div>
            {ownOffers.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-slate-600">Your applications and agreed payments will appear here. Browse opportunities below to send your first price.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {ownOffers.map((offer) => {
                  const job = getJob(offer.jobId) ?? exampleJobs.find((item) => item.id === offer.jobId);
                  if (!job) return null;
                  return (
                    <li key={offer.id} className="flex flex-col gap-3 rounded-2xl bg-[#f7f8f6] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-[#142236]">{job.title} · {job.organizationName}</p>
                        <p className="mt-1 text-sm text-slate-600">Your price: {formatPrice(offer.askingPrice, job.payUnit)} · {offerStatusLabel(offer.status)}</p>
                        {offer.status === "hired" && <p className="mt-1 text-xs font-medium text-amber-900">{paymentLabel(offer.paymentStatus)}</p>}
                      </div>
                      <div className="sm:shrink-0 sm:text-right">
                      {offer.status === "accepted" && (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => confirmHiringOffer(offer, "hired")} className="min-h-10 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Accept and start work</button>
                          <button type="button" onClick={() => confirmHiringOffer(offer, "declined")} className="min-h-10 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Decline offer</button>
                        </div>
                      )}
                      {offer.status === "hired" && offer.paymentStatus === "paid" && (
                        <button type="button" onClick={() => updatePayment(offer, "received")} className="min-h-10 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Confirm payment received</button>
                      )}
                      </div>
                      <div className="w-full">
                        <ConversationPanel
                          offer={offer}
                          currentUserId={user?.id ?? ""}
                          onSend={sendOfferMessage}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        <section className="mt-10" aria-labelledby="jobs-heading">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Public job board</p>
              <h2 id="jobs-heading" className="mt-1 text-2xl font-bold text-[#142236]">Explore work opportunities</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_12rem]">
              <label className="sr-only" htmlFor="job-search">Search opportunities</label>
              <input
                id="job-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search role, skill, or location"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              <label className="sr-only" htmlFor="job-category">Filter by category</label>
              <select id="job-category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100">
                <option>All categories</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
          </div>
          {!loaded && <p className="rounded-2xl bg-white p-5 text-sm text-slate-600">Loading local job posts...</p>}
          {loaded && filteredJobs.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="font-semibold text-[#142236]">No opportunities match that search.</h3>
              <p className="mt-2 text-sm text-slate-600">Try another search or clear the category filter.</p>
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredJobs.map((job) => {
              const isExample = job.id.startsWith("example:");
              const actualExample = exampleJobs.some((item) => item.id === job.id);
              const alreadyOffered = Boolean(
                user &&
                  offers.some((offer) => offer.jobId === job.id && offer.providerId === user.id),
              );
              return (
                <div key={job.id}>
                  <JobCard
                    job={job}
                    isExample={isExample || actualExample}
                    canWork={Boolean(isProvider && job.status === "open")}
                    canHire={Boolean(isClient)}
                    alreadyOffered={alreadyOffered}
                    onApply={(jobId) => {
                      setError("");
                      setActiveOfferJobId((current) => (current === jobId ? "" : jobId));
                      setOfferPrice("");
                      setOfferMessage("");
                    }}
                    onSignUp={() => openSignup("provider")}
                    onCreateJob={() => {
                      if (isClient) {
                        setJobFormOpen(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        openSignup("client");
                      }
                    }}
                  />
                  {activeOfferJobId === job.id && isProvider && (
                    <form onSubmit={(event) => submitOffer(event, job)} className="mt-3 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                      <h3 className="font-bold text-[#142236]">Send your price for {job.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Your work profile and asking price ({payUnits.find((unit) => unit.value === job.payUnit)?.label}) will be shared with this hirer.
                      </p>
                      <label className="mt-4 block text-sm font-semibold text-slate-800">
                        Your asking price (NGN)
                        <input required type="number" min="1" value={offerPrice} onChange={(event) => setOfferPrice(event.target.value)} className={fieldClass} />
                      </label>
                      <label className="mt-4 block text-sm font-semibold text-slate-800">
                        Note to the hirer <span className="font-normal text-slate-500">(optional)</span>
                        <textarea maxLength={500} value={offerMessage} onChange={(event) => setOfferMessage(event.target.value)} placeholder="Briefly explain why you’re a good fit." className={textAreaClass} />
                      </label>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button type="submit" className="min-h-10 rounded-full bg-[#142236] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20334c]">Send price offer</button>
                        <Link href="/account" className="text-sm font-semibold text-amber-900 underline underline-offset-4">Edit my profile</Link>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}