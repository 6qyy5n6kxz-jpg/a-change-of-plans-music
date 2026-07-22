const eventsContainer = document.querySelector("[data-events-list]");
const summaryTarget = document.querySelector("[data-events-summary]");
const scheduleToggle = document.querySelector("[data-schedule-toggle]");
const scheduleSection = document.querySelector("[data-schedule-section]");
const collapsedEventCount = Math.max(1, Number(eventsContainer?.dataset.collapsedCount) || 3);

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatDate = (dateValue) => {
  const date = new Date(`${dateValue}T12:00:00-04:00`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};

const getTodayKey = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const getEventHeadline = (event) => event.venue || event.location || event.title || "Venue details coming soon";
const isPrivateEvent = (event) => event.publicEvent === false
  || event.eventType === "private"
  || /private\s+(?:function|event)/i.test(`${event.title || ""} ${event.description || ""}`);

const getRequestCloseTime = (event) => {
  const value = event.requestDeadline || event.startsAt;
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const getRequestState = (event) => {
  if (isPrivateEvent(event) || event.publicEvent !== true || event.allowSongRequests !== true) return "disabled";
  const closesAt = getRequestCloseTime(event);
  if (closesAt === null) return "disabled";
  return Date.now() >= closesAt ? "closed" : "open";
};

const renderRequestAction = (event) => {
  const state = getRequestState(event);
  if (state === "disabled") return "";
  if (state === "closed") return '<p class="request-closed">Song requests for this event are now closed.</p>';
  const eventName = getEventHeadline(event);
  const label = event.requestLabel || "Request a Song for This Show";
  const href = window.resolveSitePath(`request-song/?event=${encodeURIComponent(event.eventId)}`);
  return `<p class="event-request-action"><a class="button button-secondary" href="${escapeHtml(href)}" aria-label="Request a song for ${escapeHtml(eventName)} on ${escapeHtml(formatDate(event.date))}">${escapeHtml(label)}</a></p>`;
};

const injectEventSchema = (items) => {
  const publicEvents = items.filter((event) => !isPrivateEvent(event));
  if (!publicEvents.length) return;

  const previousSchema = document.querySelector("[data-generated-event-schema]");
  if (previousSchema) previousSchema.remove();

  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.dataset.generatedEventSchema = "";
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": publicEvents.map((event) => ({
      "@type": "MusicEvent",
      name: event.title || "A Change Of Plans live performance",
      startDate: event.startsAt || event.date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      description: event.description || "Live performance by A Change Of Plans.",
      location: { "@type": "Place", name: getEventHeadline(event) },
      performer: { "@type": "MusicGroup", "@id": "https://achangeofplansmusic.com/#group", name: "A Change Of Plans" }
    }))
  });
  document.head.append(schema);
};

const renderDescription = (description) => description
  ? `<p class="event-description">${escapeHtml(description)}</p>`
  : "";

const renderSummary = (items, category) => {
  if (!summaryTarget) return;

  if (!items.length) {
    summaryTarget.innerHTML = `<p>No upcoming ${escapeHtml(category)} events are listed right now. Check back soon for new dates.</p>`;
    return;
  }

  const publicEvents = items.filter((event) => !isPrivateEvent(event));
  const nextEvent = publicEvents[0] || items[0];
  const highlights = publicEvents.filter((event) => event !== nextEvent).slice(0, 3);

  summaryTarget.innerHTML = `
    <p class="event-count"><strong>${items.length}</strong> upcoming show${items.length === 1 ? "" : "s"}</p>
    <article class="schedule-next-show">
      <p class="mini-heading">Next Show</p>
      <dl>
        <div><dt>Date</dt><dd>${escapeHtml(formatDate(nextEvent.date))}</dd></div>
        <div><dt>Venue</dt><dd>${escapeHtml(getEventHeadline(nextEvent))}</dd></div>
        <div><dt>Time</dt><dd>${escapeHtml(nextEvent.time)}</dd></div>
      </dl>
    </article>
    ${highlights.length ? `
      <div class="schedule-highlights">
        <p class="mini-heading">Upcoming Highlights</p>
        <ul>${highlights.map((event) => `<li><time datetime="${escapeHtml(event.date)}">${escapeHtml(formatDate(event.date))}</time><span>${escapeHtml(getEventHeadline(event))}</span></li>`).join("")}</ul>
      </div>
    ` : ""}
  `;
};

const setupScheduleToggle = () => {
  if (!scheduleToggle || !eventsContainer) return;

  const cards = [...eventsContainer.querySelectorAll(".event-card")];
  if (cards.length <= collapsedEventCount) {
    scheduleToggle.hidden = true;
    return;
  }

  const setExpanded = (expanded) => {
    cards.forEach((card, index) => {
      const shouldHide = !expanded && index >= collapsedEventCount;
      card.hidden = shouldHide;
      card.setAttribute("aria-hidden", String(shouldHide));
    });
    scheduleToggle.setAttribute("aria-expanded", String(expanded));
    scheduleToggle.textContent = expanded ? "Show Fewer Events" : "View All Upcoming Shows";
  };

  scheduleToggle.hidden = false;
  setExpanded(false);
  scheduleToggle.addEventListener("click", () => {
    const wasExpanded = scheduleToggle.getAttribute("aria-expanded") === "true";
    setExpanded(!wasExpanded);

    if (wasExpanded && scheduleSection?.getBoundingClientRect().top < 0) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      scheduleSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });
};

const renderEvents = async () => {
  if (!eventsContainer) return;

  try {
    const response = await fetch(window.resolveSitePath("data/events.json"));
    if (!response.ok) throw new Error(`Failed to load events: ${response.status}`);

    const payload = await response.json();
    const category = eventsContainer.dataset.eventCategory || "music";
    const todayKey = getTodayKey();
    const items = (Array.isArray(payload.events) ? payload.events : [])
      .filter((event) => event.category === category)
      .filter((event) => event.date >= todayKey)
      .sort((left, right) => left.date.localeCompare(right.date));

    injectEventSchema(items);

    renderSummary(items, category);

    if (!items.length) {
      eventsContainer.innerHTML = `<article class="event-card"><h3>More dates coming soon</h3><p>Follow A Change Of Plans on social media or check back here for the next public performance dates.</p></article>`;
      return;
    }

    eventsContainer.innerHTML = items.map((event) => {
      const privateEvent = isPrivateEvent(event);
      return `
        <article class="event-card${privateEvent ? " event-card-private" : ""}">
          <div class="event-card-topline">
            <time class="event-date" datetime="${escapeHtml(event.date)}">${escapeHtml(formatDate(event.date))}</time>
            ${privateEvent ? '<span class="private-event-label">Private Event</span>' : ""}
          </div>
          <h3>${privateEvent ? "Private Event" : escapeHtml(getEventHeadline(event))}</h3>
          ${privateEvent ? "" : renderDescription(event.description)}
          ${privateEvent ? "" : `<p class="event-time"><strong>Time:</strong> <span>${escapeHtml(event.time)}</span></p>`}
          ${privateEvent ? "" : renderRequestAction(event)}
        </article>
      `;
    }).join("");

    setupScheduleToggle();
  } catch (error) {
    if (scheduleToggle) scheduleToggle.hidden = true;
    eventsContainer.innerHTML = `<article class="event-card"><h3>Schedule unavailable</h3><p>The event data could not be loaded. Please check back shortly for upcoming dates.</p></article>`;
    console.error("Unable to render events schedule.", error);
  }
};

renderEvents();
