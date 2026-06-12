# CrossLens

CrossLens is a mobile-first MVP for an anti-filter-bubble, cross-disciplinary question box. Users draw unfamiliar questions or enter their own, then receive an interdisciplinary analysis through CrossLens.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Local question bank in `data/questions.ts`
- DeepSeek API route in `app/api/analyze/route.ts`
- Mock fallback in `lib/mockAi.ts`

## Local Development

Use Node.js `>=20.9 <25`. Node 24 is supported by this project.

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_LIFE_MODEL=deepseek-v4-flash
DEEPSEEK_ANALYZE_MODEL=deepseek-v4-flash
DEEPSEEK_CAREER_MODEL=deepseek-v4-flash
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Next.js in your terminal.

## Build

Run the production build locally:

```bash
npm run build
```

Preview the production build:

```bash
npm run start
```

## DeepSeek API Key

1. Open the DeepSeek Platform.
2. Sign in and create an API key from the API keys section.
3. Put the key in `.env.local` as `DEEPSEEK_API_KEY`.
4. Keep `.env.local` private and never commit it.

The frontend never reads `DEEPSEEK_API_KEY`. It only calls server API routes such as `/api/analyze`, `/api/life-lens`, and `/api/career-bridge`. The API key is read server-side only.

To test whether DeepSeek is reachable from the deployed app, open:

```bash
/api/deepseek-ping
```

It uses `DEEPSEEK_LIFE_MODEL` or `deepseek-v4-flash`, disables thinking, and returns latency plus any failure reason.

## Mock Mode And Real AI Mode

- Mock mode: If `DEEPSEEK_API_KEY` is missing, CrossLens automatically uses `mockAIAnalysis` and shows `当前为本地演示答案，未连接真实 DeepSeek。`
- Real AI mode: If `DEEPSEEK_API_KEY` exists and DeepSeek responds successfully, `/api/analyze` returns the DeepSeek analysis.
- Fallback: If the DeepSeek request fails, CrossLens automatically returns the local mock result with the same fallback notice.

## Vercel Deployment

1. Push this project to a GitHub repository.
2. Open Vercel and choose `Add New Project`.
3. Import the GitHub repository.
4. Keep the framework preset as `Next.js`.
5. Add environment variables in Vercel Project Settings:

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_LIFE_MODEL=deepseek-v4-flash
DEEPSEEK_ANALYZE_MODEL=deepseek-v4-flash
DEEPSEEK_CAREER_MODEL=deepseek-v4-flash
```

6. Use the build command from `package.json`:

```bash
npm run build
```

7. Deploy. Vercel will provide a public URL that can be opened on mobile phones and other computers.

## Windows And Node 24 Notes

The project uses Next.js 16 and explicitly runs Next with webpack in `package.json`:

```bash
npm run dev
npm run build
```

If you see `Failed to load SWC binary for win32/x64`, check these first:

- `node -p "process.platform + ' ' + process.arch"` should print `win32 x64`.
- `node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node` should exist after `npm install`.
- Install or repair Microsoft Visual C++ Redistributable 2015-2022 x64 if the SWC package exists but cannot load.

## Key Files

- `app/page.tsx` - Main UI, random draw flows, language switch, Thinking Card copy action
- `app/api/analyze/route.ts` - Server-side DeepSeek request and mock fallback
- `data/questions.ts` - Local question bank
- `lib/mockAi.ts` - Lens selection and mock fallback logic
- `lib/types.ts` - Shared TypeScript types
