const requestForm = document.querySelector("[data-event-request-form]");
const requestPanel = document.querySelector("[data-event-request-panel]");
const unavailablePanel = document.querySelector("[data-event-request-unavailable]");
const feedback = document.querySelector("[data-event-request-feedback]");
const eventTitleTarget = document.querySelector("[data-selected-event-title]");
const eventMetaTarget = document.querySelector("[data-selected-event-meta]");
const songSelect = document.querySelector("[data-event-song-select]");

const formatDate = (dateValue) => new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
}).format(new Date(`${dateValue}T12:00:00-04:00`));

const isRequestOpen = (event) => {
  if (!event || event.publicEvent !== true || event.allowSongRequests !== true || event.eventType === "private") return false;
  const closesAt = event.requestDeadline || event.startsAt;
  if (!closesAt) return false;
  const timestamp = new Date(closesAt).getTime();
  return Number.isFinite(timestamp) && Date.now() < timestamp;
};

const showUnavailable = (message) => {
  if (requestPanel) requestPanel.hidden = true;
  if (unavailablePanel) {
    unavailablePanel.hidden = false;
    const text = unavailablePanel.querySelector("[data-unavailable-message]");
    if (text) text.textContent = message;
  }
};

const initializeRequest = async () => {
  if (!requestForm || !songSelect) return;
  const eventId = new URLSearchParams(window.location.search).get("event") || "";
  if (!eventId) {
    showUnavailable("Choose an eligible public event from the Shows page to make an event-specific request.");
    return;
  }

  try {
    const [eventsResponse, songsResponse, configResponse] = await Promise.all([
      fetch(window.resolveSitePath("data/events.json")),
      fetch(window.resolveSitePath("data/songs.json")),
      fetch(window.resolveSitePath("data/site-config.json"))
    ]);
    if (!eventsResponse.ok || !songsResponse.ok) throw new Error("Request information could not be loaded.");
    const [eventsPayload, songsPayload] = await Promise.all([eventsResponse.json(), songsResponse.json()]);
    if (configResponse.ok) {
      const config = await configResponse.json();
      if (/^https:\/\/formspree\.io\/f\//i.test(config.songRequestFormEndpoint || "")) {
        requestForm.dataset.formspreeEndpoint = config.songRequestFormEndpoint;
      }
    }
    const selectedEvent = (eventsPayload.events || []).find((event) => event.eventId === eventId);

    if (!selectedEvent || selectedEvent.publicEvent !== true || selectedEvent.eventType === "private") {
      showUnavailable("This event is not available for public song requests.");
      return;
    }
    if (selectedEvent.allowSongRequests !== true) {
      showUnavailable("Song requests are not enabled for this event.");
      return;
    }
    if (!isRequestOpen(selectedEvent)) {
      showUnavailable("Song requests for this event are now closed.");
      return;
    }

    const songs = Array.isArray(songsPayload.songs) ? songsPayload.songs : [];
    songs.sort((left, right) => left.title.localeCompare(right.title)).forEach((song) => {
      const option = document.createElement("option");
      option.value = `${song.title} — ${song.artist}`;
      option.textContent = `${song.title} — ${song.artist}`;
      songSelect.append(option);
    });

    const title = selectedEvent.title || "A Change Of Plans performance";
    if (eventTitleTarget) eventTitleTarget.textContent = title;
    if (eventMetaTarget) eventMetaTarget.textContent = `${formatDate(selectedEvent.date)} · ${selectedEvent.time}`;
    requestForm.elements.event_id.value = selectedEvent.eventId;
    requestForm.elements.event_title.value = title;
    requestForm.elements.event_date.value = selectedEvent.date;
    if (unavailablePanel) unavailablePanel.hidden = true;
    requestPanel.hidden = false;

    requestForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!requestForm.reportValidity()) return;
      if (!isRequestOpen(selectedEvent)) {
        showUnavailable("Song requests for this event are now closed.");
        return;
      }
      const endpoint = requestForm.dataset.formspreeEndpoint;
      const submitButton = requestForm.querySelector('button[type="submit"]');
      const formData = new FormData(requestForm);
      formData.set("form_type", "event_song_request");
      formData.set("submitted_at", new Date().toISOString());
      formData.set("_subject", `Song request for ${title} on ${selectedEvent.date}`);
      formData.set("_replyto", String(formData.get("requester_email") || ""));
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Sending…"; }
      if (feedback) feedback.textContent = "Sending your request…";
      try {
        const response = await fetch(endpoint, { method: "POST", body: formData, headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Your request could not be sent. Please try again.");
        requestForm.reset();
        requestForm.elements.event_id.value = selectedEvent.eventId;
        requestForm.elements.event_title.value = title;
        requestForm.elements.event_date.value = selectedEvent.date;
        if (feedback) feedback.textContent = "Your request was sent. Requests help shape the set, but a song is not guaranteed to be performed.";
      } catch (error) {
        if (feedback) feedback.textContent = error.message || "There was a problem sending your request.";
      } finally {
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Send Event Song Request"; }
      }
    });
  } catch (error) {
    showUnavailable("Event song requests are temporarily unavailable. Please try again later.");
    console.error("Unable to initialize event song request.", error);
  }
};

initializeRequest();
