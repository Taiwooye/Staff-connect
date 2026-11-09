# StaffConnect

StaffConnect is a prototype for connecting households with household professionals. The initial launch locations are Lagos and Oyo, with state and area options maintained in `app/locations.ts` so other locations can be added later.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Prototype features

- Browse and filter sample professional profiles by service type, state, area, skills, and work arrangement at `/maids`. Category links use service-specific skills; pet care, gardening, elderly care, driving, and maintenance show no sample matches until profiles for those services are added.
- Sort directory results by location, experience, gender, availability, work arrangement, or salary, and review the active filters beside the result count.
- Open a profile at `/maids/[id]` to review experience, qualifications, languages, interests, and work preferences.
- Save profiles during the current browser session and filter the directory to saved profiles.
- Create a temporary household or professional profile through `/onboarding`; professional previews support one profile photo and up to two gallery images.
- Provider profiles require at least one language and a short introduction. Providers can save a draft in the current tab and browse sample listings; drafts are not published or persisted. The onboarding entry point clearly distinguishes Client and Provider account types; account registration and sign-in are not implemented.

All directory profiles are fictional sample data. Qualifications are illustrative and unverified. Profile previews, selected images, and saved profiles exist only in browser memory; this prototype does not create accounts, publish listings, or upload or persist form data. Image selection accepts JPEG, PNG, or WebP up to 5 MB per image. Do not enter real personal or sensitive information.

## Checks

```bash
npm run lint
npm run build
```

## Deployment

The project is configured for deployment on Vercel. See the [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying).
