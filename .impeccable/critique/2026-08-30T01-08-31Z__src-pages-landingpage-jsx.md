---
target: src/pages/LandingPage.jsx
total_score: 17
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-30T01-08-31Z
slug: src-pages-landingpage-jsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3/4 | Nav & CTAs are auth-aware, but job preview search bar and mini-cards look clickable yet provide zero interactive or loading feedback. |
| 2 | Match System / Real World | 2/4 | Video "play" triangle icon on action CTA buttons (`.cta-btn__play`); abstract skeleton wireframes in "Easy Navigation"; jarring "FOR EMPLOYERS" tag placed above job seeker steps. |
| 3 | User Control and Freedom | 3/4 | Clear pathways to `/jobs` and `/signup`, but all footer company links point to `/welcome` which triggers a circular redirect loop back to the landing page. |
| 4 | Consistency and Standards | 2/4 | 3-font collision (`Playfair Display` headings token, `Poppins` hero override, `Inter` body); serif font on pill buttons; Indonesian "Profil" mixed into English copy; mobile drawer shows "For Employers" while desktop nav omits it. |
| 5 | Error Prevention | 3/4 | Low risk surface, but dead preview cards and inactive search bar invite frustrating dead clicks. |
| 6 | Recognition Rather Than Recall | 2/4 | Inert search mockup forces users to recall the top nav link; mini-card "Browse Internships →" is a dead `<div>`. |
| 7 | Flexibility and Efficiency | n/a | *n/a: Persuade landing page surface with no power-user workflow requirements.* |
| 8 | Aesthetic and Minimalist Design | 2/4 | Giant 767×633 logo SVG repeated twice in consecutive sections; low contrast on peach backgrounds (3.2:1); AI-slop gradient text on "Ready?". |
| 9 | Error Recovery | 2/4 | Dead footer routes trigger catch-all redirect to `/` without error feedback or navigation cues. |
| 10 | Help and Documentation | n/a | *n/a: Marketing landing surface; contextual task docs not applicable, though FAQ/support is missing.* |
| **Total** | | **17/32** | **Acceptable (53.1%)** |

#### Design Specificity Verdict

**Verdict:** Partially grounded in a warm, inviting brand palette, but severely diluted by duplicate placeholder graphics, layout collisions, and contradictory persona tagging.

- **LLM assessment:** Nexora's plum-to-magenta (`#42154c` to `#632248`) and warm peach (`#e8c4b8`) color palette provides an appealing alternative to sterile corporate blue job boards. However, the page suffers from asset thrift: `HeroArt.jsx` (an SVG wrapping `/logo-nexora.webp` at 767×633) is rendered twice in back-to-back sections. The "Easy Navigation" section displays abstract grey skeleton wireframes instead of authentic product proofs. Crucially, the "How It Works" card is tagged with `<span className="employer-banner__tag">FOR EMPLOYERS</span>` directly over instructions intended for entry-level candidates ("Create Your Profile... Get Matched... Easy Apply"), creating critical cognitive confusion at the primary conversion moment.
- **Deterministic scan:** CLI scan of JSX targets returned 0 inline findings. Deep CSS scan of `src/index.css` surfaced **17 rule triggers**, including **`gradient-text`** (`.hero-tagline-card__ready` line 595, gold/orange gradient on transparent text), **`overused-font`** (`Inter` across 14 declarations), and typographic fragmentation (headings defaulting to `Playfair Display` but overridden by `Poppins` in `.hero-tagline-card__title`).
- **Visual overlays:** Browser visualization and script injection were skipped as no browser automation / Chrome DevTools tool is exposed in this CLI environment.

#### Overall Impression
Nexora has an engaging, warm color system that distinguishes it from cold corporate portals, but the landing page feels like an assembled prototype rather than a shipped product. Duplicate massive logo assets, an inert job search preview, and a misplaced employer banner over candidate onboarding actively depress conversion trust.

#### What's Working
1. **Inviting Visual Identity:** The deep plum and warm peach palette provides emotional warmth, reducing job-seeking anxiety for early-career graduates.
2. **Auth-Aware Dynamic CTAs:** The page leverages `useAuth` to dynamically toggle navigation items and buttons between "Get Started" / "Join Now" and "Go to Dashboard →", avoiding redundant friction for returning users.
3. **Transparent Match Metric Teaser:** Displaying concrete job cards with match scores (`96%`, `88%`, `74%`) and location badges anchors the core product promise.

