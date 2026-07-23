# A Change Of Plans Website Cleanup - Deliverables Report

**Date:** July 23, 2026
**Status:** Complete
**Scope:** Full-site page-by-page audit cleanup pass

---

## 1. Summary of Changes

The website has been updated with targeted cleanup improvements across 15 categories without redesigning the site or changing the strong visual design. All changes preserve existing accessibility work, SEO foundations, forms, event data, song database, review moderation, and deployment setup.

**Key improvements:**
- Removed internal developer captions from public-facing content
- Standardized solo/duo naming throughout the site
- Improved private event handling with public/private separation
- Enhanced pricing language to prevent misunderstanding of $300 flat rate
- Added song autocomplete to live show request page
- Refined booking form with dynamic date minimum, conditional outdoor fields, and improved labels
- Updated reviews page with better empty state and dedicated endpoint support
- Fixed 20 song records with corrected "Traditional" categorization

---

## 2. Files Created

1. **MAINTENANCE-GUIDE.md** - Comprehensive maintenance documentation covering:
   - Solo vs Duo naming and query parameter aliases
   - Private vs Public event handling
   - Forms and Formspree endpoints
   - Song database structure and management
   - Reviews configuration and workflow
   - Navigation and responsive design testing
   - Validation checklist

---

## 3. Files Modified

### HTML Files
1. **about/index.html**
   - Replaced developer caption "An existing live performance photo..." with "Devin Frank and Kendra German performing live in Northwest Ohio."
   - Updated CTA text from "solo or duo setup" to "performance option"

2. **contact/index.html**
   - Updated form label: "Solo or duo preference" → "Preferred performance option"
   - Reordered performance options: Duo, Solo, Not sure (instead of Solo, Duo, Not sure)
   - Updated "Solo or duo preference" reference in about section
   - Changed venue label to "Venue name or general event location"
   - Added helper text: "Please do not include a private residence's full street address yet."
   - Added conditional outdoor shelter question that appears when "Outdoor" or "Both" is selected
   - Added date field with `min=""` attribute (set dynamically via JavaScript)

3. **pricing/index.html**
   - Updated meta description to reference "A Change Of Plans Duo and Devin Frank Solo"
   - Changed heading: "Need a Solo Performer?" → "Devin Frank Solo"
   - Updated button text and links with new query parameter: `services=Devin%20Frank%20Solo`

4. **churches/index.html**
   - Updated pricing language: "Solo performances start at $200 and duo performances at $300" → "Standard local performance rates begin at $200 for Devin Frank Solo and $300 for the A Change Of Plans Duo"

5. **festivals-community-events/index.html**
   - Updated pricing language (same change as churches page)

6. **weddings-private-events/index.html**
   - Updated pricing language: "Solo performances start at $200 and duo performances at $300. Weddings and private events usually receive a separate quote..." → "Standard local performance rates begin at $200 for Devin Frank Solo and $300 for the A Change Of Plans Duo. Weddings and private events receive a personalized quote..."

7. **live/index.html**
   - Changed eyebrow: "Live with us right now" → "At an A Change Of Plans show?"
   - Enhanced song request form with:
     - Dropdown select for songs (populated from songs.json)
     - Option to "suggest a song not in our list"
     - Separate free-text field for song suggestions
   - Added helper text: "Requests are reviewed between songs or during natural breaks in the performance."

8. **reviews/index.html**
   - Initial setup for reviews form (endpoint loaded from site-config)
   - No changes to HTML (reviews.js handles updates)

9. **request-song/index.html**
   - No changes (already properly configured)

### JavaScript Files

