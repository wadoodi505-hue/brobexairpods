(function () {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    const fields = [...form.querySelectorAll("input, select, textarea")];
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
    fields.forEach((field) => {
      field.addEventListener("input", () => clearError(field));
      field.addEventListener("change", () => clearError(field));
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      fields.forEach((field) => {
        clearError(field);
        if (field.required && !field.value.trim()) {
          setError(field, "This field is required.");
          valid = false;
        }
        if (field.name === "reply" && field.value.trim() && field.value.includes("@") && !emailPattern.test(field.value.trim())) {
          setError(field, "Enter a valid email or phone number.");
          valid = false;
        }
      });
      if (!valid) {
        form.querySelector("[aria-invalid='true']")?.focus();
        return;
      }
      const status = form.querySelector(".form-status");
      if (status) {
        status.textContent = "Validated locally. This frontend form does not send or store messages yet — please email brobex.ffx@gmail.com to continue.";
        status.classList.add("show");
      }
      form.reset();
    });
  });

  const newsletter = document.querySelector("[data-newsletter-form]");
  if (newsletter) {
    newsletter.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = newsletter.querySelector("input[type='email']");
      const message = newsletter.querySelector(".form-status");
      if (!input || !emailPattern.test(input.value.trim())) {
        input?.setAttribute("aria-invalid", "true");
        const error = newsletter.querySelector(".field-error");
        if (error) error.textContent = "Enter a valid email address.";
        input?.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      const error = newsletter.querySelector(".field-error");
      if (error) error.textContent = "";
      if (message) {
        message.textContent = "Email validated. Newsletter delivery is not connected on this frontend.";
        message.classList.add("show");
      }
      newsletter.reset();
    });
  }
})();