#### Priority Issues
- **[P1] Misplaced "FOR EMPLOYERS" tag over candidate onboarding flow**
  - *Why it matters:* Extreme cognitive dissonance at the bottom conversion section. Early-career seekers reading steps to create a profile and apply see a tag reading "FOR EMPLOYERS", causing hesitation on "Join Now", while employers find candidate-oriented instructions.
  - *Fix:* Remove `.employer-banner__tag` from the seeker flow and introduce a clear dual-audience tab or separate employer hiring card.
  - *Suggested command:* `/impeccable clarify`

- **[P1] Dead-End Footer Links & Circular Navigation Loop**
  - *Why it matters:* All company footer links (`About`, `Contact`, `Privacy`, `Terms`) point to `/welcome`. Since `/welcome` is undefined in `App.jsx`, React Router redirects back to `/`, trapping users seeking trust and privacy details in an infinite loop.
  - *Fix:* Provide lightweight modal dialogs or explicit static content pages for Terms, Privacy, About, and Contact.
  - *Suggested command:* `/impeccable harden`

- **[P2] Duplicate Logo Assets & Non-Interactive "Mock" UI Elements**
  - *Why it matters:* `HeroArt.jsx` renders identical 767×633 logo graphics in both Hero and Opportunity sections. The search input in the Fit section and the "Browse Internships →" mini-card look clickable but are inert elements that generate dead clicks.
  - *Fix:* Replace the second logo with an interactive match preview or skill-radar card, and wire the preview search bar to navigate directly to `/jobs?q=...`.
  - *Suggested command:* `/impeccable shape`

- **[P2] Typographic Clashing & Video "Play" Icon on Action Buttons**
  - *Why it matters:* `Playfair Display`, `Poppins`, and `Inter` collide in a single viewport. Furthermore, `<CtaButton>` injects a video "play" triangle (`.cta-btn__play`), signalling video playback instead of career onboarding.
  - *Fix:* Eliminate the play icon in favor of directional arrows (`→`), standardize button fonts to `Inter`, and unify hero headings under `Playfair Display`.
  - *Suggested command:* `/impeccable typeset`

- **[P3] WCAG AA Color Contrast Deficits & Language Bleed ("Profil")**
  - *Why it matters:* Rust-orange headings (`--text-heading: #c44a20`) on the peach background (`--bg-primary: #e8c4b8`) deliver a 3.22:1 contrast ratio, failing WCAG AA (4.5:1). In the Opportunity card, Indonesian spelling "Profil" leaks into an English interface.
  - *Fix:* Darken heading tokens on peach surfaces to `#9e3210` or use `#3d1028` (>5.5:1), and translate "Profil" to "Profile".
  - *Suggested command:* `/impeccable colorize`

#### Persona Red Flags
- **Jordan (Confused First-Timer / Entry-Level Seeker):**
  - Sees "FOR EMPLOYERS" above "How It Works" and assumes the platform is only for recruiters, hesitating to click "Join Now".
  - Clicks on the job preview search bar to find design roles and gets no response.
  - Clicks "Privacy" in the footer to verify student data security and gets looped back to the top of the page.
- **Alex (Impatient Power User):**
  - Wants to explore open roles immediately, but the hero has no active search input or filter tags, only a generic "Get Started" button routing to `/signup`.
  - Clicks "Browse Internships →" in the mini-card and encounters a non-functional `<div>`.
  - Wonders why every button features a video play triangle.
- **Casey (Distracted Mobile User):**
  - On mobile, `order: -1` renders the massive logo above the fold, pushing the value proposition and primary CTA below the screen.
  - Opens the mobile drawer and sees "For Employers" linking straight to the regular candidate `/signup` flow.

#### Minor Observations
- The gold-to-orange gradient on "Ready?" (`.hero-tagline-card__ready`) introduces visual noise and AI-slop aesthetic.
- The checkmark in `.entry-badge` is a raw Unicode text glyph `✓` rather than a styled SVG icon.
- Unread notification badge defaults to `3` in `Navbar.jsx` for authenticated visitors even without live alerts.

#### Questions to Consider
1. What if the hero featured an active, live search bar with quick filter pills (*Internships*, *Junior Tech*, *Design*, *Remote*) allowing visitors to see real jobs before account creation?
2. What if the second 767×633 logo illustration were replaced with an interactive Match Score simulator previewing how candidate skills match entry-level openings?
3. What if we split the page into two clear tracks: one primary flow for talent/graduates and a dedicated "Looking to hire? → Post a Job" module for employers?
