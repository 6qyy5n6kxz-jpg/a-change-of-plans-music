# A Change Of Plans - Website Maintenance Guide

This guide documents the maintenance and configuration procedures for the A Change Of Plans website.

## Table of Contents

1. [Solo vs Duo Naming & Query Parameters](#solo-vs-duo-naming--query-parameters)
2. [Private vs Public Events](#private-vs-public-events)
3. [Forms & Endpoints](#forms--endpoints)
4. [Song Database](#song-database)
5. [Reviews Configuration](#reviews-configuration)
6. [Navigation & Responsive Design](#navigation--responsive-design)

---

## Solo vs Duo Naming & Query Parameters

### Current Labels

- **Duo:** "A Change Of Plans Duo" (starting at $300)
- **Solo:** "Devin Frank Solo" (starting at $200)

### Booking Form

The booking form uses the label "Preferred performance option" with three choices:
1. A Change Of Plans Duo
2. Devin Frank Solo
3. Not sure — please recommend

### Query Parameter Aliases

The contact form supports old query parameters for backward compatibility:

**Old parameter:**
```
services=A%20Change%20Of%20Plans%20Solo
```

**New parameter (preferred):**
```
services=Devin%20Frank%20Solo
```

**Duo parameter:**
```
services=A%20Change%20Of%20Plans%20Duo
```

The contact.js file (`assets/js/contact.js`) automatically maps old "A Change Of Plans Solo" values to "Devin Frank Solo" internally. Existing inbound links using the old parameter will continue to work.

### Updating Solo References

To update solo references across the site:

1. Search for "Devin Frank Solo" to find all current references
2. Pricing page buttons at [pricing/index.html](pricing/index.html#L55) use the new parameter
3. Contact form options at [contact/index.html](contact/index.html) are predefined with the new names
4. Update any external marketing materials to use the new naming

---

## Private vs Public Events

### Event Data Fields

Events in `data/events.json` use these fields to control visibility:

```json
{
  "eventId": "unique-id",
  "category": "music",
  "eventType": "private" | "community" | "venue",
  "publicEvent": true | false,
  "allowSongRequests": true | false,
  "date": "2024-01-15",
  "startsAt": "2024-01-15T18:00:00-04:00",
  "time": "6:00 PM - 9:00 PM",
  "title": "Event Name",
  "description": "Event description (not shown for private events)"
}
```

### Event Visibility Rules

**Public Events** (displayed on Shows page):
- `publicEvent: true`
- `eventType` is NOT "private"
- Full details shown: venue, time, description
- Song request button may appear if `allowSongRequests: true`
- Included in public event counts and schema.org markup

**Private Events** (displayed separately as credibility signals):
- `publicEvent: false` OR `eventType: "private"`
- Displayed under "Also Booked Privately" section
- Only shows: date and optional category label
- **Never exposed:** client names, full addresses, descriptions, times, song request buttons, external links, guest details

### Event Count Logic

The Shows page summary displays only **public events** in the count and "Next Show" / "Upcoming Highlights" sections.

Private events appear in a separate "Also Booked Privately" section below public events (only when future private events exist).

### Rendering Logic

Event rendering is handled by `assets/js/events.js`:

- `isPrivateEvent(event)` determines visibility
- `renderSummary()` calculates public event counts
- `renderEvents()` renders both public and private events in their respective sections
- `injectEventSchema()` adds Schema.org markup for public events only

---

## Forms & Endpoints

### Booking Form

**File:** [contact/index.html](contact/index.html)

**Endpoint:** `https://formspree.io/f/xreojwny`

**Submissions include:**
- Contact information (name, email, phone)
- Event basics (date, type, location, guest count, setting)
- Conditional fields (wedding, church, restaurant details; outdoor shelter availability)
- Music preferences (performance option, duration, sound system, budget, requested songs)
- Tracking fields (referral source, source page)

**Query Parameters:**
```
?services=<Devin%20Frank%20Solo|A%20Change%20Of%20Plans%20Duo>
?eventType=<Wedding%20or%20private%20event|Restaurant%20or%20bar|etc>
?estimate=<$300|$200|etc>
?source=<referrer>
```

### Song Request Forms

Two locations submit song requests:

1. **Live Show Form** ([live/index.html](live/index.html))
   - Song title (from autocomplete dropdown)
   - Song suggestion (free text, if not in list)
   - Notes
   - **Endpoint:** `https://formspree.io/f/xwvwygzl`

2. **Event-Specific Request** ([request-song/index.html](request-song/index.html))
   - Song title (from autocomplete dropdown)
   - Dedication and message
   - **Endpoint:** `https://formspree.io/f/xwvwygzl` (same)
   - Only available for eligible public events

### Review Form

**File:** [reviews/index.html](reviews/index.html)

**Endpoint (from config):** Loaded from `data/site-config.json` → `reviewFormEndpoint`

**Default:** `https://formspree.io/f/xreojwny` (same as booking, currently)

**Submissions include:**
- Name, email
- Event details (venue, date, type)
- Star rating (1-5)
- Review text
- Display permission checkbox

---

## Song Database

**File:** `data/songs.json`

### Song Data Structure

```json
{
  "title": "Song Title",
  "artist": "Artist Name or Category",
  "instrument": "Piano" | "Guitar",
  "tags": ["piano" | "guitar"]
}
```

### Artist Categories

- **Specific artists:** "The Beatles", "Van Morrison", etc.
- **Original songs:** "Original" (for Devin Frank originals)
- **Traditional music:** 
  - "Traditional" (generic folk/spiritual songs)
  - "Traditional Hymn" (hymns)
  - "Traditional Christmas" (Christmas songs)
- **Collaborative:** "Artist 1 / Artist 2"
- **Modern worship songs:** Use specific artist when known (e.g., "Matt Redman", "Hillsong")

### Song Listing Features

- Songs auto-populate the live show request dropdown
- Songs appear on the Song List page with filtering by instrument
- Titles and artists are searchable on the Song List page

### Adding a New Song

1. Open `data/songs.json`
2. Add entry to the "songs" array in alphabetical order by title:

```json
{
  "title": "New Song Title",
  "artist": "Artist Name",
  "instrument": "Piano",
  "tags": ["piano"]
}
```

3. Songs will immediately appear in:
   - Song list page
   - Live song request dropdown
   - Event-specific song request dropdown

---

## Reviews Configuration

### Review Endpoints

**Current configuration** (`data/site-config.json`):

```json
{
  "reviewFormEndpoint": "https://formspree.io/f/xreojwny",
  "songRequestFormEndpoint": "https://formspree.io/f/xwvwygzl",
  "googleReviewUrl": ""
}
```

### Review Approval Workflow

1. Reviews submitted via the form
2. Submitted to Formspree endpoint
3. Manually approved and added to `data/reviews.json`
4. Approved reviews appear on the Reviews page

### Review Data Structure

`data/reviews.json`:

```json
{
  "reviews": [
    {
      "name": "Reviewer Name",
      "displayName": "First Last Initial",
      "email": "reviewer@example.com",
      "rating": 5,
      "reviewText": "Review content...",
      "venue": "Event or Venue Name",
      "eventType": "Wedding" | "Restaurant" | "Church" | etc,
      "approved": true,
      "featured": false
    }
  ]
}
```

### Empty State

When no approved reviews exist, the Reviews page displays:
> "Reviews will appear here as guests and event hosts share their experiences."

With a link to "Share Your Experience".

### Google Reviews Integration

**File:** `data/site-config.json` → `googleReviewUrl`

If a Google Business URL is configured:
```json
"googleReviewUrl": "https://g.page/r/YOUR_PLACE_ID/review"
```

The Google review panel appears on the Reviews page.

**To enable:**
1. Get your Google Business review URL
2. Update `data/site-config.json`
3. The panel appears automatically

---

## Navigation & Responsive Design

### Desktop Navigation

Navigation menu at different widths:
- **1440px+**: Full menu with spacing
- **1200px–1440px**: Slight spacing reduction
- **960px–1200px**: Verified no wrapping or overlap
- **Below 960px**: Mobile menu (hamburger)

### Navigation Items

1. Home
2. About
3. Events (with submenu)
4. Shows
5. Song List
6. Reviews
7. Pricing
8. Book Us (emphasized button)

### Conditional Outdoor Fields

When "Indoor or outdoor" setting is changed:
- Selecting "Outdoor" or "Both indoor and outdoor" shows: "Is covered shelter available in the event of sun or rain?"
- The conditional field hides when "Indoor" or empty is selected

### Navigation Testing

To verify responsive behavior:
- Test at 1440px, 1200px, 1024px, 960px, 768px, 430px, 375px
- Verify no wrapping or overlap
- Verify tap targets are accessible (minimum 44x44px)
- Verify keyboard navigation works (Tab through all interactive elements)
- Verify submenus are keyboard accessible

---

## Implementation Details

### Events Rendering

**File:** `assets/js/events.js`

Key functions:
- `isPrivateEvent()`: Determines if event should be private
- `renderSummary()`: Creates public event counts and highlights
- `renderEvents()`: Renders public events + "Also Booked Privately" section
- `injectEventSchema()`: Adds Schema.org MusicEvent markup for public events only

### Contact Form Logic

**File:** `assets/js/contact.js`

Key functionality:
- Date minimum set to today (dynamic, no hardcoding)
- Event type conditional fields (wedding, church, restaurant)
- Outdoor shelter conditional (shows when outdoor selected)
- Query parameter support (old and new)
- Estimate calculation from budget selection

### Song Selection

**File:** `assets/js/songs.js`

Key functionality:
- `populateLiveSongSelect()`: Populates live page song dropdown from songs.json
- Song options sorted alphabetically by title
- Format: "Song Title — Artist Name"
- All songs appear in both live show and event-specific forms

### Reviews Page

**File:** `assets/js/reviews.js`

Key functionality:
- Loads approved reviews from `data/reviews.json`
- Renders star ratings as text
- Loads Google review URL from `data/site-config.json`
- Empty state when no approved reviews exist

---

## Validation Checklist

After making changes, verify:

- [ ] No console errors
- [ ] No broken links (internal or external)
- [ ] Forms submit to correct endpoints
- [ ] Old query parameters (`services=A%20Change%20Of%20Plans%20Solo`) still work
- [ ] Public event counts exclude private events
- [ ] Private events section only shows when private events exist
- [ ] Song autocomplete populates correctly
- [ ] Conditional form fields appear/hide correctly
- [ ] Date field minimum is set to today
- [ ] All images load correctly
- [ ] Responsive layout works at all tested widths
- [ ] Keyboard navigation works throughout
- [ ] Screen reader labels are appropriate
- [ ] Schema.org markup is valid
- [ ] Sitemap.xml is current
- [ ] No private data appears in public pages
- [ ] All Formspree endpoints are correct

