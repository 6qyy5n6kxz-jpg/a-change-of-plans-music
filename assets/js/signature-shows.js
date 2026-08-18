const showsContainer = document.querySelector(".signature-show-grid");

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const renderShowCard = (show) => {
  const showUrl = window.resolveSitePath(`/signature-shows/${encodeURIComponent(show.slug)}/`);
  const highlights = Array.isArray(show.experienceHighlights)
    ? `<ul class="show-card-highlights">
        ${show.experienceHighlights.slice(0, 3).map(highlight => `<li>${escapeHtml(highlight)}</li>`).join("")}
      </ul>`
    : "";
  const idealFor = Array.isArray(show.idealFor) ? show.idealFor.slice(0, 3) : [];

  return `
    <article class="show-card" data-show-card-theme="${escapeHtml(show.slug)}">
      <div class="show-card-poster">
        <p class="show-card-kicker">Signature Show</p>
        <h3 class="show-card-title">${escapeHtml(show.title)}</h3>
        <p class="show-card-experience">${escapeHtml(show.experienceLabel)}</p>
      </div>
      <div class="show-card-content">
        <p class="show-description">${escapeHtml(show.shortDescription)}</p>

        ${highlights}

        <div class="show-card-fit">
          <p class="mini-heading">Great For</p>
          <div class="show-venue-tags">
            ${idealFor.map(venue => `<span class="venue-tag">${escapeHtml(venue)}</span>`).join("")}
          </div>
        </div>

        <a class="button button-secondary show-card-button" href="${escapeHtml(showUrl)}">Explore ${escapeHtml(show.title)}</a>
      </div>
    </article>
  `;
};

const loadShowCards = async () => {
  try {
    const response = await fetch(window.resolveSitePath("../data/signature-shows.json"));
    const data = await response.json();
    
    if (showsContainer && data.shows) {
      showsContainer.innerHTML = data.shows
        .map(show => renderShowCard(show))
        .join("");
    }
  } catch (error) {
    console.error("Error loading signature shows:", error);
    if (showsContainer) {
      showsContainer.innerHTML = "<p>Unable to load shows. Please try again later.</p>";
    }
  }
};

loadShowCards();
