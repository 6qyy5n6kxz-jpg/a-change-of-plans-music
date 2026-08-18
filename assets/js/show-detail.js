const getShowSlug = () => document.body.dataset.showSlug || "";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const renderPerfomanceFormats = (formats) => {
  if (!formats || !Array.isArray(formats)) return "";
  return formats.map(format => `<li>${escapeHtml(format)}</li>`).join("");
};

const renderIdealFor = (venues) => {
  if (!venues || !Array.isArray(venues)) return "";
  return venues.map(venue => `<li>${escapeHtml(venue)}</li>`).join("");
};

const renderExperienceHighlights = (highlights) => {
  if (!highlights || !Array.isArray(highlights)) return "";
  return highlights.map(highlight => `<li>${escapeHtml(highlight)}</li>`).join("");
};

const renderExpectationParagraphs = (paragraphs) => {
  if (!paragraphs || !Array.isArray(paragraphs)) return "";
  return paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("");
};

const renderRelatedShows = (show, shows) => {
  if (!Array.isArray(show.relatedShows) || !Array.isArray(shows)) return "";

  return show.relatedShows
    .map(slug => shows.find(candidate => candidate.slug === slug && candidate.slug !== show.slug))
    .filter(Boolean)
    .slice(0, 2)
    .map(relatedShow => {
      const showUrl = window.resolveSitePath(`/signature-shows/${encodeURIComponent(relatedShow.slug)}/`);
      return `
        <a class="related-show-card" href="${escapeHtml(showUrl)}">
          <span class="related-show-title">${escapeHtml(relatedShow.title)}</span>
          <span class="related-show-experience">${escapeHtml(relatedShow.experienceLabel)}</span>
        </a>
      `;
    })
    .join("");
};

const loadShowDetail = async () => {
  const showSlug = getShowSlug();
  if (!showSlug) {
    console.error("No show slug found");
    return;
  }

  try {
    const response = await fetch(window.resolveSitePath("/data/signature-shows.json"));
    const data = await response.json();
    
    const show = data.shows.find(s => s.slug === showSlug);
    if (!show) {
      console.error(`Show not found: ${showSlug}`);
      return;
    }

    document.body.dataset.showTheme = show.slug;

    // Update meta tags
    document.title = show.metaTitle;
    document.querySelector('meta[name="description"]').content = show.metaDescription;
    document.querySelector('meta[property="og:title"]').content = show.metaTitle;
    document.querySelector('meta[property="og:description"]').content = show.metaDescription;
    document.querySelector('link[rel="canonical"]').href = `https://achangeofplansmusic.com/signature-shows/${show.slug}/`;
    document.querySelector('meta[property="og:url"]').content = `https://achangeofplansmusic.com/signature-shows/${show.slug}/`;

    // Update page content
    const titleElements = document.querySelectorAll("[data-show-title], [data-show-title-h1]");
    titleElements.forEach(el => {
      el.textContent = show.title;
    });

    const shortDescEl = document.querySelector("[data-show-short-description]");
    if (shortDescEl) {
      shortDescEl.textContent = show.shortDescription;
    }

    const experienceLabelEl = document.querySelector("[data-show-experience-label]");
    if (experienceLabelEl) {
      experienceLabelEl.textContent = show.experienceLabel;
    }

    const experienceHighlightsEl = document.querySelector("[data-show-experience-highlights]");
    if (experienceHighlightsEl) {
      experienceHighlightsEl.innerHTML = renderExperienceHighlights(show.experienceHighlights);
      if (experienceHighlightsEl.children.length) {
        experienceHighlightsEl.closest(".show-experience-strip")?.classList.add("is-loaded");
      }
    }

    const expectationsEl = document.querySelector("[data-show-expectations]");
    if (expectationsEl) {
      expectationsEl.innerHTML = renderExpectationParagraphs(show.expectationParagraphs);
    }

    const descriptionEl = document.querySelector("[data-show-description]");
    if (descriptionEl) {
      descriptionEl.innerHTML = `<p>${escapeHtml(show.longDescription)}</p>`;
    }

    const artistExamplesEl = document.querySelector("[data-show-artist-examples]");
    if (artistExamplesEl) {
      artistExamplesEl.textContent = show.artistExamples;
    }

    const performanceFormatsEl = document.querySelector("[data-performance-formats]");
    if (performanceFormatsEl) {
      performanceFormatsEl.innerHTML = renderPerfomanceFormats(show.performanceFormats);
    }

    const idealForEl = document.querySelector("[data-ideal-for]");
    if (idealForEl) {
      idealForEl.innerHTML = renderIdealFor(show.idealFor);
    }

    const relatedShowsEl = document.querySelector("[data-related-shows]");
    if (relatedShowsEl) {
      relatedShowsEl.innerHTML = renderRelatedShows(show, data.shows);
    }

    // Update booking CTA
    const bookingLinks = document.querySelectorAll("a[href*='contact']");
    bookingLinks.forEach(link => {
      if (link.href.includes("?show=")) return; // Skip if already has a parameter
      link.href = window.resolveSitePath(`../../contact/?show=${encodeURIComponent(show.slug)}`);
    });

    // Inject structured data
    updateShowSchema(show);
  } catch (error) {
    console.error("Error loading show detail:", error);
  }
};

const updateShowSchema = (show) => {
  const previousSchema = document.querySelector("[data-generated-show-schema]");
  if (previousSchema) previousSchema.remove();

  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.dataset.generatedShowSchema = "";
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": show.title,
    "description": show.longDescription,
    "serviceType": "Live music performance",
    "provider": {
      "@type": ["Organization", "MusicGroup"],
      "@id": "https://achangeofplansmusic.com/#group",
      "name": "A Change Of Plans",
      "url": "https://achangeofplansmusic.com/"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Northwest Ohio"
    },
    "url": `https://achangeofplansmusic.com/signature-shows/${show.slug}/`
  });
  document.head.append(schema);
};

loadShowDetail();
