# Vertical Digital IT7 System

Real-time, zero-cost digital IT7 optimized for 9:16 portrait displays (1080x1920). Supports both video (.mp4, .webm, .mov) and image (.jpg, .png, .webp) assets with instant WebSocket synchronization across all edge display terminals.

---

## Quick Start

### 1. Environment Setup

Copy the environment template and fill in your Supabase credentials:

```bash
cp .env.local .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Database & Storage Setup

1. Create a new Supabase project (free tier).
2. Go to **Storage** > Create Bucket named `IT7-assets`.
3. Set bucket to **Public** (for read access) and enable RLS for writes.
4. Go to **SQL Editor** and run `schema.sql`.

### 4. Local Development

```bash
npm run dev
```

- **Public Display**: `http://localhost:3000/display`
- **Admin Panel**: `http://localhost:3000/admin`

---

## Deployment Pipeline (Zero-Cost)

### 1. Initialize Repository

```bash
git init
git add .
git commit -m "Initial vertical IT7 deployment"
```

### 2. Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 3. Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Configure **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy.

---

## System Architecture

### Database Schema (`public.active_IT7_state`)

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `display_slot` | TEXT | Unique slot identifier (`primary_portrait`) |
| `media_url` | TEXT | Public asset URL |
| `media_name` | TEXT | Human-readable file name |
| `media_type` | TEXT | `video` or `image` |
| `mime_type` | TEXT | MIME type for correct rendering |
| `updated_at` | TIMESTAMP | Last broadcast time |

### Real-Time Behavior

- The `/display` page establishes a persistent `realtime` WebSocket subscription via `supabase-js`.
- When the `/admin` panel updates the `media_url` and `media_type` in the database, all connected `/display` clients receive the payload instantly and switch media without page reload.
- Videos are reloaded via `video.load()` and `video.play()` to prevent playback interruption artifacts.

---

## Component Reference

### `/display` (`/app/display/page.tsx`)

Full-screen vertical media player (`w-screen h-screen`, `overflow-hidden`). Dynamically renders:

- `<video>` with `autoplay`, `loop`, `muted`, `playsInline`, `preload="auto"` for video types.
- `<img>` with `loading="eager"` and `object-fit: cover` for image types.

Includes a subtle branding overlay at the bottom of the viewport.

### `/admin` (`/app/admin/page.tsx`)

Administrative dashboard with:

- Dual-asset ingestion (video/image) with automatic MIME type detection.
- Upload progress indicator.
- Live preview frame simulating the 9:16 portrait aspect ratio.
- Real-time state broadcast confirmation with toast-style messaging.

---

## Technical Specifications

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS (arbitrary values, viewport units)
- **Backend**: Supabase (Postgres + Storage + Realtime WebSockets)
- **Aspect Ratio**: 9:16 portrait (`aspect-[9/16]` for preview, full viewport for display)
- **Media Coverage**: `object-fit: cover` on all media elements to eliminate letterboxing

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous public key |

---

## Security & Policies

- `public.active_IT7_state` has RLS enabled.
- Public read access is allowed (`USING (true)`) for display terminals.
- Write access is open for the admin panel (`USING (true) WITH CHECK (true)`).
  - **Production Note**: Restrict `UPDATE` and `INSERT` policies to authenticated admin roles if exposing the admin endpoint publicly.

---

## Zero-Cost Stack

| Service | Tier | Cost |
|---|---|---|
| Supabase | Free Plan (500MB DB, 1GB Storage) | $0 |
| Vercel | Hobby Plan | $0 |
| GitHub | Public Repository | $0 |

---

## Troubleshooting

**Autoplay blocked**: Modern browsers block autoplay with sound. The video element is explicitly `muted`, which satisfies autoplay policies. If interrupted, the `catch` handler logs a console warning.

**File not updating**: Ensure the `media_url` in the database points to the new public URL. The `/display` component uses the URL as a `key` prop to force React remounting.

**Realtime not connecting**: Verify the `supabase_realtime` publication includes `public.active_IT7_state`. Check the `realtime` params in `lib/supabase.ts`.

