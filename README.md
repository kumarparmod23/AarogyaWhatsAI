# AarogyaWhatsAI - Healthcare WhatsApp Automation

AI-powered WhatsApp automation platform for Indian clinics and doctors. Automate patient engagement, appointment booking, follow-ups, and feedback collection — all in Hindi/Hinglish.

## Features

- **AI Conversations** — Natural Hindi/Hinglish conversations powered by GPT-4o / Claude / Grok (switchable)
- **WhatsApp Integration** — Official Meta Business Cloud API with template messages, media, and 24-hour session management
- **Lead Management** — Automatic capture, scoring, tagging (New, Hot, Follow-up, Booked, etc.)
- **Patient Database** — Name, phone, age, gender, medical notes, AI conversation summaries
- **Appointment System** — AI-assisted booking with automated reminders (24hr + 2hr before)
- **Post-Treatment Follow-ups** — Automated check-ins on Day 1, 3, 7, and 30
- **Feedback Collection** — NPS scoring + open-text feedback
- **Campaign Builder** — Bulk messaging and scheduled broadcasts
- **Analytics Dashboard** — Response rate, booking rate, NPS, no-show reduction
- **Human Takeover** — Doctor/admin can take over any AI chat instantly
- **Privacy & Consent** — Built-in consent flow, data privacy compliance

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Google + Email magic link) |
| AI | OpenAI GPT-4o / Anthropic Claude / xAI Grok (switchable via env) |
| WhatsApp | Meta WhatsApp Business Cloud API |
| Job Queue | BullMQ + Redis |
| Deployment | Docker + docker-compose |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Meta WhatsApp Business API access
- AI provider API key (OpenAI / Anthropic / xAI)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd AarogyaWhatsAI
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Setup Database

```bash
npx prisma db push    # Create tables
npx prisma db seed    # Seed sample data
```

### 4. Run Development Server

```bash
npm run dev            # Start Next.js on http://localhost:3000
npm run worker         # Start BullMQ worker (separate terminal)
```

### 5. Using Docker (Alternative)

```bash
docker-compose up -d
```

## Connecting Meta WhatsApp Business API

### Step 1: Create Meta Developer Account
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app → Select "Business" type
3. Add "WhatsApp" product to your app

### Step 2: Get API Credentials
1. In WhatsApp > Getting Started, note your:
   - **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **WhatsApp Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`
2. Generate a **permanent access token**:
   - Go to Business Settings > System Users
   - Create a system user with admin role
   - Generate a token with `whatsapp_business_messaging` permission
   - Save as `WHATSAPP_ACCESS_TOKEN`

### Step 3: Configure Webhook
1. In WhatsApp > Configuration > Webhook:
   - **Callback URL**: `https://your-domain.com/api/webhooks/whatsapp`
   - **Verify Token**: Same value as your `WHATSAPP_VERIFY_TOKEN` env var
2. Subscribe to these webhook fields:
   - `messages`
   - `message_deliveries`
   - `message_reads`

### Step 4: Get Templates Approved
1. Go to WhatsApp > Message Templates
2. Create templates matching the ones in `prisma/seed.ts`
3. Submit for Meta review (usually 24-48 hours)

### Step 5: Get App Secret
1. Go to App Settings > Basic
2. Copy **App Secret** → `WHATSAPP_APP_SECRET` (for webhook signature verification)

## Project Structure

```
AarogyaWhatsAI/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data + sample templates
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── inbox/         # WhatsApp chat inbox
│   │   │   ├── patients/      # Patient management
│   │   │   ├── campaigns/     # Campaign builder
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   └── settings/      # Configuration
│   │   └── api/
│   │       ├── auth/          # NextAuth endpoints
│   │       ├── webhooks/      # WhatsApp webhook handler
│   │       ├── patients/      # Patient CRUD
│   │       ├── messages/      # Chat messages + send
│   │       ├── campaigns/     # Campaign management
│   │       └── analytics/     # Dashboard stats
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── dashboard/         # Dashboard layout components
│   │   ├── chat/              # Chat inbox components
│   │   ├── patients/          # Patient table/cards
│   │   └── campaigns/         # Campaign builder
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── whatsapp.ts        # WhatsApp API client
│   │   ├── utils.ts           # Utility functions
│   │   ├── ai/
│   │   │   ├── engine.ts      # AI conversation engine
│   │   │   ├── providers.ts   # Switchable AI providers
│   │   │   └── prompts.ts     # System prompts (Hindi/Hinglish)
│   │   └── queue/
│   │       ├── jobs.ts        # Job scheduling
│   │       └── worker.ts      # BullMQ workers
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Deployment

### Option A: Vercel + Railway

**Frontend (Vercel):**
1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set all environment variables from `.env.example`
4. Deploy

**Database + Redis (Railway):**
1. Create a new project on [railway.app](https://railway.app)
2. Add PostgreSQL and Redis services
3. Copy connection strings to Vercel env vars
4. Run `npx prisma db push` via Railway CLI

**Worker (Railway):**
1. Add another service in Railway
2. Set start command: `npm run worker`
3. Use same env vars as the main app

### Option B: Docker (VPS)

```bash
# On your VPS
git clone <repo> && cd AarogyaWhatsAI
cp .env.example .env
# Edit .env with production values

docker-compose up -d

# Run migrations
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed
```

### Option C: Render

1. Create a Web Service from your repo
2. Build Command: `npm install && npx prisma generate && npm run build`
3. Start Command: `npm start`
4. Add PostgreSQL and Redis from Render dashboard
5. Set environment variables

## Sample WhatsApp Message Templates

These templates need Meta approval. Submit them in the Meta Business Manager:

### 1. Welcome Message (`welcome_message`)
```
Language: Hindi (hi)
Category: Utility

नमस्ते {{1}}! 🙏
{{2}} में आपका स्वागत है।
हम आपकी कैसे मदद कर सकते हैं?
1️⃣ अपॉइंटमेंट बुक करें
2️⃣ डॉक्टर से बात करें
3️⃣ क्लिनिक का पता जानें
```

### 2. Appointment Reminder (`appointment_reminder`)
```
Language: Hindi (hi)
Category: Utility

नमस्ते {{1}}! 🏥
📅 तारीख: {{2}}
⏰ समय: {{3}}
🏥 {{4}}
क्या आप आ रहे हैं?
1️⃣ हाँ  2️⃣ रिशेड्यूल  3️⃣ कैंसल
```

### 3. Post-Treatment Follow-up (`post_treatment_day1`)
```
Language: Hindi (hi)
Category: Utility

नमस्ते {{1}}! 🙏
कल आपका इलाज हुआ था। कैसा महसूस कर रहे हैं?
1️⃣ अच्छा ✅  2️⃣ थोड़ी तकलीफ़ 😐  3️⃣ बहुत परेशानी 🆘
```

### 4. Feedback Request (`feedback_request`)
```
Language: Hindi (hi)
Category: Marketing

नमस्ते {{1}}! 🙏
{{2}} में अनुभव कैसा रहा?
0-10 में नंबर बताएं (10 = बहुत अच्छा)
```

## License

MIT
