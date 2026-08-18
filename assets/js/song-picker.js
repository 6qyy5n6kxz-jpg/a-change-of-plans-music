const normalizeValue = (value = "") => String(value).trim().toLowerCase();
const formatSong = (song) => `${song.title} — ${song.artist}`;

export const initializeSongPicker = ({
  searchInput,
  resultsTarget,
  hiddenInput,
  selectionTarget,
  songs,
  suggestions = []
}) => {
  if (!searchInput || !resultsTarget || !hiddenInput || !selectionTarget) return null;

  const availableSongs = (Array.isArray(songs) ? songs : [])
    .filter(song => song && typeof song.title === "string" && typeof song.artist === "string")
    .sort((left, right) => left.title.localeCompare(right.title) || left.artist.localeCompare(right.artist));
  const emptySelectionText = "No song selected yet.";
  const suggestedSongs = suggestions
    .map(suggestion => availableSongs.find(song => (
      song.title === suggestion.title && song.artist === suggestion.artist
    )))
    .filter(Boolean);

  const clearSelection = () => {
    hiddenInput.value = "";
    selectionTarget.textContent = emptySelectionText;
    selectionTarget.classList.remove("has-selection");
    searchInput.setCustomValidity("");
  };

  const selectSong = (song) => {
    const value = formatSong(song);
    hiddenInput.value = value;
    selectionTarget.textContent = `Selected: ${value}`;
    selectionTarget.classList.add("has-selection");
    searchInput.value = "";
    searchInput.setCustomValidity("");
    resultsTarget.classList.remove("is-suggestions");
    resultsTarget.replaceChildren();
  };

  const renderResults = (items, { showSuggestionLabel = false } = {}) => {
    const isShowingSuggestions = showSuggestionLabel && items.length > 0;
    resultsTarget.classList.toggle("is-suggestions", isShowingSuggestions);
    resultsTarget.replaceChildren();

    if (isShowingSuggestions) {
      const label = document.createElement("p");
      label.className = "mini-heading event-song-suggestions-label";
      label.textContent = "Popular Picks";
      resultsTarget.append(label);
    }

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "helper-text event-song-no-results";
      empty.textContent = searchInput.value.trim()
        ? "No matching songs found. Try another title or artist."
        : "Start typing a song title or artist.";
      resultsTarget.append(empty);
      return;
    }

    items.forEach(song => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "event-song-result";
      button.textContent = formatSong(song);
      button.addEventListener("click", () => selectSong(song));
      resultsTarget.append(button);
    });
  };

  const renderForQuery = () => {
    const query = normalizeValue(searchInput.value);
    if (!query) {
      renderResults(suggestedSongs, { showSuggestionLabel: true });
      return;
    }

    const matches = availableSongs
      .filter(song => normalizeValue(`${song.title} ${song.artist}`).includes(query))
      .slice(0, 8);
    renderResults(matches);
  };

  searchInput.addEventListener("input", () => {
    clearSelection();
    renderForQuery();
  });

  renderForQuery();

  return {
    getSelectedValue: () => hiddenInput.value,
    requireSelection: (message = "Choose a song from the current list.") => {
      if (hiddenInput.value) {
        searchInput.setCustomValidity("");
        return true;
      }
      searchInput.setCustomValidity(message);
      searchInput.reportValidity();
      return false;
    },
    reset: () => {
      searchInput.value = "";
      clearSelection();
      renderForQuery();
    }
  };
};
