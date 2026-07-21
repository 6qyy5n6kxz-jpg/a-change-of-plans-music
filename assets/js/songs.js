const songListTarget = document.querySelector("[data-song-list]");
const songMetaTarget = document.querySelector("[data-song-meta]");
const songSearch = document.querySelector("#song-search");
const songFilterButtons = document.querySelectorAll("[data-song-filter]");
const songActions = document.querySelector("[data-song-actions]");
const showMoreButton = document.querySelector("[data-song-show-more]");
const requestForm = document.querySelector("[data-song-request-form]");
const requestFeedback = document.querySelector("[data-song-request-feedback]");
const RESULTS_BATCH_SIZE = 12;
const FEATURED_SONGS = [
  { title: "Brown Eyed Girl", artist: "Van Morrison" },
  { title: "Hotel California", artist: "Eagles" },
  { title: "Imagine", artist: "John Lennon" },
  { title: "Parachute", artist: "Chris Stapleton" },
  { title: "Piano Man", artist: "Billy Joel" },
  { title: "Rhiannon", artist: "Fleetwood Mac" },
  { title: "House Of The Rising Sun", artist: "The Animals" },
  { title: "Turn The Page", artist: "Bob Seger" }
];

let activeFilter = "all";
let visibleSongCount = RESULTS_BATCH_SIZE;
let allSongs = [];
let hasExitedFeaturedMode = false;

const normalizeValue = (value) => (value || "").toString().trim().toLowerCase();

const createSongKey = (title, artist) => `${normalizeValue(title)}::${normalizeValue(artist)}`;

const getInstrumentTag = (song) => {
  const normalizedTags = (song.tags || []).map(normalizeValue);
  return normalizedTags.find((tag) => tag === "guitar" || tag === "piano") || normalizeValue(song.instrument);
};

const getActiveMode = (query) => {
  if (!hasExitedFeaturedMode && !query && activeFilter === "all") {
    return "featured";
  }

  if (query) {
    return "search";
  }

  return "filtered";
};

const getFeaturedSongs = (songs) => {
  const songIndex = new Map(songs.map((song) => [createSongKey(song.title, song.artist), song]));

  return FEATURED_SONGS
    .map((song) => songIndex.get(createSongKey(song.title, song.artist)))
    .filter(Boolean);
};

const getMatchingSongs = (songs, query) => songs.filter((song) => {
  const matchesFilter = activeFilter === "all" || getInstrumentTag(song) === activeFilter;

  if (!matchesFilter) {
    return false;
  }

  if (!query) {
    return true;
  }

  const searchableText = [
    song.title,
    song.artist,
    ...(song.tags || [])
  ].map(normalizeValue).join(" ");

  return searchableText.includes(query);
});

const getSongMetaText = (mode, shownCount, totalCount) => {
  if (mode === "featured") {
    return `Showing ${shownCount} featured song${shownCount === 1 ? "" : "s"}`;
  }

  if (!totalCount) {
    return "No matches found";
  }

  if (shownCount < totalCount) {
    return `Showing ${shownCount} of ${totalCount} matching song${totalCount === 1 ? "" : "s"}`;
  }

  return `Showing all ${totalCount} matching song${totalCount === 1 ? "" : "s"}`;
};

const renderSongCards = (songs) => songs.map((song) => `
  <article class="song-card">
    <h3>${song.title}</h3>
    <p><strong>${song.artist}</strong></p>
    <div class="song-card-tags">
      <span class="badge">${getInstrumentTag(song)}</span>
    </div>
  </article>
`).join("");

const updateSongMeta = (mode, shownCount, totalCount) => {
  if (songMetaTarget) {
    songMetaTarget.textContent = getSongMetaText(mode, shownCount, totalCount);
  }
};

const updateShowMoreState = (mode, shownCount, totalCount) => {
  if (!songActions || !showMoreButton) {
    return;
  }

  const shouldShow = mode !== "featured" && totalCount > shownCount;
  songActions.hidden = !shouldShow;
  showMoreButton.hidden = !shouldShow;
};

const renderSongs = () => {
  if (!songListTarget) {
    return;
  }

  const query = normalizeValue(songSearch?.value);
  const mode = getActiveMode(query);
  const matchingSongs = mode === "featured"
    ? getFeaturedSongs(allSongs)
    : getMatchingSongs(allSongs, query);
  const visibleSongs = mode === "featured"
    ? matchingSongs
    : matchingSongs.slice(0, visibleSongCount);

  updateSongMeta(mode, visibleSongs.length, matchingSongs.length);
  updateShowMoreState(mode, visibleSongs.length, matchingSongs.length);

  if (!visibleSongs.length) {
    songListTarget.innerHTML = `
      <article class="song-card">
        <h3>No matches found</h3>
        <p>Try a title, artist, or instrument keyword.</p>
      </article>
    `;

    return;
  }

  songListTarget.innerHTML = renderSongCards(visibleSongs);
};

const loadSongs = async () => {
  if (!songListTarget) {
    return;
  }

  try {
    const response = await fetch(window.resolveSitePath("data/songs.json"));
    const payload = await response.json();
    allSongs = Array.isArray(payload.songs) ? payload.songs : [];
    renderSongs();

    if (songSearch) {
      songSearch.addEventListener("input", () => {
        if (songSearch.value.trim()) {
          hasExitedFeaturedMode = true;
        }
        visibleSongCount = RESULTS_BATCH_SIZE;
        renderSongs();
      });
    }

    songFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        hasExitedFeaturedMode = true;
        activeFilter = button.dataset.songFilter || "all";
        songFilterButtons.forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });
        visibleSongCount = RESULTS_BATCH_SIZE;
        renderSongs();
      });
    });

    if (showMoreButton) {
      showMoreButton.addEventListener("click", () => {
        visibleSongCount += RESULTS_BATCH_SIZE;
        renderSongs();
      });
    }
  } catch (error) {
    songListTarget.innerHTML = `
      <article class="song-card">
        <h3>Song list unavailable</h3>
        <p>The song JSON could not be loaded. Serve the project from a web server and verify <code>data/songs.json</code>.</p>
      </article>
    `;

    if (songActions) {
      songActions.hidden = true;
    }
  }
};

if (requestForm && requestFeedback) {
  const submitButton = requestForm.querySelector('button[type="submit"]');

  requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const endpoint = requestForm.dataset.formspreeEndpoint;

    if (!endpoint) {
      requestFeedback.textContent = "The song request form is temporarily unavailable. Please try again later.";
      return;
    }

    const formData = new FormData(requestForm);
    formData.append("_subject", `A Change Of Plans song request: ${formData.get("song") || "New request"}`);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    requestFeedback.textContent = "Sending your song request...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        let errorMessage = "Your song request could not be sent. Please try again.";

        try {
          const errorPayload = await response.json();
          if (Array.isArray(errorPayload.errors) && errorPayload.errors.length) {
            errorMessage = errorPayload.errors.map((item) => item.message).join(" ");
          }
        } catch {
          // Use the default message when the response body is not JSON.
        }

        throw new Error(errorMessage);
      }

      requestForm.reset();
      requestFeedback.textContent = "Thanks! Your song request was sent.";
    } catch (error) {
      requestFeedback.textContent = error.message || "There was a problem sending your song request. Please try again in a few minutes.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Song Request";
      }
    }
  });
}

loadSongs();
