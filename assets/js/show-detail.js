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

const loadShowDetail = async () => {
  const showSlug = getShowSlug();
  if (!showSlug) {
    console.error("No show slug found");
    return;
  }

  try {
    const response = await fetch(window.resolveSitePath(`../data/signature-shows.json`));
    const data = await response.json();
    
    const show = data.shows.find(s => s.slug === showSlug);
    if (!show) {
      console.error(`Show not found: ${showSlug}`);
      return;
    }

    // Update meta tags
    document.title = `${show.title} | A Change Of Plans`;
    document.querySelector('meta[name="description"]').content = show.metaDescription;
    document.querySelector('meta[property="og:title"]').content = show.title;
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
    "@type": "MusicEvent",
    "name": show.title,
    "description": show.longDescription,
    "performer": {
      "@type": "MusicGroup",
      "@id": "https://achangeofplansmusic.com/#group",
      "name": "A Change Of Plans"
    },
    "url": `https://achangeofplansmusic.com/signature-shows/${show.slug}/`,
    "offers": {
      "@type": "AggregateOffer",
      "availability": "https://schema.org/PreOrder",
      "priceCurrency": "USD",
      "url": "https://achangeofplansmusic.com/contact/"
    }
  });
  document.head.append(schema);
};

loadShowDetail();
