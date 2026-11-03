// Where the show schedule comes from.
// data/public-content.json switches the site to the Command Center's live feed of published gigs.
// data/events.json is the fallback: it is used until the switch is on, and any time the live feed
// can't be reached, so the schedule never goes blank.
const FEED_TIMEOUT_MS = 5000;
const FEED_URL = /^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/acop-public-content$/;

const readJson = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

const readLiveFeed = async () => {
  const config = await readJson(window.resolveSitePath("data/public-content.json"), { cache: "no-store" });
  if (config?.enabled !== true || !FEED_URL.test(config.events_endpoint || "")) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const feed = await readJson(config.events_endpoint, { cache: "no-store", signal: controller.signal });
    if (feed?.schema_version !== 1 || !Array.isArray(feed.events)) throw new Error("Unexpected feed format");
    return feed.events;
  } finally {
    clearTimeout(timer);
  }
};

export const loadEventsPayload = async () => {
  try {
    const events = await readLiveFeed();
    if (events) return { events, source: "live" };
  } catch (error) {
    console.warn("Live show schedule unavailable; showing data/events.json instead.", error);
  }
  const payload = await readJson(window.resolveSitePath("data/events.json"));
  return { events: Array.isArray(payload.events) ? payload.events : [], source: "file" };
};
