# CalOpen Launch Kit (copy-paste ready)

## Product Hunt

**Tagline:** Open source appointment scheduling you can self-host

**Description:**
Cal.com went closed-source. Calendly owns your data. CalOpen is the MIT-licensed alternative: online booking, PayPal payments, Google Calendar sync, guest self-cancel links, and one-command Docker self-hosting. Free for 1 user, Korean + English UI.

**First comment (maker):**
Hey Hunters! I built CalOpen after Cal.com closed its source. If you run a clinic, studio, or freelance practice and want booking without vendor lock-in (or per-seat fees), try it: live demo linked, `docker compose up` for self-host. Happy to answer anything!

## Hacker News (Show HN)

**Title:** Show HN: CalOpen – MIT-licensed open-source scheduling (Cal.com alternative)

**Body:**
After Cal.com went closed-source in April, I built CalOpen: appointment scheduling under MIT.

- Public booking pages with timezone-aware slots, guest cancel links (signed URLs)
- PayPal subscriptions + one-time payments (server-verified + webhooks)
- Google Calendar two-way sync (busy blocking + auto event creation)
- Daily reminder emails via cron, Korean/English UI
- `docker compose up` self-host; runs on free Vercel/Supabase/Resend tiers

Stack: Next.js 15, Supabase, Drizzle, PayPal API. Would love feedback on the self-host story especially.

## Reddit r/selfhosted

**Title:** CalOpen – self-hosted open-source appointment scheduling (Calendly/Cal.com alternative) [MIT]

**Body:**
Hey all! Sharing my project: CalOpen — booking pages, PayPal payments, Google Calendar sync, reminder emails, all MIT licensed.

One-command start:
```
git clone https://github.com/flffkaos-pixel/calopen
cd calopen && ./docker-setup.sh
```

Needs only a free Supabase project for auth. No phone-home, no tracking. Feedback welcome!

## Reddit r/opensource — same angle, emphasize MIT + no CLA.

## X / Twitter (thread)

1/ Cal.com went closed-source. So I built an MIT alternative: CalOpen — appointment scheduling you can self-host. Booking + PayPal + Google Calendar + reminders. Free. 🧵
2/ Hosts get a public link: guests pick slots, pay via PayPal, cancel by themselves. No phone tag.
3/ Self-host in one command: docker compose up. Your data stays yours.
4/ Live: https://calopen.vercel.app — try booking a test slot. Stars welcome: [repo link]

## Korean (X/Threads/OKKY)

**제목:** Cal.com이 클로즈드로 바뀌어서 오픈소스 예약 시스템 만들었습니다 (MIT)

**본문:**
미용실·병원·과외처럼 전화 예약 받는 곳을 위한 예약 페이지 서비스입니다.
- 링크 하나로 손님이 직접 예약/취소, PayPal 결제, 구글 캘린더 자동 연동
- Docker 한 줄로 셀프호스팅, 데이터는 내 서버에
- 한글 지원, 1인은 무료
데모: https://calopen.vercel.app / 코드: [repo link]

## Directories to submit (free)

- AlternativeTo: https://alternativeto.net (list as Calendly/Cal.com alternative)
- SaaSHub, Uneed, Microlaunch, BetaList
- Hacker News Launch (Y Combinator): https://www.ycombinator.com/launch
- Korean: OKKY jobs/project board, 인프런 멘토링? (later)

## Launch checklist

- [ ] Screenshots (landing/booking/dashboard) in README + PH gallery
- [ ] GitHub topics: scheduling, booking, calendly-alternative, calcom-alternative, self-hosted, nextjs, paypal, mit
- [ ] Post Show HN Tue–Thu morning US time
- [ ] Post r/selfhosted + r/opensource (stagger days)
- [ ] X thread + Korean thread same day
- [ ] Submit directories over the following week
