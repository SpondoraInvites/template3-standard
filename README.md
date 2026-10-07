# Standard Wedding Invitation Template

Tier: **Standard** · Single-page digital wedding invitation.

Warm **paper & terracotta botanical** design — cream papers, terracotta
accents and ink serif typography, with a ceremonial **sealed-envelope
opening**: guests tap the wax seal, the flap lifts, the card rises out
and a burst of petals reveals the invitation. The botanical branch art
is **drawn generatively in JavaScript**, petals fall on a canvas that
follows the cursor like wind, and the background music box is
**generated live with Web Audio** — no image or audio assets beyond the
favicon and the social-share cover.

## Features

- **Sealed-envelope intro** — a full-screen overlay with the couple's
  names and a floating envelope; the *wax seal* tap unlocks the page
  and starts the music (browsers require a tap before audio). Skipped
  instantly for guests who ask for reduced motion, and the page
  degrades gracefully without JavaScript.
- **Falling petals** with cursor "wind" and a petal burst when the
  seal cracks, over a paper-grain overlay
- **Hero** — giant serif names with a script ampersand and botanical
  branches that parallax with the cursor
- **The invitation** — a personal letter with drop cap and a giant
  ghosted ampersand
- **Our story** — a two-sided timeline whose spine draws itself as the
  guest scrolls, diamond nodes lighting up as they pass
- **The day** — a dark band with a **live countdown** (days / hours /
  minutes / seconds, flipping to "just married!" when the day
  arrives), ceremony and reception blurbs, the full day schedule, a
  locally generated **Add-to-Calendar (.ics)** file and a Google Maps
  directions link
- **RSVP** — live script preview of the reply, attendance choice,
  seats stepper, song request and notes field, sealed with an animated
  wax stamp; a returning guest's reply is remembered and can be
  updated
- **Generative music box** — algorithmic arpeggios (Web Audio, no
  audio file), toggled from the floating note button
- Toast notifications, `prefers-reduced-motion` honoured throughout,
  mobile-first with a full desktop layout

## Files

| File         | Purpose                                          |
|--------------|--------------------------------------------------|
| `index.html` | Page structure and display copy.                  |
| `styles.css` | All styling; design tokens in `:root` at the top. |
| `config.js`  | Values the script needs: wedding date, calendar, RSVP. |
| `script.js`  | Petals, botanicals, music box, envelope intro, reveals, countdown, RSVP. |
| `assets/favicon.svg` | Browser-tab favicon (terracotta Z·M monogram). |
| `assets/og-cover.png` | 1200×750 social share preview (WhatsApp/Facebook). |
| `tests/`     | Guard tests (`node --test tests/`).               |

## Customising for a client

This template was generated for the sample couple (**Zayan &
Mahira** — placeholder names; 12 September 2026, The Royal Garden,
Uttara, Dhaka), so most **display copy lives directly in
`index.html`** — each section is marked with a `<!-- ===== -->` section
comment (invitation letter, story chapters, ceremony/reception blurbs,
day schedule). Edit the text in place. When reusing for another couple,
also swap the "Z·M" monogram (envelope card, wax seals, nav,
`assets/favicon.svg`) and the "#ZayanWedsMahira" hashtag. The footer
credit ("Crafted by Spondora Invites") and its Instagram/Facebook links
are hand-set at the end of `index.html` — keep them as-is for Spondora
deployments.

Everything the **script** needs is in **`config.js`**:

- `weddingDateTime` — ISO format with timezone, e.g.
  `"2026-09-12T16:00:00+06:00"`. Drives both the countdown and the
  Add-to-Calendar file. **The shipped sample date has already passed**,
  so the countdown reads "just married!" until a real client's date is
  set.
- `calendar` — the .ics summary, location, description, duration and
  filename. Commas are escaped automatically.
- `rsvp.storageKey` / `rsvp.maxParty` — the localStorage key and the
  seats stepper cap (the preview wording covers parties up to six).

Design tokens (paper, ink, terracotta, fonts) are CSS variables in the
`:root` block at the top of `styles.css`; recolour the whole page by
changing `--paper`, `--ink` and `--terra`.

### RSVP delivery

Replies are remembered **in the guest's own browser** only — the couple
is not notified. If delivery is needed, extend the `submit` handler in
`script.js` (search for `zm_rsvp_v1` → `rsvp.storageKey`) the way the
Signature/Luxury templates do: open WhatsApp with the answers pre-typed
and/or POST to a Formspree-style endpoint.

## Running locally

```bash
cd template3-standard
python3 -m http.server 8080
# open http://localhost:8080
```

(Opening `index.html` directly via `file://` also works — the petals,
countdown and music box all run locally; only the Google Fonts and the
Maps link need internet, and clipboard/calendar downloads prefer a real
http(s) origin when deployed.)

## Deploying

Any static host: GitHub Pages, Netlify, Vercel, Cloudflare Pages —
drag the folder in. One URL per couple = the shareable link.

## Fonts

Google Fonts loaded in `index.html`: Cormorant Garamond (body serif),
Pinyon Script (script accents) and Jost (labels, buttons, small caps).

## Tests

```bash
node --test
```

Guards the invariants that broke once already: no temporary CDN photo
links in the page, every referenced local asset exists, config.js loads
before script.js, the page keeps its styles and behaviour in external
files, and the wedding datetime is a valid ISO date.
