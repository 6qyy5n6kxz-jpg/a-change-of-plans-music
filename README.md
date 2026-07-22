# A Change Of Plans standalone website export

This folder is a self-contained static website prepared for the separate domain `achangeofplansmusic.com`. It does not require the parent Frank Creations repository at runtime.

## Exported structure

### Copied and adapted content

- `index.html` — booking-focused homepage with positioning, benefits, duo introductions, event categories, schedule preview, review-ready callout, existing photos, pricing preview, verified appearance names, and booking calls to action.
- `assets/css/styles.css` — copied from the shared Frank Creations stylesheet to preserve the existing appearance. It includes dormant selectors for pages that are not present in this export; those selectors do not add unrelated content or runtime dependencies.
- `assets/fonts/` — locally hosted Manrope and Playfair Display font files used by the existing design, plus their Open Font License files.
- `assets/js/events.js` — copied schedule renderer.
- `assets/js/songs.js` — copied searchable song catalog and song-request workflow.
- `data/events.json` — copied current music schedule. The source file currently contains music events only.
- `data/songs.json` — copied complete song catalog.
- `images/colored-logo.svg` — copied A Change Of Plans logo.
- `images/a-change-of-plans-live-1.jpg`, `-2.jpg`, and `-3.jpg` — copied performance photos.

### Newly created standalone files

- `contact/index.html` — structured booking inquiry with conditional follow-ups for weddings, churches, and venues.
- `about/`, `pricing/`, `shows/`, `song-list/`, and `live/` — dedicated planning and fan routes.
- `weddings-private-events/`, `restaurants-bars/`, `festivals-community-events/`, and `churches/` — audience-specific event landing pages.
- `assets/js/main.js` — band-only navigation, footer, path resolution, current-year display, and mobile menu behavior.
- `assets/js/contact.js` — band-only booking-form prefill and Formspree submission behavior.
- `assets/css/export.css` — minimal logo/layout compatibility rules layered over the copied stylesheet.
- `404.html` — band-specific not-found page.
- `site.webmanifest` — A Change Of Plans application metadata using the band logo.
- `robots.txt`, `sitemap.xml`, and `CNAME` — crawl and GitHub Pages files for `achangeofplansmusic.com`.
- `.gitignore` — excludes macOS metadata files from the future standalone repository.
- `README.md` — this handoff guide.

## Shared dependencies included

The export includes every local file needed by its HTML, CSS, JavaScript, images, and typography. The only external runtime services are:

- Formspree endpoint `xwvwygzl` for song requests.
- Formspree endpoint `xreojwny` for booking inquiries.
- Facebook, Instagram, Venmo, and Cash App destinations linked from the visible page.

There are no links to Frank Creations pages or assets and no event-rental, photo-booth, tent, Wine & Canvas, Cookies & Canvas, graduation-package, shop, or unrelated-service sections in the exported HTML or JavaScript.

## Manual review before deployment

- Confirm both Formspree endpoints are owned by the correct account, accept submissions from the new domain, and deliver to the intended mailbox. Test submissions were not sent during export creation.
- Confirm the Venmo and Cash App handles are still intended for A Change Of Plans.
- Confirm current schedule dates, pricing, the published service area, and the “house band at The Mockingbird” statement.
- Replace the square SVG social image with a dedicated 1200-by-630 preview image if richer social sharing previews are desired.
- Configure the custom domain and HTTPS in the destination repository's GitHub Pages settings. The included `CNAME` assumes the apex domain `achangeofplansmusic.com`.
- Keep `data/events.json` and `data/songs.json` current after the new repository becomes the source of truth.
- Dynamic Event JSON-LD is generated from `data/events.json`; do not duplicate show dates in page markup.
- Future media replacement points are commented in `index.html` and `assets/css/export.css`. Add a `/watch` route only after a real performance video is available.
- The full shared stylesheet was retained for fidelity. It can be pruned later with visual regression testing, after the standalone site is approved.

## Preview locally

The JSON-powered schedule and song list require an HTTP server; opening `index.html` directly with a `file://` URL will not load them.

From inside this folder, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. Check the homepage, `http://localhost:8000/contact/`, mobile navigation, schedule expansion, song search/filters, images, and booking query prefills.

## Deploy as a separate GitHub Pages repository

1. Create an empty repository for the A Change Of Plans site.
2. Copy the **contents** of this export folder into the new repository root, so `index.html` is at the repository root.
3. Commit and push the files to the new repository's default branch.
4. In repository settings, enable GitHub Pages deployment from the default branch and the repository root, or use the organization's standard Pages workflow.
5. Configure the DNS records for `achangeofplansmusic.com` according to GitHub's current custom-domain instructions.
6. Set `achangeofplansmusic.com` as the Pages custom domain, enable HTTPS when available, and verify that GitHub preserves the included `CNAME`.
7. Test the production canonical URLs, forms, social metadata, schedule, song search, and 404 behavior.

No files were removed or modified in the original Frank Creations website as part of this export.

## Validation completed for this export

- All local links, scripts, stylesheets, images, fonts, manifest assets, CSS URLs, and JSON fetch targets resolve within the export.
- JavaScript syntax, JSON parsing, sitemap XML, CSS delimiter balance, JSON-LD parsing, one-H1 structure, and duplicate IDs passed repository checks.
- The homepage, contact page, 404 page, scripts, data, images, fonts, manifest, robots file, and sitemap returned HTTP 200 from a local server.
- Visible exported HTML and JavaScript contain no Frank Creations or unrelated-service content, and no exported file references `frankcreationsllc.com`.
- No live form submissions were made.

Safari WebDriver could not be used for automated console inspection because “Allow remote automation” is disabled in the local Safari settings. Complete the short rendered-browser checklist above before production deployment.
