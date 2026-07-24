const showsContainer = document.querySelector(".signature-show-grid");

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const renderShowCard = (show) => {
  const showUrl = window.resolveSitePath(`/signature-shows/${encodeURIComponent(show.slug)}/`);
  return `
    <article class="show-card">
      <figure class="show-card-image">
        <div class="show-image-placeholder" aria-hidden="true"></div>
        <figcaption class="show-card-title">${escapeHtml(show.title)}</figcaption>
      </figure>
      <div class="show-card-content">
        <p class="show-description">${escapeHtml(show.shortDescription)}</p>
        <div class="show-venue-tags">
          ${show.idealFor.slice(0, 3).map(venue => `<span class="venue-tag">${escapeHtml(venue)}</span>`).join("")}
        </div>
        <a class="button button-secondary" href="${escapeHtml(showUrl)}">View Show</a>
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
