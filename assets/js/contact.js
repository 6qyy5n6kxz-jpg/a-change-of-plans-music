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

  // Handle Signature Show prefilling from query parameter
  const requestedShow = query.get("show") || "";
  if (requestedShow) {
    let signatureShowField = contactForm.querySelector('select[name="signatureShow"]');
    
    // If the signature show field doesn't exist, create it
    if (!signatureShowField) {
      const performanceFormatField = contactForm.querySelector('select[name="performanceFormat"]');
      if (performanceFormatField && performanceFormatField.parentElement && performanceFormatField.parentElement.tagName === 'LABEL') {
        const performanceLabel = performanceFormatField.parentElement;
        const signatureShowLabel = document.createElement('label');
        signatureShowLabel.className = performanceLabel.className;
        signatureShowLabel.innerHTML = `
          <span>Signature Show</span>
          <select name="signatureShow">
            <option value="">Choose one</option>
            <option>Women of Country</option>
            <option>90s Acoustic Rewind</option>
            <option>Piano Bar Classics</option>
            <option>Songs Everyone Knows</option>
            <option>Americana & Country Roads</option>
            <option>Home for the Holidays</option>
            <option>General A Change Of Plans Performance</option>
            <option>Not sure yet</option>
          </select>
        `;
        performanceLabel.parentNode.insertBefore(signatureShowLabel, performanceLabel);
        signatureShowField = contactForm.querySelector('select[name="signatureShow"]');
      }
    }
    
    // Set the value to the requested show
    if (signatureShowField) {
      const showMap = {
        'women-of-country': 'Women of Country',
        '90s-acoustic-rewind': '90s Acoustic Rewind',
        'piano-bar-classics': 'Piano Bar Classics',
        'songs-everyone-knows': 'Songs Everyone Knows',
        'americana-country-roads': 'Americana & Country Roads',
        'home-for-the-holidays': 'Home for the Holidays'
      };
      const displayValue = showMap[requestedShow] || requestedShow;
      const matchingOption = [...signatureShowField.options].find((option) => option.value === displayValue);
      if (matchingOption) signatureShowField.value = displayValue;
    }
  }

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

