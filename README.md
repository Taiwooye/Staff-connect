# StaffConnect

StaffConnect is a prototype marketplace for connecting hirers with workers. Households, schools, event planners, and local businesses can post opportunities; workers can share a profile and respond with an asking price. The initial launch locations are Lagos and Oyo, with state and area options maintained in `app/locations.ts` so other locations can be added later.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication setup

Until Supabase credentials are configured, `/signup` and `/signin` use a local demo flow. Use any valid email and password; email and password are not verified, and the password is never stored. Demo account type, session, profile details, and saved Client profiles stay in that browser only. Provider profile photos are resized before saving. Client match suggestions use fictional sample listings; profiles are not verified and do not have real ratings or reviews. This is for testing the UI only, not real authentication. The flow switches to Supabase automatically once the environment variables below are configured.

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set the project URL and publishable key.
3. Run `supabase/migrations/20261109000000_auth_roles_and_saved_professionals.sql` in the Supabase SQL Editor.
4. In Supabase Authentication URL Configuration, allow `http://localhost:3000/auth/callback` for local development and add your deployed site's `/auth/callback` URL. Set the Site URL to the deployed origin.
5. Restart the development server after changing environment variables.

Configure the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` values in Vercel. Never use a Supabase service-role key in the browser or commit credentials.

With Supabase configured, registration requires an email and a password. If email confirmation is enabled, users follow the email link before signing in. The account page shows their Client or Provider role. Saved sample professionals are stored for signed-in Client accounts. Public sample listings remain visible without an account.

Provider onboarding previews are temporary. The `/account` profile editor saves details in the current browser only; profiles are not published or synced online. Listings and qualifications are fictional and unverified.

## Prototype features

- Browse and filter sample professional profiles by service type, state, area, skills, and work arrangement at `/maids`. Category links use service-specific skills; pet care, gardening, elderly care, driving, and maintenance show no sample matches until profiles for those services are added.
- Learn about the prototype at `/about` and find next steps for households and professionals at `/contact`. Contact options are not connected to a live support inbox yet.
- Sort directory results by location, experience, gender, availability, work arrangement, or salary, and review the active filters beside the result count.
- Open a profile at `/maids/[id]` to review experience, qualifications, languages, interests, and work preferences. Profile details are public; sign-in is required to save a profile.
- Browse opportunities at `/jobs`. Hirers can create job posts with location, schedule, number of workers, skills, and a budget range; workers can respond with a profile and price offer. Hirers can review offers, accept or decline, and record a manual payment status that workers can confirm.
- Job posts and offers are a browser-local prototype stored in `localStorage`; they are not shared across devices or users. Payment status is a record only: StaffConnect does not collect, transfer, or hold money.
- Create an account as a hirer (Client) or worker (Provider) at `/signup`, or sign in at `/signin`. The account type controls whether the user can post jobs or submit price offers.
- Provider onboarding previews support one profile photo and up to two gallery images, but drafts are not published or persisted.

All directory profiles and example opportunities are fictional sample data. Qualifications are illustrative and unverified. Worker profiles, saved household details, job posts, and offers are not published or synced online. Job posts and offers remain in this browser; other profile drafts may exist only in temporary memory or browser storage. Image selection accepts JPEG, PNG, or WebP up to 5 MB per image. Do not enter real personal or sensitive information.

## Checks

```bash
npm run lint
npm run build
```

## Deployment

The project is configured for deployment on Vercel. Add the Supabase environment variables to the Vercel project and allow the deployed callback URL in Supabase. See the [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying).
