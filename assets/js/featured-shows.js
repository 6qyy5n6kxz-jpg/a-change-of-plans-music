const featuredShowsContainer = document.querySelector("[data-featured-shows-preview]");

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const renderFeaturedShowCard = (show) => {
  const showUrl = window.resolveSitePath(`signature-shows/${encodeURIComponent(show.slug)}/`);
  return `
    <article class="featured-show-card">
      <figure class="show-card-image">
        <div class="show-image-placeholder" aria-hidden="true"></div>
        <figcaption class="show-card-title">${escapeHtml(show.title)}</figcaption>
      </figure>
      <div class="show-card-content">
        <p class="show-description">${escapeHtml(show.shortDescription)}</p>
        <div class="show-venue-tags">
          ${show.idealFor.slice(0, 2).map(venue => `<span class="venue-tag">${escapeHtml(venue)}</span>`).join("")}
        </div>
        <a class="button button-secondary" href="${escapeHtml(showUrl)}">View Show</a>
      </div>
    </article>
  `;
};

const loadFeaturedShows = async () => {
  try {
    const response = await fetch(window.resolveSitePath("data/signature-shows.json"));
    const data = await response.json();
    
    if (featuredShowsContainer && data.shows) {
      const featuredShows = data.shows.filter(show => show.featured === true);
      featuredShowsContainer.innerHTML = featuredShows
        .map(show => renderFeaturedShowCard(show))
        .join("");
    }
  } catch (error) {
    console.error("Error loading featured shows:", error);
  }
};

if (featuredShowsContainer) {
  loadFeaturedShows();
}
