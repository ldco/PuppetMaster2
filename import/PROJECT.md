# Project Specification

<!--
Fill out this document to describe the project you want to build.
Then run /pm-migrate to analyze requirements and create an implementation plan.

Delete sections that don't apply. Add details where needed.
The more specific you are, the better the analysis.
-->

## Overview

**Project Name**:
**Client/Company**:
**Description**:
<!-- What is this project? What problem does it solve? -->

**Target Users**:
<!-- Who will use this? Customers? Employees? Both? -->

## Application Type

<!-- Which mode fits best? -->
- [ ] **website-admin** — Public website + hidden admin panel (most common)
- [ ] **website-app** — Public website + visible login/app area
- [ ] **app-only** — No public website, just authenticated app
- [ ] **website-only** — Static website, no admin/login

## Pages & Sections

### Public Website (if applicable)
<!-- List the pages/sections you need -->

- [ ] Hero section
- [ ] About / Company info
- [ ] Services / What we offer
- [ ] Portfolio / Work / Projects
- [ ] Team / People
- [ ] Testimonials / Reviews
- [ ] Pricing / Plans
- [ ] Blog / News
- [ ] FAQ
- [ ] Contact
- [ ] Clients / Partners logos
- [ ] Features / Benefits
- [ ] Other: _______________

### App/Admin Pages (if applicable)
<!-- What does the logged-in user see? -->

- [ ] Dashboard
- [ ] User management
- [ ] Content management (blog, portfolio, etc.)
- [ ] Settings
- [ ] Analytics / Reports
- [ ] Other: _______________

## Features

### Core Features
- [ ] **Multilingual** — Languages needed: _______________
- [ ] **Dark mode** — Light/dark theme toggle
- [ ] **PWA** — Installable, offline support
- [ ] **Contact notifications** — Email/Telegram on form submit

### Content Modules
<!-- Which content types do you need to manage? -->
- [ ] **Portfolio** — Projects, galleries, case studies
- [ ] **Blog** — Posts, categories, tags
- [ ] **Team** — Member profiles, roles
- [ ] **Pricing** — Tiers, comparison table
- [ ] **Testimonials** — Customer reviews, ratings
- [ ] **FAQ** — Question/answer pairs
- [ ] **Clients** — Logo showcase
- [ ] **Features** — Feature cards, benefits

## Design & Branding

### Colors
<!-- Existing brand colors? Or describe the vibe. -->
- Primary:
- Secondary:
- Accent:
- Style: [ ] Professional [ ] Playful [ ] Minimal [ ] Bold [ ] Other: ___

### Typography
<!-- Font preferences -->
- Headings:
- Body text:
- Style: [ ] Modern [ ] Classic [ ] Technical [ ] Friendly

### Existing Assets
<!-- Do you have any of these? -->
- [ ] Logo (format: ___)
- [ ] Brand guidelines
- [ ] Design mockups (Figma, etc.)
- [ ] Existing website to reference
- [ ] Competitor sites to reference

## Data & Content

### What data needs to be managed?
<!-- Beyond standard content modules -->

- Users (roles needed: _______________)
- Products/Services
- Orders/Bookings
- Custom entities: _______________

### Existing Data
<!-- Do you have data to import? -->
- [ ] No existing data — starting fresh
- [ ] CSV/Excel files to import
- [ ] Existing database to migrate
- [ ] API to connect to

## Integrations

### External Services
<!-- Third-party services you need -->
- [ ] **Payment**: Stripe / PayPal / Other: ___
- [ ] **Email**: SendGrid / Mailgun / SMTP / Other: ___
- [ ] **Analytics**: Google Analytics / Plausible / Other: ___
- [ ] **Auth providers**: Google / GitHub / Other: ___
- [ ] **Storage**: S3 / Cloudinary / Other: ___
- [ ] **CRM**: HubSpot / Salesforce / Other: ___
- [ ] **Other APIs**: _______________

### External Backend
<!-- Is there an existing backend? -->
- [ ] No — use PM's built-in backend (SQLite + Drizzle)
- [ ] Yes — external API at: _______________
- [ ] Hybrid — PM backend + some external endpoints

## Technical Requirements

### Hosting & Deployment
- [ ] Docker (self-hosted)
- [ ] Vercel / Netlify
- [ ] VPS (Digital Ocean, etc.)
- [ ] Other: _______________

### Performance & Scale
- Expected traffic: _______________
- Special requirements: _______________

### Security
- [ ] Standard (PM defaults)
- [ ] Enhanced (2FA, audit logs, etc.)
- [ ] Compliance requirements: _______________

## Special Requirements

<!-- Anything else? Unique features, specific libraries, constraints, timeline, etc. -->




---

<!--
After filling this out, run:

/pm-migrate

Claude will analyze your requirements, map them to PM capabilities,
identify gaps, suggest solutions, and create an implementation plan.
-->
