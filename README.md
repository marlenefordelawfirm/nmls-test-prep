# NMLS Test Prep Application

A comprehensive Next.js application for NMLS (Nationwide Multistate Licensing System) exam preparation, featuring practice tests, full exams, AI-powered study assistance, and analytics.

## Features

- 📚 **Content Area Practice Tests** - Targeted practice by content area
- 📝 **Full Exam Simulations** - Complete NMLS exam experience
- 🤖 **AI Study Agent** - Interactive AI tutor powered by OpenAI
- 📊 **Analytics Dashboard** - Track progress, identify strengths/weaknesses
- 👥 **User Management** - Authentication, subscription tiers (Free, Monthly, Annual)
- 📧 **Email Integration** - Test results and study reminders via Resend
- 🐛 **Error Monitoring** - Real-time error tracking with Sentry
- 🎨 **Modern UI** - Dark mode support with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Email**: Resend API
- **AI**: OpenAI GPT-4
- **Error Monitoring**: Sentry
- **Deployment**: Vercel
- **Testing**: Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Required API keys:
  - Sentry DSN (error monitoring)
  - OpenAI API key (AI features)
  - Resend API key (email)
  - Database URL (PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nmls-test-prep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nmls"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Sentry Error Monitoring
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"

# OpenAI
OPENAI_API_KEY="your-openai-key"

# Email
RESEND_API_KEY="your-resend-key"
EMAIL_FROM="noreply@yourdomain.com"
```

4. Initialize database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test:e2e     # Run Playwright E2E tests
```

## Error Monitoring with Sentry

This application uses **Sentry** for comprehensive error monitoring and performance tracking.

### Quick Test

Visit `/sentry-example-page` or `/test-sentry` to trigger test errors and verify Sentry integration.

### Monitoring Features

- ✅ Client-side error tracking (browser)
- ✅ Server-side error tracking (API routes, SSR)
- ✅ Edge runtime monitoring (middleware)
- ✅ Performance monitoring (transactions, spans)
- ✅ Session replay with privacy controls
- ✅ Breadcrumbs for debugging context
- ✅ Source map upload for readable stack traces

### Viewing Errors

1. Go to [sentry.io](https://sentry.io)
2. Select project: **nmls-test-prep**
3. Navigate to **Issues** to view errors
4. Check **Performance** for slow transactions

### Detailed Documentation

For comprehensive Sentry setup, troubleshooting, and best practices, see **[SENTRY.md](./SENTRY.md)**.

## Database Schema

The application uses Prisma with the following main models:

- `User` - User accounts with authentication
- `ContentArea` - NMLS exam content areas
- `Topic` & `SubTopic` - Hierarchical topic organization
- `Question` - Exam questions with answers
- `TestAttempt` - User test submissions
- `UserAnswer` - Individual question responses
- `Subscription` - User subscription management

Run `npx prisma studio` to explore the database visually.

## Project Structure

```
nmls-test-prep/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── practice/     # Practice test pages
│   │   ├── exam/         # Full exam pages
│   │   └── analytics/    # Analytics dashboard
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   │   ├── db.ts         # Prisma client
│   │   ├── email.ts      # Email service
│   │   └── auth-helpers.ts
│   └── services/         # Business logic services
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── tests/
│   └── e2e/              # Playwright tests
├── public/               # Static assets
├── SENTRY.md             # Sentry documentation
└── CLAUDE.md             # AI agent context

```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login and link project:
```bash
vercel login
vercel link
```

3. Add environment variables:
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add SENTRY_DSN
vercel env add NEXT_PUBLIC_SENTRY_DSN
vercel env add OPENAI_API_KEY
vercel env add RESEND_API_KEY
```

4. Deploy:
```bash
vercel --prod
```

**Current Production URL**: https://nmls-test-prep-ordytgy9a-marlene-fordes-projects.vercel.app

### Environment Variables Setup

All environment variables must be added for `production`, `preview`, and `development` environments in Vercel:

```bash
vercel env add VARIABLE_NAME production preview development
```

## Testing

### End-to-End Tests

Run Playwright tests:
```bash
npm run test:e2e
```

Run specific test file:
```bash
npm run test:e2e -- tests/e2e/sentry/sentry-integration.spec.ts
```

Run in UI mode:
```bash
npx playwright test --ui
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm run lint && npm run test:e2e`
4. Commit with descriptive message
5. Push and create pull request

## Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Learn Next.js](https://nextjs.org/learn)

### Tools & Services
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API](https://platform.openai.com/docs)

## License

[Your License Here]

## Support

For issues or questions:
- Check [SENTRY.md](./SENTRY.md) for error monitoring help
- Review [CLAUDE.md](./CLAUDE.md) for project context
- Open an issue on GitHub

---

**Last Updated**: February 6, 2026
**Version**: 1.0.0
**Status**: In Development
