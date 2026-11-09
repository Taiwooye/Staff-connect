# StaffConnect

StaffConnect is a prototype for connecting households with household professionals. The initial launch locations are Lagos and Oyo, with state and area options maintained in `app/locations.ts` so other locations can be added later.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Prototype features

- Browse and filter sample professional profiles by state, area, skills, and work arrangement at `/maids`.
- Open a profile at `/maids/[id]` to review experience, qualifications, languages, interests, and work preferences.
- Save profiles during the current browser session and filter the directory to saved profiles.
- Create a temporary household or professional profile through `/onboarding`; professional previews support one profile photo and up to two gallery images.

All directory profiles are fictional sample data. Qualifications are illustrative and unverified. Profile previews, selected images, and saved profiles exist only in browser memory; this prototype does not create accounts, publish listings, or upload or persist form data. Image selection accepts JPEG, PNG, or WebP up to 5 MB per image. Do not enter real personal or sensitive information.

## Checks

```bash
npm run lint
npm run build
```

## Deployment

The project is configured for deployment on Vercel. See the [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying).
