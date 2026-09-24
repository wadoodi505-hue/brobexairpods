(function () {
  const form = document.querySelector("[data-estimator-form]");
  if (!form) return;
  const result = document.getElementById("estimate-result");
  const price = document.getElementById("estimate-price");
  const setError = (field, message) => {
    field.setAttribute("aria-invalid", "true");
    const output = form.querySelector(`[data-error-for="${field.name}"]`);
    if (output) output.textContent = message;
  };
  const clearError = (field) => {
    field.removeAttribute("aria-invalid");
    const output = form.querySelector(`[data-error-for="${field.name}"]`);
    if (output) output.textContent = "";
  };
  form.querySelectorAll("select").forEach((field) => field.addEventListener("change", () => clearError(field)));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...form.querySelectorAll("select")];
    let valid = true;
    fields.forEach((field) => {
      clearError(field);
      if (!field.value) { setError(field, "Choose an option to continue."); valid = false; }
    });
    if (!valid) return;
    const device = form.elements.device.value;
    const issue = form.elements.issue.value;
    let estimate = "Diagnostic review";
    let turnaround = "Timing confirmed after inspection";
    if (issue === "screen") {
      estimate = device === "iphone" ? "$129–$189" : "$149–$229";
      turnaround = "Indicative range · same-day review";
    } else if (issue === "battery") {
      estimate = "$59–$89";
      turnaround = "Indicative range · short service window";
    } else if (issue === "charging") {
      estimate = "$49–$99";
      turnaround = "Indicative range · diagnostic first";
    } else if (issue === "water") {
      estimate = "$99–$169";
      turnaround = "Indicative range · inspection required";
    }
    if (price) price.textContent = `${estimate} · ${turnaround}`;
    result?.classList.add("show");
    result?.focus();
  });
})();