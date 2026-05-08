# Resume Creator

A Next.js resume editor that turns pasted resume text into a structured, printable resume layout.

## What It Does

- Paste plain-text resume content into the sidebar.
- Send that text to Gemini for structured parsing.
- Edit header, experience, skills, projects, education, certifications, and print settings.
- Preview the resume as paginated letter-size pages in the browser.
- Print the resume or download a plain-text version.

## Main Features

- Gemini-powered resume parsing through `/api/process-resume`
- Editable two-page resume preview with visual page breaks
- Sidebar controls for content, ordering, visibility, styling, and print settings
- Print flow that works without popup windows
- TXT export for plain-text output

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Gemini API

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create or edit `.env.local` and set:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

The API route also supports these fallbacks:

```env
GOOGLE_GENERATIVE_AI_API_KEY=
GOOGLE_API_KEY=
```

3. Start the dev server:

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js will choose another port such as `3001`.

## Scripts

- `npm run dev` - start the local dev server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run linting

## Gemini Processing Notes

- The app sends pasted resume text to Gemini and expects JSON back.
- Bullet markers returned by Gemini are normalized before rendering so the UI does not double-render list bullets.
- If the Gemini API is unavailable or slow, the route fails with a timeout instead of hanging forever.

## Printing

- The preview is rendered as letter-size pages.
- On-screen pages show a visual gap between pages.
- Print output removes the on-screen page gap so the printed result stays clean.

## Deployment

For production deployment, set the same Gemini environment variable in your hosting provider:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Then run:

```bash
npm run build
```

## Project Structure

- [app/page.tsx](/Users/faitheyates/Documents/Documents%20-%20Faithe%E2%80%99s%20MacBook%20Pro/GitHub/resume-creator/app/page.tsx) - app entry page
- [app/api/process-resume/route.ts](/Users/faitheyates/Documents/Documents%20-%20Faithe%E2%80%99s%20MacBook%20Pro/GitHub/resume-creator/app/api/process-resume/route.ts) - Gemini parsing route
- [resume-page.tsx](/Users/faitheyates/Documents/Documents%20-%20Faithe%E2%80%99s%20MacBook%20Pro/GitHub/resume-creator/resume-page.tsx) - resume preview and layout logic
- [side-screen.tsx](/Users/faitheyates/Documents/Documents%20-%20Faithe%E2%80%99s%20MacBook%20Pro/GitHub/resume-creator/side-screen.tsx) - editing sidebar UI
- [resume-download.tsx](/Users/faitheyates/Documents/Documents%20-%20Faithe%E2%80%99s%20MacBook%20Pro/GitHub/resume-creator/resume-download.tsx) - print and TXT export
- [app/globals.css](/Users/faitheyates/Documents/Documents%20-%20Faithe%E2%80%99s%20MacBook%20Pro/GitHub/resume-creator/app/globals.css) - global styles and print behavior
