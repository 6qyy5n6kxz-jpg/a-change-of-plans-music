const reviewsList = document.querySelector("[data-reviews-list]");
const reviewsPreview = document.querySelector("[data-reviews-preview]");
const reviewForm = document.querySelector("[data-review-form]");
const reviewFeedback = document.querySelector("[data-review-feedback]");
const googleReviewPanel = document.querySelector("[data-google-review-panel]");
const googleReviewLink = document.querySelector("[data-google-review-link]");

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const getDisplayName = (review) => {
  if (review.displayName) return review.displayName;
  const parts = String(review.name || "Guest").trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1).charAt(0)}.` : parts[0];
};

const renderStars = (rating) => {
  const count = Number(rating);
  if (!Number.isInteger(count) || count < 1 || count > 5) return "";
  return `<span class="review-stars" aria-label="${count} out of 5 stars">${"★".repeat(count)}${"☆".repeat(5 - count)}</span>`;
};

const renderReview = (review) => {
  const context = [review.eventType, review.venue].filter(Boolean).map(escapeHtml).join(" · ");
  return `
    <article class="review-card">
      ${renderStars(review.rating)}
      <blockquote><p>“${escapeHtml(review.reviewText)}”</p></blockquote>
      <footer><strong>${escapeHtml(getDisplayName(review))}</strong>${context ? `<br><span>${context}</span>` : ""}</footer>
    </article>`;
};

const loadReviews = async () => {
  if (!reviewsList && !reviewsPreview) return;
  try {
    const response = await fetch(window.resolveSitePath("data/reviews.json"));
    if (!response.ok) throw new Error(`Reviews could not be loaded: ${response.status}`);
    const payload = await response.json();
    const approved = (Array.isArray(payload.reviews) ? payload.reviews : []).filter((review) => review.approved === true);

    if (reviewsList) {
      reviewsList.innerHTML = approved.length
        ? approved.map(renderReview).join("")
        : '<div class="review-empty"><h2>Real experiences will live here.</h2><p>Reviews will be added as guests and event hosts share their experiences and approve them for publication.</p></div>';
    }

    if (reviewsPreview) {
      const featured = approved.filter((review) => review.featured === true).slice(0, 3);
      const previewItems = featured.length ? featured : approved.slice(0, 3);
      reviewsPreview.innerHTML = previewItems.length
        ? `${previewItems.map(renderReview).join("")}<div class="button-row button-row-centered"><a class="button button-secondary" href="${window.resolveSitePath("reviews/")}">Read All Reviews</a></div>`
        : `<div class="review-callout content-card"><p class="eyebrow">Share your experience</p><h2>Have you seen A Change Of Plans perform?</h2><p>We’d love to hear about your experience. Every submission is reviewed before it appears publicly.</p><div class="button-row"><a class="button button-secondary" href="${window.resolveSitePath("reviews/#share-review")}">Share Your Feedback</a></div></div>`;
    }
  } catch (error) {
    if (reviewsList) reviewsList.innerHTML = '<div class="review-empty"><h2>Reviews are temporarily unavailable.</h2><p>Please check back soon.</p></div>';
    console.error("Unable to render reviews.", error);
  }
};

const loadReviewConfiguration = async () => {
  if (!googleReviewPanel || !googleReviewLink) return;
  try {
    const response = await fetch(window.resolveSitePath("data/site-config.json"));
    if (!response.ok) return;
    const config = await response.json();
    if (reviewForm && /^https:\/\/formspree\.io\/f\//i.test(config.reviewFormEndpoint || "")) {
      reviewForm.dataset.formspreeEndpoint = config.reviewFormEndpoint;
    }
    if (/^https:\/\//i.test(config.googleReviewUrl || "")) {
      googleReviewLink.href = config.googleReviewUrl;
      googleReviewPanel.hidden = false;
    }
  } catch {
    // Keep the Google review panel hidden until a valid URL is configured.
  }
};

if (reviewForm && reviewFeedback) {
  const submitButton = reviewForm.querySelector('button[type="submit"]');
  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!reviewForm.reportValidity()) return;
    const endpoint = reviewForm.dataset.formspreeEndpoint;
    if (!endpoint) {
      reviewFeedback.textContent = "Review submissions are not configured yet. Please try again later.";
      return;
    }
    const formData = new FormData(reviewForm);
    formData.set("form_type", "testimonial_submission");
    formData.set("submitted_at", new Date().toISOString());
    formData.set("_subject", "A Change Of Plans review submission for moderation");
    formData.set("_replyto", String(formData.get("email") || ""));
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Sending…"; }
    reviewFeedback.textContent = "Sending your review…";
    try {
      const response = await fetch(endpoint, { method: "POST", body: formData, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Your review could not be sent. Please try again.");
      reviewForm.reset();
      reviewFeedback.textContent = "Thank you for sharing your experience. Reviews are checked before appearing on the website.";
    } catch (error) {
      reviewFeedback.textContent = error.message || "There was a problem sending your review. Please try again later.";
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Submit Review for Moderation"; }
    }
  });
}

loadReviews();
loadReviewConfiguration();
