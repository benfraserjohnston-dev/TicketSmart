# TicketSmart

**A mobile-first flight fare comparison prototype focused on total trip cost and transparent inclusions.**

TicketSmart is a GitHub-ready static web app. It works in a browser without a build step and is suitable for GitHub Pages. It includes an interactive search form, demonstration flight cards, baggage/seat/flexibility comparisons, total-cost calculations, saved offers for the current session, and a rule-based conversational demo assistant.

## Important: current status

- **Working now:** responsive UI, search-form interactions, sorting, direct-flight filtering, passenger-aware example calculations, unknown add-on handling, comparison details, session-only saved examples, and demo chat.
- **Not connected:** live airline inventory/pricing, airline API or NDC access, live AI model, booking/revalidation, user accounts, persistent saved searches, price alerts, email/push notifications.
- **All visible flight prices are fictional demo fixtures. They are not live and cannot be booked.** Do not advertise them as actual fares.
- The source currently labels each example offer `DEMO DATA`. No airline integrations are claimed.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser.
3. No Node.js, Mac, build step or API key is required for the demo.

## Publish from an iPhone using GitHub

1. Create a repository on GitHub named `ticketsmart` (or another name).
2. Add the files and folders from this project to the repository. The easiest route on GitHub mobile/web is **Add file → Upload files**; upload `index.html`, `styles.css`, `app.js`, `README.md`, and the `assets` folder.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for GitHub Pages to publish. Your URL will look like `https://YOUR-USERNAME.github.io/ticketsmart/`.

If GitHub Pages isn't visible, check that the repository has been created and you have opened its Settings page, not the profile settings.

## Project files

```text
ticketsmart/
├── index.html
├── styles.css
├── app.js
├── README.md
└── assets/
    └── favicon.svg
```

## Before real airline pricing can be added

A static GitHub Pages frontend cannot safely hold API secrets or run private server integrations. Add a backend (for example, a serverless API or a small FastAPI/Node service) and configure an authorised airline-direct data provider.

The provider adapter should return normalized offers containing:
- source/provider identity and proof of airline-direct source
- fare total, currency, passenger count and tax breakdown
- flight segments, operating carrier, times, stops and duration
- fare brand and fare rules
- baggage/seat/ancillary prices with `included`, `paid`, `not_included`, or `unknown` status
- booking/deep link where supplied by the airline
- checked-at timestamp, offer expiry and revalidation capability

Never invent a provider endpoint or claim that an airline connection is live until credentials and permissions are in place. Do not scrape restricted websites. Before redirecting to book, revalidate the exact offer through the authorised source.

## Suggested production architecture

- Frontend: this UI can later be migrated to Next.js + TypeScript.
- Backend: TypeScript API or Python FastAPI.
- Database: PostgreSQL for accounts, saved searches and actual observed price history.
- Jobs: scheduled provider refreshes for price alerts.
- AI: server-side model with tool calls to structured search APIs. The model should only describe returned offer data, not invent fares.
- Security: secrets only in server-side environment variables; rate limiting, validation, logging without sensitive data, and supplier-specific caching rules.
- Testing: unit tests for totals, unknown ancillary prices, passenger multiplication, sorting and source verification.

## Data integrity rules

1. No OTA fare results.
2. No “airline direct” badge without verifiable provenance.
3. Unknown add-on prices are not treated as free.
4. Cached offers show the last checked time and are revalidated before booking.
5. No fabricated price history.
6. No booking claim unless a real booking confirmation exists.

## License

This starter is provided as a prototype. Add a license appropriate to your intended project before accepting outside contributions.
