# Dr. Pestana's Dental Office — website

A small static site built with [Hugo](https://gohugo.io). Designed to:

- Cut phone traffic by surfacing hours, location, what-to-bring, and payment info
- Let patients submit an **appointment request** (inquiry only — no PHI collected)
- Host the **referring-provider** form link
- Let staff post short **announcements** (holidays, late opens, closures)

---

## Run it locally

You need Hugo (extended) installed:

```sh
brew install hugo
```

Then from this directory:

```sh
hugo server
```

Open <http://localhost:1313>. Edits to content, layouts, or styles reload automatically.

To produce the final static files (drops them in `public/`):

```sh
hugo --minify
```

---

## Updating common things

### Hours, phone, address, referral link

All in [`hugo.toml`](./hugo.toml) under `[params]` and `[params.hours]`. Edit, save, refresh.

### "We speak Spanish" wording, hero copy, section text

In [`layouts/index.html`](./layouts/index.html). Treat it like editing an HTML file.

### What-to-bring / Payment / For-doctors sections

Same file: `layouts/index.html`. Sections are clearly commented.

### Adding a new announcement

Two ways:

**A. Use the Hugo CLI** (recommended — fills in the date for you):

```sh
hugo new content announcements/2026-11-27-thanksgiving-closure.md
```

Then open the created file and write the announcement body. Filename pattern: `YYYY-MM-DD-short-slug.md`.

**B. Copy an existing file** in [`content/announcements/`](./content/announcements/) and edit it. Make sure `date:` in the frontmatter is correct — newer dates appear first, and only the **three most recent** show on the homepage. Older ones stay in the archive at `/announcements/`.

To hide an announcement without deleting it (e.g., after a holiday passes), set `expired: true` in its frontmatter.

### Adding the patient-intake link later

When you're ready, paste it into `patientIntakeLink` in `hugo.toml`. (Note: nothing currently surfaces it — you'd want to add a small section to `layouts/index.html` calling it out. Happy to wire that up when the time comes.)

---

## Wiring up the appointment request form

The form action in `hugo.toml` is a **placeholder** (`https://formspree.io/f/YOUR_FORM_ID`). Until you replace it, submissions show "Form isn't wired up yet."

The form is deliberately **inquiry-only** — it collects name, DOB, phone, email, referral-yes/no, reason for visit, and insurance carrier *name* (not member ID). It does **not** accept ID photos, insurance card photos, or member IDs. That keeps the form well clear of HIPAA territory and lets you use any of the free form backends below.

### Option 1 — Formspree (works anywhere)

1. Sign up at <https://formspree.io>
2. Create a new form. Copy the endpoint (looks like `https://formspree.io/f/abcdwxyz`).
3. Paste it into `inquiryFormAction` in `hugo.toml`.
4. Configure Formspree to email you when a submission comes in.

Free tier: 50 submissions/month. Paid plans add file uploads, autoresponders, etc.

### Option 2 — Netlify Forms (only if hosted on Netlify)

1. Open [`layouts/partials/inquiry-form.html`](./layouts/partials/inquiry-form.html).
2. Add `data-netlify="true"` and `name="inquiry"` to the `<form>` tag.
3. Remove the `action` attribute (Netlify handles it).
4. Add a hidden input: `<input type="hidden" name="form-name" value="inquiry" />`.
5. Deploy. Submissions appear in your Netlify dashboard.

Free tier: 100 submissions/month.

### Option 3 — Web3Forms

Similar to Formspree. Sign up at <https://web3forms.com>, paste the access key as the form action.

### If you ever need to accept PHI

Use a HIPAA-compliant form provider with a signed BAA — examples: **Jotform HIPAA**, **Cognito Forms (HIPAA tier)**, **Formstack Healthcare**. None of the free options above are HIPAA-compliant. Talk to whoever advises you on compliance before flipping this on.

---

## Deploying

The site is fully static — any host that serves files works.

### Cloudflare (Workers Builds — recommended)

This repo includes a [`wrangler.toml`](./wrangler.toml) that tells Cloudflare to deploy the contents of `public/` as a static-assets Worker. With it in place, the only thing Cloudflare needs to know is how to *build* the site.

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Connect to Git**.
3. Pick this repo. In **Build settings**:
   - **Build command**: `hugo --minify --gc`
   - **Deploy command**: `npx wrangler deploy` *(this is the default — leave it)*
   - **Root directory**: *(leave blank)*
   - **Non-production branch deploy command**: `npx wrangler versions upload` *(default — leave it)*
4. Under **Build variables and secrets**, add:
   - `HUGO_VERSION` = whatever `just version` reports locally (currently `0.161.1`)
5. Save. Cloudflare will run the first build immediately, then auto-build on every push to `main`. PRs and branch pushes get preview URLs.

The Worker name (`pestana-dental`) and the production hostname (`pestana-dental.<account>.workers.dev`) come from the `name` field in `wrangler.toml`. Change it there if you want a different name.

### Netlify

1. Push to GitHub.
2. Netlify → **Add new site → Import from Git**.
3. Build command: `hugo --minify --gc`. Publish directory: `public`.
4. Add environment variable `HUGO_VERSION = 0.161.1`.
5. Deploy. (If using Netlify Forms, set that up as described above.)

### Custom domain

Both providers walk you through DNS setup. Point your domain's nameservers (or just an A/CNAME record) at the provider's edge.

### Before going live — update these

In `hugo.toml`:

- `baseURL` — change to your real domain (e.g., `https://pestanadental.com/`).
- `inquiryFormAction` — your real form endpoint.
- `email` — if you want a contact email surfaced (currently blank).

In `layouts/partials/head.html`:

- The JSON-LD address/phone/hours are hard-coded — update if the office details change.

---

## Project layout

```
hugo.toml                       # site config + editable params
wrangler.toml                   # Cloudflare deploy config (static assets)
justfile                        # task runner (`just` to list commands)
archetypes/announcements.md     # template used by `hugo new content`
content/
  announcements/
    _index.md                   # archive page intro
    2026-05-20-welcome.md       # sample announcement
layouts/
  _default/
    baseof.html                 # base wrapper
    single.html                 # individual announcement pages
    list.html                   # announcement archive
  index.html                    # homepage (all sections)
  404.html                      # friendly not-found page
  partials/
    head.html
    header.html
    footer.html
    announcements.html          # homepage announcement strip
    inquiry-form.html
static/
  css/style.css
  js/main.js                    # form fetch + referral-note toggle
```

---

## Accessibility & SEO notes

- Skip-link for keyboard users, focus-visible outlines, semantic HTML (`<section>`, `<address>`, `<time>`, etc.).
- JSON-LD `Dentist` schema in `<head>` for richer Google results.
- Mobile-first responsive, no horizontal scroll at 320px.
- Respects `prefers-reduced-motion`.
- All images are decorative emojis with `aria-hidden="true"`. If you add real photos, give them descriptive `alt` text.
