// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeForm);
} else {
  initializeForm();
}

function initializeForm() {
  const contactForm = document.querySelector("[data-contact-form]");
  const contactFeedback = document.querySelector("[data-contact-feedback]");

  if (!contactForm || !contactFeedback) return;

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const query = new URLSearchParams(window.location.search);
  const performanceFormat = contactForm.querySelector('select[name="performanceFormat"]');
  const eventType = contactForm.querySelector('[data-event-type]');
  const eventDateField = contactForm.querySelector('input[name="eventDate"]');
  const settingField = contactForm.querySelector('select[name="setting"]');
  const estimateField = contactForm.querySelector("[data-estimated-total]");
  const sourcePageField = contactForm.querySelector("[data-source-page]");
  const selectedShowField = contactForm.querySelector("[data-selected-show]");
  const selectedShowSummary = contactForm.querySelector("[data-selected-show-summary]");

  // Set date minimum to today
  if (eventDateField) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    eventDateField.min = `${year}-${month}-${day}`;
  }

  // Handle performance format prefilling from query parameter
  const requestedService = query.get("services") || "";
  if (performanceFormat) {
    let prefillValue = requestedService;
    if (/A\s+Change\s+Of\s+Plans\s+Solo/i.test(requestedService)) {
      prefillValue = "Devin Frank Solo";
    }
    if (/solo/i.test(prefillValue)) performanceFormat.value = "Devin Frank Solo";
    if (/duo/i.test(prefillValue)) performanceFormat.value = "A Change Of Plans Duo";
  }

  // Resolve Signature Show context from the canonical show data.
  const requestedShow = query.get("show") || "";
  const requestedShowPromise = populateRequestedShow({
    requestedShow,
    selectedShowField,
    selectedShowSummary
  });

  // Handle event type prefilling from query parameter
  const requestedEventType = query.get("eventType") || "";
  if (eventType && requestedEventType) {
    const matchingOption = [...eventType.options].find((option) => option.value.toLowerCase() === requestedEventType.toLowerCase());
    if (matchingOption) eventType.value = matchingOption.value;
  }

  // Update conditional fields based on event type
  const updateConditionalFields = () => {
    if (!eventType) return;
    const value = eventType.value.toLowerCase();
    const activeGroup = value.includes("wedding")
      ? "wedding"
      : value.includes("church")
        ? "church"
        : value.includes("restaurant")
          ? "venue"
          : "";

    contactForm.querySelectorAll("[data-conditional]").forEach((group) => {
      group.hidden = group.dataset.conditional !== activeGroup;
    });
  };

  // Update conditional fields based on indoor/outdoor setting
  const updateOutdoorConditional = () => {
    const outdoorGroup = contactForm.querySelector('[data-conditional="outdoor"]');
    if (!outdoorGroup || !settingField) return;
    
    const settingValue = settingField.value.toLowerCase();
    const showOutdoorConditional = settingValue.includes("outdoor");
    outdoorGroup.hidden = !showOutdoorConditional;
  };

  // Set up event listeners
  if (eventType) {
    eventType.addEventListener("change", updateConditionalFields);
    updateConditionalFields();
  }

  if (settingField) {
    settingField.addEventListener("change", updateOutdoorConditional);
    updateOutdoorConditional();
  }

  // Handle estimate prefilling from query parameter
  if (estimateField && query.has("estimate")) {
    const estimate = Number(query.get("estimate"));
    estimateField.value = Number.isFinite(estimate) ? `$${estimate.toLocaleString("en-US")}` : query.get("estimate");
  }

  // Set source page field
  if (sourcePageField) {
    sourcePageField.value = query.get("source") || document.referrer || "Direct visit";
  }

  // Handle form submission
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const endpoint = contactForm.dataset.formspreeEndpoint;

    if (!endpoint) {
      contactFeedback.textContent = "The booking form is temporarily unavailable. Please try again later.";
      return;
    }

    await requestedShowPromise;

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
        submitButton.textContent = "Check Availability";
      }
    }
  });
}

async function populateRequestedShow({ requestedShow, selectedShowField, selectedShowSummary }) {
  if (!requestedShow || !selectedShowField || !selectedShowSummary) return null;

  try {
    const response = await fetch(window.resolveSitePath("/data/signature-shows.json"));
    if (!response.ok) return null;

    const data = await response.json();
    const show = Array.isArray(data.shows)
      ? data.shows.find(candidate => candidate.slug === requestedShow)
      : null;

    if (!show) return null;

    selectedShowField.value = show.title;
    selectedShowField.disabled = false;
    selectedShowSummary.textContent = `Interested in: ${show.title}`;
    selectedShowSummary.hidden = false;
    return show;
  } catch {
    return null;
  }
}
