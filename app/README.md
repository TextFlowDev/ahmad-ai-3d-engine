# RenderForge — 2D to 3D Model Converter

A SaaS application that transforms 2D images, drawings, and vector art into detailed 3D models using AI. Built with Next.js, PlayCanvas engine, and pluggable AI providers.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js Frontend                │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Upload   │ │ Dashboard│ │ PlayCanvas       │ │
│  │ Zone     │ │ + Gallery│ │ 3D Viewer        │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│                 Next.js API Routes               │
│  /api/convert  /api/jobs  /api/stripe  /api/auth│
├─────────────────────────────────────────────────┤
│          BullMQ Job Queue (Redis)                │
├─────────────────────────────────────────────────┤
│         Conversion Worker (separate process)     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Meshy AI │ │ TripoSR  │ │ OpenAI Shap-E    │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│  PostgreSQL (Prisma)  │  S3 Storage  │  Stripe  │
└─────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **3D Viewer**: PlayCanvas Engine (WebGL2/WebGPU)
- **Auth**: NextAuth.js (Google, GitHub OAuth)
- **Database**: PostgreSQL via Prisma ORM
- **Payments**: Stripe Billing (subscriptions)
- **Job Queue**: BullMQ + Redis
- **Storage**: S3-compatible (AWS S3 or Cloudflare R2)
- **AI Providers**: Meshy, TripoSR (Stability AI), OpenAI Shap-E

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- S3-compatible storage

### Setup

```bash
cd app

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Start the dev server
npm run dev

# In a separate terminal, start the conversion worker
npm run worker
```

### Environment Variables

See `.env.example` for all required variables. At minimum you need:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random secret for session encryption
- `REDIS_URL` — Redis connection for job queue
- One AI provider API key (e.g., `MESHY_API_KEY`)

## Subscription Plans

| Plan       | Price  | Conversions | Qualities          | Formats            |
|------------|--------|-------------|--------------------|--------------------|
| Free       | $0/mo  | 3/month     | Draft              | GLB                |
| Starter    | $19/mo | 50/month    | Draft, Standard    | GLB, glTF          |
| Pro        | $49/mo | 200/month   | Draft, Std, High   | GLB, glTF, OBJ, FBX|
| Enterprise | $149/mo| 1000/month  | All qualities      | All formats        |

## AI Providers

The system uses a pluggable provider architecture. To add a new AI provider:

1. Create a class extending `AIProvider` in `src/lib/ai/`
2. Implement `startConversion()`, `getStatus()`, and `cancelConversion()`
3. Register it in `src/lib/ai/index.ts`

## Project Structure

```
app/
├── prisma/schema.prisma          # Database schema
├── src/
│   ├── app/                      # Next.js pages & API routes
│   │   ├── api/                  # REST API endpoints
│   │   ├── dashboard/            # User dashboard
│   │   ├── pricing/              # Pricing page
│   │   └── viewer/[id]/          # 3D model viewer
│   ├── components/               # React components
│   │   ├── PlayCanvasViewer.tsx   # 3D viewer (PlayCanvas)
│   │   ├── UploadZone.tsx        # Drag & drop upload
│   │   ├── ConversionForm.tsx    # Quality/format options
│   │   └── ...
│   ├── lib/                      # Backend utilities
│   │   ├── ai/                   # AI provider integrations
│   │   ├── auth.ts               # NextAuth config
│   │   ├── db.ts                 # Prisma client
│   │   ├── queue.ts              # BullMQ job queue
│   │   ├── storage.ts            # S3 storage
│   │   └── stripe.ts             # Stripe billing
│   ├── hooks/                    # React hooks
│   ├── types/                    # TypeScript types
│   └── workers/                  # Background workers
│       └── conversion-worker.ts  # Job processing
```