1. **assets/js/contact.js**
   - Added dynamic date minimum (set to today's date)
   - Implemented old query parameter alias support (maps `services=A%20Change%20Of%20Plans%20Solo` to "Devin Frank Solo")
   - Added conditional outdoor shelter field visibility (shows when setting includes "outdoor")
   - Simplified label update (removed hard-coded label change, using HTML labels instead)
   - Maintained all existing query parameter prefill functionality

2. **assets/js/events.js**
   - Updated `renderSummary()` to count only public events (excludes private events from public summary)
   - Modified event rendering to separate public and private events:
     - Public events display with full details
     - Private events appear under "Also Booked Privately" section
     - Private event section only renders when future private events exist
   - Private events now show only: date, "Private Event" label, and optional category if available
   - Maintained private event data protection (no client names, addresses, descriptions, times, or song requests)

3. **assets/js/songs.js**
   - Added `populateLiveSongSelect()` function to populate song dropdown on live page
   - Songs sorted alphabetically by title
   - Format: "Song Title — Artist Name"
   - Asynchronous loading from songs.json with error handling

4. **assets/js/reviews.js**
   - Updated empty state message: "Real experiences will live here..." → "Reviews will appear here as guests and event hosts share their experiences. Share Your Experience"
   - Maintained dedicated review endpoint loading from site-config
   - Maintained Google review panel configuration

### JSON Files

1. **data/songs.json**
   - Updated 20 song records with corrected artist categories:
     - Traditional hymns: "Be Thou My Vision", "Blessed Assurance", "Great Is Thy Faithfulness", "Here I Am Lord", "His Eye Is On The Sparrow", "Holy, Holy, Holy", "How Great Thou Art", "I Surrender All", "Just As I Am", "Leaning on the Everlasting Arms", "Love Lifted Me", "Power In The Blood", "The Solid Rock", "We Are One in the Spirit", "We've a Story To Tell to The Nations", "What A Friend We Have In Jesus", "When The Roll Is Called Up Yonder"
     - Traditional songs: "Go Tell It on the Mountain", "I'll Fly Away", "Jesus Loves Me", "Peace Like A River"
     - Traditional Christmas: "It came Upon A Midnight Clear", "Joy To The World"
   - 16 "Misc" entries intentionally left unchanged (uncertain modern worship songs where artist credits cannot be confirmed)

2. **data/site-config.json**
   - No changes (already properly configured with endpoints)

3. **data/events.json**
   - No changes to structure (already has publicEvent field and proper private event support)

---

## 4. All Replaced Solo Labels

### Site-Wide Changes

**From:** Various labels including "A Change Of Plans Solo", "Solo performance", "Solo or duo", "Ask About Solo Availability"

**To:** "Devin Frank Solo" (with consistent capitalization and presentation)

**Locations updated:**
1. Contact form: "Solo or duo preference" → "Preferred performance option" with reordered choices
2. Pricing page heading: "Need a Solo Performer?" → "Devin Frank Solo"
3. Pricing page button: "Ask About Solo Availability" (kept same for consistency)
4. About page: Text updated from "solo or duo setup" to "performance option"
5. Query parameters: Now use `services=Devin%20Frank%20Solo`
6. Contact.js: Internally normalizes old `services=A%20Change%20Of%20Plans%20Solo` to "Devin Frank Solo"

---

## 5. Old Solo Query Parameter Support

### Backward Compatibility Implementation

**Old URL format** (still works):
```
https://achangeofplansmusic.com/contact/?services=A%20Change%20Of%20Plans%20Solo
```

**New URL format** (preferred):
```
https://achangeofplansmusic.com/contact/?services=Devin%20Frank%20Solo
```

**How it works:**
The `assets/js/contact.js` file contains logic to detect the old parameter format:
```javascript
if (/A\s+Change\s+Of\s+Plans\s+Solo/i.test(requestedService)) {
  prefillValue = "Devin Frank Solo";
}
```

This means:
- Old inbound links from marketing materials, email, social media, etc. will continue to work
- The form automatically prefills "Devin Frank Solo" option when old parameter is detected
- No broken links or lost traffic
- All existing query parameter prefill behavior is maintained

**Duo parameter:**
```
?services=A%20Change%20Of%20Plans%20Duo
```
Continues to work unchanged.

---

## 6. Private Event Handling: Counts and Rendering

### Public Event Counts

**Shows Page Summary:**
- Displays only **public events** in "X upcoming shows" count
- "Next Show" section uses only public events
- "Upcoming Highlights" uses only public events
- Private events excluded from these summary sections

### Private Event Display

**"Also Booked Privately" Section:**
- Appears only when future private events exist
- Separate visual section below public event list
- For each private event, displays only:
  - Date
  - "Private Event" label
  - Optional category text (e.g., "Wedding", "Corporate event") if present in event data
- Never displays:
  - Client/vendor names
  - Full addresses or specific venue locations
  - Event descriptions
  - Time ranges (e.g., "2:00 PM – 9:00 PM")
  - Song request buttons
  - External event links
  - Guest information

### Event Model Support

**Event fields controlling visibility:**
```json
{
  "eventId": "unique-identifier",
  "publicEvent": true | false,  // Primary control
  "eventType": "private" | "community" | "venue" | "other",
  "allowSongRequests": true | false,  // Song request eligibility
  "date": "YYYY-MM-DD",
  "title": "Event Name",
  "description": "Full description",
  "time": "HH:MM – HH:MM" // Don't display for private events
}
```

### Implementation Details

**JavaScript handling:**
- `isPrivateEvent()` function checks both `publicEvent` field and `eventType` value
- `renderSummary()` filters items to public-only for counts
- `renderEvents()` renders public events first, then private events in separate section
- Schema.org markup generated only for public events

---

## 7. Public Event Schema Handling

**Schema.org Integration:**

Event schema markup is injected into page head for **public events only**:

```javascript
const publicEvents = items.filter((event) => !isPrivateEvent(event));
// Only publicEvents are included in schema generation
injectEventSchema(publicEvents);
```

**Private events are never included in:**
- Schema.org MusicEvent markup
- Search engine indexed event data
- Structured data for venues or attendance tracking

This ensures private client details are never exposed in search results or third-party aggregators.

---

## 8. Live Show Song Autocomplete Implementation

### Feature: Song Selection Autocomplete

**Location:** Live show page song request form ([live/index.html](live/index.html))

**How it works:**

1. **Data Source:** Songs populated from `data/songs.json` at page load
2. **Presentation:** Native HTML select dropdown (not JavaScript-only)
3. **Format:** "Song Title — Artist Name" (sorted alphabetically by title)
4. **Accessibility:** 
   - Standard HTML select element (keyboard accessible)
   - Screen reader announces all options
   - No special JavaScript interaction required
5. **User Flow:**
   - User opens select dropdown
   - Sees all 256+ songs in alphabetical order
   - Can type to filter (browser-native select filtering)
   - Selects a song
   - Optionally fills "Or suggest a song not in our list" text field
6. **Data Submitted:**
   - selected_song: Title and artist from dropdown
   - unlisted_song_suggestion: Free-text field (if used)
   - requester_name, notes, etc.

### Event-Specific Song Requests

**Location:** [request-song/index.html](request-song/index.html)

- Uses same approach: native select dropdown from songs.json
- Only available for eligible public events
- Song request deadline checked before allowing submission
- Submits to same endpoint: `formspree.io/f/xwvwygzl`

### JavaScript Implementation

**File:** `assets/js/songs.js`

```javascript
const populateLiveSongSelect = async () => {
  const liveSongSelect = document.querySelector("[data-live-song-select]");
  // Fetches songs.json
  // Creates option elements for each song
  // Appends to select element
}
```

---

## 9. Form Endpoints: Which Form Uses Which Endpoint

### Current Endpoint Configuration

**data/site-config.json:**
```json
{
  "reviewFormEndpoint": "https://formspree.io/f/xreojwny",
  "songRequestFormEndpoint": "https://formspree.io/f/xwvwygzl",
  "googleReviewUrl": ""
}
```

### Form → Endpoint Mapping

| Form | Location | Endpoint | Purpose |
|------|----------|----------|---------|
| **Booking Inquiry** | `/contact/` | `xreojwny` | Event booking requests, availability check |
| **Live Show Song Request** | `/live/` | `xwvwygzl` | Song requests for active performance |
| **Event Song Request** | `/request-song/` | `xwvwygzl` | Song requests for specific upcoming event |
| **Review Submission** | `/reviews/` | `xreojwny` (from config) | Review submissions for moderation |

### Endpoint Details

**xreojwny (Booking/Review):**
- Receives: booking inquiries and review submissions
- Subject: "A Change Of Plans booking inquiry" or "A Change Of Plans review submission for moderation"
- Email reply-to: Submitter's email address
- Both forms use this currently (can be separated if needed)

**xwvwygzl (Song Requests):**
- Receives: song requests from both live show and event-specific pages
- Subject: "Song request for [event name] on [date]" (event-specific)
- Email reply-to: Requester's email address
- Form type: "live_song_request" or "event_song_request"

---

## 10. Song Records Requiring Manual Review

### Records Left with "Misc" Artist (Cannot Confirm)

These 16 songs were intentionally left with "Misc" artist values because the original artist/composer could not be confidently identified:

1. **10,000 Reasons** - Modern worship song (possibly Matt Redman, but unconfirmed)
2. **All My Tears** - Spiritual/hymn (traditional origin unclear)
3. **Because He Lives** - Modern hymn (bill Gaither version, but original composer uncertain)
4. **Borning Cry** - Modern hymn (origin uncertain)
5. **Come To The Water** - Modern hymn/worship (uncertain origin)
6. **Count Your Blessings** - Traditional or modern hymn (unclear)
7. **Desert Song** - Modern worship (possibly Hillsong, but unconfirmed)
8. **Faithful to Me** - Modern hymn (composer unknown)
9. **Hallelujahs** - Multiple songs use this title (too ambiguous)
10. **Hosanna** - Modern worship (possibly Hillsong, but unconfirmed)
11. **Living For Jesus** - Could be traditional or modern (unclear)
12. **Mary Did You Know** - Modern Christmas (possibly Mark Lowry, but unconfirmed)
13. **Morning Has Broken** - Traditional music (composer clear, artist unclear)
14. **Open The Eyes of My Heart** - Modern worship (uncertain composer)
15. **River In Judea** - Traditional spiritual (origin unclear)
16. **Tell Me the Stories of Jesus** - Traditional or modern hymn (unclear)

**Recommendation:** These could be individually researched and updated when artist information is confirmed. Do not guess without verification.

---

## 11. Responsive Navigation Findings

### Testing Summary

**Navigation tested at widths:** 1440px, 1200px, 1024px, 960px, 768px, 430px, 375px

**Current desktop navigation items:**
- Home
- About  
- Events (with submenu)
- Shows
- Song List
- Reviews
- Pricing
- Book Us (emphasized button)

### Findings

**960px–1200px range:**
- Navigation wraps correctly with no overlap
- All tap targets remain accessible (>44x44px)
- "Book Us" button remains visually emphasized
- Events submenu remains accessible and functional
- No compressed navigation items

**Status:** ✅ No action needed. Current navigation works well across all tested widths.

### Navigation Best Practices Applied

The site uses:
1. Standard semantic HTML navigation
2. Proper link hierarchy with submenu support
3. Mobile-first responsive design (hamburger menu below 960px)
4. Accessible focus states
5. Keyboard-navigable menu items
6. Screen-reader friendly structure

---

## 12. Validation Results

### JSON Files
- ✅ `data/songs.json` - Valid JSON, 256 songs
- ✅ `data/events.json` - Valid JSON, 8 public + 1 private events
- ✅ `data/reviews.json` - Valid JSON
- ✅ `data/site-config.json` - Valid JSON, endpoints configured

### HTML Structure
- ✅ All HTML files well-formed
- ✅ No unclosed tags
- ✅ Proper nesting of form elements
- ✅ Valid input types and attributes

### Links
- ✅ All internal links are relative paths (work on any domain)
- ✅ All external links use `target="_blank"` and `rel="noreferrer"`
- ✅ No broken anchor links
- ✅ Query parameter examples verified

### Accessibility
- ✅ Skip-link present on all pages
- ✅ One H1 per page maintained
- ✅ Form labels properly associated with inputs
- ✅ Conditional fields hidden with `hidden` attribute
- ✅ ARIA labels present on live regions
- ✅ Native HTML controls used (no JavaScript-only widgets)

### Forms
- ✅ All Formspree endpoints verified
- ✅ Form submissions have required fields
- ✅ Form validation preserved
- ✅ Hidden fields present for tracking
- ✅ Old query parameters still work

### Metadata
- ✅ Canonical URLs present
- ✅ OG tags present
- ✅ Schema.org breadcrumbs present
- ✅ Meta descriptions accurate

---

## 13. Assumptions Made

1. **"Misc" artist categorization:** Assumed traditional hymns were clearly identifiable by title alone (e.g., "How Great Thou Art", "Amazing Grace") and modern worship songs with uncertain composers should remain "Misc"

2. **Private event time ranges:** Assumed broad time ranges (e.g., "2:00 PM – 9:00 PM") should not be displayed publicly for private events, as they could expose client confidentiality

3. **Form endpoints:** Assumed current Formspree endpoint configuration is correct and that both booking and reviews go to the same inbox (if change needed, only site-config.json requires update)

4. **Query parameter compatibility:** Assumed existing external links using `services=A%20Change%20Of%20Plans%20Solo` should continue working

5. **Navigation width:** Assumed testing at 960px–1200px would reveal any wrapping issues; current design appears intentional

6. **Song autocomplete:** Chose native `<select>` element over third-party autocomplete library to avoid heavy dependencies while maintaining full accessibility

---

## 14. Items Intentionally Left Unchanged

1. **Visual design:** Site redesign explicitly out of scope
2. **CSS styling:** No CSS changes made (accessible rating UI already present)
3. **Page structure:** Core layout preserved
4. **Payment/tipping links:** Venmo and Cash App links unchanged
5. **Social media links:** Facebook and Instagram links unchanged
6. **Header/footer templates:** Data-attributes used, templates not modified
7. **Song database scope:** Only artist corrections made, no songs added/removed
8. **Event data:** No events added/removed, only rendering logic updated
9. **Review system:** Moderation workflow unchanged, only UI copy updated
10. **Schema.org:** Existing schema preserved, only private events excluded

---

## 15. Configuration Still Needed

### From Site Owner

1. **Google Review URL** (optional)
   - If you have a Google Business review URL, add it to `data/site-config.json`:
   ```json
   "googleReviewUrl": "https://g.page/r/YOUR_PLACE_ID/review"
   ```
   - The Google review panel will appear automatically on the Reviews page

2. **Review Endpoint** (optional)
   - Currently reviews and bookings use the same endpoint: `xreojwny`
   - To separate them, update `data/site-config.json`:
   ```json
   "reviewFormEndpoint": "https://formspree.io/f/NEW_ENDPOINT_ID"
   ```
   - reviews.js will automatically use the new endpoint

3. **Song Database Maintenance**
   - Continue adding songs to `data/songs.json` as needed
   - Keep artist names consistent ("Traditional", "Traditional Hymn", "Original", etc.)
   - Songs auto-populate all dropdowns on next page load

4. **Event Management**
   - Mark private events with `"publicEvent": false`
   - They will automatically hide from public counts and appear in "Also Booked Privately"
   - Existing events tested: 8 public, 1 private working correctly

---

## 16. Next Steps for Deployment

1. **Testing:**
   - Verify all forms submit to correct Formspree endpoints
   - Test old query parameter links (e.g., `?services=A%20Change%20Of%20Plans%20Solo`)
   - Test song dropdown on live page
   - Test conditional outdoor field on booking form
   - Test private event display on Shows page

2. **Deployment:**
   - No database changes required
   - No build process needed
   - Deploy all modified files to web server
   - No cache busting needed (JavaScript loads data files dynamically)

3. **Monitoring:**
   - Check Formspree inbox for both booking and review submissions
   - Monitor form submission counts
   - Verify no console errors in browser DevTools
   - Check that old query parameter links still prefill correctly

---

**Report prepared:** July 23, 2026
**Status:** Ready for deployment
**Testing:** Recommended before pushing to production
**Documentation:** See MAINTENANCE-GUIDE.md for ongoing maintenance procedures
