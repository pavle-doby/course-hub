# Go-Live Plan

Steps, plans and pricing for launch. Creators pay; learning stays free for learners. Feature names match [FEATURES.md](FEATURES.md).

## Steps to go live

- [ ] 1. **Finish all open tasks**
  - Specs in [spec/task-init.md](spec/task-init.md): AI chat in the course editor (`[todo]-task-8.2.md`), AI usage tracking + bring-your-own key (`[todo]-task-10.2.md`)
  - Manual checks left unchecked on done tasks (1, 2, 8.0, 8.1, 10.1)
  - Stubs in [FEATURES.md](FEATURES.md) "Partially implemented": feedback page, Google login, avatar upload, admin user pages, per-course opt-in list. Finish or hide each one before launch.
  - Confirm every generated migration is applied to production
- [ ] 2. **Resolve payments from Serbia** (see [Payments](#payments))
  - Ask Paddle and Lemon Squeezy support whether they pay out to a Serbian company; pick one
  - Build the Pro plan: `plan` column, limit checks, checkout link, webhook (see [Implementation](#implementation-to-plan-as-a-task))
  - Terms of service, privacy policy, refund policy (required by the payment provider)
- [ ] 3. **Analytics**
  - Product analytics on web (and native later): sign-up, course created, course published, enrolled, lesson done, course done, upgrade to Pro
  - Funnels: visitor → sign-up → first published course → Pro
  - EU hosting and a cookie consent banner (GDPR)
- [ ] 4. **A/B testing**
  - Feature flags with experiments, using the same tool as analytics so results come from the same events
  - First experiments: pricing page (monthly vs yearly first), free plan limits, upgrade prompt copy
- [ ] 5. **Logging and bug tracking**
  - Error tracking on web (Next.js), API (Express) and native (Expo), with source maps and release tags
  - Ship the API's Pino logs to a log service with search and retention (Railway logs alone are short-lived)
  - Alerts for API errors, failed webhooks (Cloudflare Stream, payments) and the health endpoint (`GET /api/v1/health`)

Suggested tools: PostHog (EU cloud) covers 3 and 4 in one place; Sentry covers error tracking for 5; Better Stack or Axiom for logs and uptime.

## Free (Starter)

Enough to build and publish a real course.

- Auth, password reset, profile, settings, `en` / `sr`
- **Up to 3 published courses**, unlimited drafts
- Topics, lessons, thumbnails
- Documents: **500 MB** total
- Video: **30 minutes stored** in total
- **Manual quizzes** only
- Public courses only, open enrollment
- **Leaderboard** on every course
- Students page with basic counts
- Push notifications and notification history
- Everything on the learner side: catalog, enroll, reader, progress tracking, quizzes, reviews, leaderboard
- Later, with course payments: **10% platform fee**

## Pro (paid)

- **Unlimited courses**
- Video: **20 hours stored** (add-on for more)
- Documents: **20 GB**
- **AI quiz generation** (20 per day)
- **Private courses and invitations** (email and share link)
- **MCP / AI Connect** and personal access tokens
- **AI access for students** (`aiAccessEnabled`)
- **Replies to reviews**
- Full Students page (who completed what, and when)
- Later, with course payments: **0% platform fee**

## Pricing

| Plan         | Price                                      |
| ------------ | ------------------------------------------ |
| Free         | €0                                         |
| Pro          | €19 / month or €190 / year (2 months free) |
| Video add-on | €10 / month per extra 20 hours stored      |

Later, when there's demand: **Team / School** at about €49 / month (several creators, more video, branding).

Reasoning: Teachable, Thinkific and Podia start at about $39–49 / month and Kajabi at $149, so €19 is clearly cheaper while Course Hub has no payments yet. 20 hours of video costs about $6 / month in Cloudflare Stream storage (plus about $1 per 1,000 minutes watched), and AI quiz drafts cost cents, so Pro keeps a healthy margin.

## Payments

Stripe doesn't onboard Serbian-registered businesses (confirm on [stripe.com/global](https://stripe.com/global)).

- **Pro subscription**: a merchant of record (Paddle or Lemon Squeezy) that collects EU VAT and issues invoices. Before building, ask their support to confirm payouts to a Serbian company.
- **Learners buying courses** (later, separate task): a marketplace that pays creators. Needs Stripe Connect through a company abroad, or a local acquirer (AllSecure, Monri, CorvusPay, Payten/NestPay). Decide when that task starts; it builds on `courses.price`.

## Implementation (to plan as a task)

- `plan` column on users (`free` / `pro`)
- Limit checks in services: published course count, video minutes, document storage, AI quiz generation, invitations / private visibility, API tokens, review replies
- Hosted checkout link plus one webhook endpoint that sets `plan`
- Upgrade prompts in the web UI where a limit is hit
