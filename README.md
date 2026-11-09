# StaffConnect

StaffConnect is a prototype for connecting households with household professionals. The initial launch locations are Lagos and Oyo, with state and area options maintained in `app/locations.ts` so other locations can be added later.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set the project URL and publishable key.
3. Run `supabase/migrations/20261109000000_auth_roles_and_saved_professionals.sql` in the Supabase SQL Editor.
4. In Supabase Authentication URL Configuration, allow `http://localhost:3000/auth/callback` for local development and add your deployed site's `/auth/callback` URL. Set the Site URL to the deployed origin.
5. Restart the development server after changing environment variables.

Configure the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` values in Vercel. Never use a Supabase service-role key in the browser or commit credentials.

Registration requires an email and a password of at least 10 characters. If email confirmation is enabled, users follow the email link before signing in. The account page shows their persistent Client or Provider role. Saved sample professionals are stored for signed-in Client accounts. Public sample listings remain visible without an account.

Provider work-profile previews are temporary and are not published or persisted. Listings and qualifications are fictional and unverified.

## Prototype features

- Browse and filter sample professional profiles by service type, state, area, skills, and work arrangement at `/maids`. Category links use service-specific skills; pet care, gardening, elderly care, driving, and maintenance show no sample matches until profiles for those services are added.
- Learn about the prototype at `/about` and find next steps for households and professionals at `/contact`. Contact options are not connected to a live support inbox yet.
- Sort directory results by location, experience, gender, availability, work arrangement, or salary, and review the active filters beside the result count.
- Open a profile at `/maids/[id]` to review experience, qualifications, languages, interests, and work preferences. Profile details are public; sign-in is required to save a profile.
- Create an account as a Client or Provider at `/auth`. Account type is displayed in the navigation and `/account`.
- Provider onboarding previews support one profile photo and up to two gallery images, but drafts are not published or persisted.

All directory profiles are fictional sample data. Qualifications are illustrative and unverified. Provider profile previews, selected images, and onboarding form data exist only in browser memory; this prototype does not publish listings or upload or persist provider profile data. Image selection accepts JPEG, PNG, or WebP up to 5 MB per image. Do not enter real personal or sensitive information.

## Checks

```bash
npm run lint
npm run build
```

## Deployment

The project is configured for deployment on Vercel. Add the Supabase environment variables to the Vercel project and allow the deployed callback URL in Supabase. See the [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying).
