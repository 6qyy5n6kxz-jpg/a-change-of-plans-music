const contactForm = document.querySelector("[data-contact-form]");
const contactFeedback = document.querySelector("[data-contact-feedback]");

if (contactForm && contactFeedback) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const query = new URLSearchParams(window.location.search);
  const performanceFormat = contactForm.querySelector('select[name="performanceFormat"]');
  const estimateField = contactForm.querySelector("[data-estimated-total]");
  const sourcePageField = contactForm.querySelector("[data-source-page]");

  const requestedService = query.get("services") || "";
  if (performanceFormat) {
    if (/solo/i.test(requestedService)) performanceFormat.value = "A Change Of Plans Solo";
    if (/duo/i.test(requestedService)) performanceFormat.value = "A Change Of Plans Duo";
  }

  if (estimateField && query.has("estimate")) {
    const estimate = Number(query.get("estimate"));
    estimateField.value = Number.isFinite(estimate) ? `$${estimate.toLocaleString("en-US")}` : query.get("estimate");
  }

  if (sourcePageField) {
    sourcePageField.value = query.get("source") || document.referrer || "Direct visit";
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const endpoint = contactForm.dataset.formspreeEndpoint;

    if (!endpoint) {
      contactFeedback.textContent = "The booking form is temporarily unavailable. Please try again later.";
      return;
    }

    const formData = new FormData(contactForm);
    formData.append("_subject", `A Change Of Plans booking inquiry: ${formData.get("eventType") || "New event"}`);
    formData.append("_replyto", `${formData.get("email") || ""}`);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    contactFeedback.textContent = "Submitting your inquiry...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        let message = "Your inquiry could not be sent. Please try again.";
        try {
          const payload = await response.json();
          if (Array.isArray(payload.errors) && payload.errors.length) {
            message = payload.errors.map((item) => item.message).join(" ");
          }
        } catch {
          // Keep the default message when Formspree does not return JSON.
        }
        throw new Error(message);
      }

      contactForm.reset();
      contactFeedback.textContent = "Thank you. Your inquiry was sent successfully.";
    } catch (error) {
      contactFeedback.textContent = error.message || "There was a problem sending your inquiry. Please try again in a few minutes.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Request Availability";
      }
    }
  });
}
