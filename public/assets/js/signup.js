document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const password = document.getElementById("signup_password");
  const confirmPassword = document.getElementById("confirm_password");
  const roleInput = document.getElementById("role");
  const roleButtons = Array.from(document.querySelectorAll(".role-switch__btn"));
  const volunteerPanel = document.getElementById("volunteerPanel");
  const donorPanel = document.getElementById("donorPanel");
  const countrySelect = document.getElementById("country");
  const citySelect = document.getElementById("city");
  const signupSubmitBtn = document.getElementById("signupSubmitBtn");
  const verifyScreen = document.getElementById("verifyScreen");
  const verifyEmailText = document.getElementById("verifyEmailText");
  const emailVerifyForm = document.getElementById("emailVerifyForm");
  const resendVerifyOtpBtn = document.getElementById("resendVerifyOtpBtn");
  const verifyTimer = document.getElementById("verifyTimer");
  const verifyOtpDigits = Array.from(document.querySelectorAll("#verifyScreen .otp-digit"));
  const toastStack = document.getElementById("toastStack");

  let pendingVerifyToken = null;
  let pendingVerifyEmail = null;
  let verifyInterval = null;
  let verifyExpiresAt = null;

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return "";
  }

  function showToast(type, title, text, duration = 4500) {
    if (!toastStack) return;

    const currentToasts = toastStack.querySelectorAll(".toast");
    if (currentToasts.length >= 10) currentToasts[0].remove();

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <div class="toast__title">${title}</div>
      <div class="toast__text">${text}</div>
      <div class="toast__bar" style="animation-duration:${duration}ms"></div>
    `;
    toastStack.appendChild(toast);

    setTimeout(() => toast.remove(), duration);
  }

  function setButtonLoading(button, loading, loadingText, defaultText) {
    if (!button) return;
    const btnText = button.querySelector(".btn-text");
    const btnLoader = button.querySelector(".btn-loader");

    button.disabled = loading;
    if (btnText) btnText.textContent = loading ? loadingText : defaultText;
    if (btnLoader) btnLoader.classList.toggle("hidden", !loading);
  }

  function validatePasswords() {
    if (confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("Passwords do not match.");
    } else {
      confirmPassword.setCustomValidity("");
    }
  }

  password?.addEventListener("input", validatePasswords);
  confirmPassword?.addEventListener("input", validatePasswords);

  function setRole(role) {
    roleInput.value = role;

    roleButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.role === role);
    });

    volunteerPanel.classList.toggle("hidden", role !== "volunteer");
    donorPanel.classList.toggle("hidden", role !== "donor");
  }

  roleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      setRole(btn.dataset.role);
    });
  });

  setRole("volunteer");

  async function loadCountries() {
    try {
      countrySelect.innerHTML = `<option value="">Loading countries...</option>`;

      const response = await fetch("https://restcountries.com/v3.1/all?fields=name");
      const countries = await response.json();

      const sorted = countries
        .map((country) => country?.name?.common)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      countrySelect.innerHTML = `<option value="">Select country</option>`;
      sorted.forEach((countryName) => {
        const option = document.createElement("option");
        option.value = countryName;
        option.textContent = countryName;
        countrySelect.appendChild(option);
      });
    } catch (error) {
      countrySelect.innerHTML = `<option value="">Could not load countries</option>`;
      showToast("error", "Countries unavailable", "Could not load country list.");
    }
  }

  async function loadCities(countryName) {
    citySelect.innerHTML = `<option value="">Loading cities...</option>`;

    try {
      const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ country: countryName })
      });

      const data = await response.json();
      const cities = Array.isArray(data?.data) ? data.data : [];

      citySelect.innerHTML = `<option value="">Select city</option>`;

      cities.sort((a, b) => a.localeCompare(b)).forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });

      if (!cities.length) {
        citySelect.innerHTML = `<option value="">No cities found</option>`;
      }
    } catch (error) {
      citySelect.innerHTML = `<option value="">Could not load cities</option>`;
      showToast("error", "Cities unavailable", "Could not load cities for that country.");
    }
  }

  countrySelect?.addEventListener("change", function () {
    const selectedCountry = this.value;
    if (!selectedCountry) {
      citySelect.innerHTML = `<option value="">Select country first</option>`;
      return;
    }
    loadCities(selectedCountry);
  });

  function collectCheckboxValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
  }

  function collectFormPayload() {
    const formData = new FormData(signupForm);
    const role = formData.get("role");

    const payload = {
      first_name: (formData.get("first_name") || "").toString().trim(),
      last_name: (formData.get("last_name") || "").toString().trim(),
      username: (formData.get("username") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
      country: (formData.get("country") || "").toString().trim(),
      city: (formData.get("city") || "").toString().trim(),
      gender: (formData.get("gender") || "").toString().trim(),
      password: (formData.get("password") || "").toString(),
      confirm_password: (formData.get("confirm_password") || "").toString(),
      role,
      newsletter: !!formData.get("newsletter"),
      terms: !!formData.get("terms"),
    };

    if (role === "volunteer") {
      payload.volunteer_profile = {
        skills: (formData.get("skills") || "").toString().trim(),
        availability: collectCheckboxValues("availability"),
        areas_of_interest: collectCheckboxValues("areas_of_interest"),
      };
    }

    if (role === "donor") {
      payload.donor_profile = {
        donor_type: (formData.get("donor_type") || "").toString().trim(),
        donation_preference: (formData.get("donation_preference") || "").toString().trim(),
        donor_note: (formData.get("donor_note") || "").toString().trim(),
      };
    }

    return payload;
  }

  function stopVerifyTimer() {
    if (verifyInterval) clearInterval(verifyInterval);
    verifyInterval = null;
  }

  function startVerifyTimer(expiresAtIso) {
    verifyExpiresAt = new Date(expiresAtIso).getTime();
    stopVerifyTimer();

    function render() {
      const diff = Math.max(0, verifyExpiresAt - Date.now());
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      verifyTimer.textContent = `Expires in ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      if (diff <= 0) {
        stopVerifyTimer();
        showToast("error", "Code expired", "Email verification OTP expired. Resend a new one.");
      }
    }

    render();
    verifyInterval = setInterval(render, 1000);
  }

  function getVerifyCode() {
    return verifyOtpDigits.map((input) => input.value.trim()).join("");
  }

  verifyOtpDigits.forEach((input, index) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 1);
      if (this.value && verifyOtpDigits[index + 1]) verifyOtpDigits[index + 1].focus();
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Backspace" && !this.value && verifyOtpDigits[index - 1]) {
        verifyOtpDigits[index - 1].focus();
      }
    });

    input.addEventListener("paste", function (event) {
      const pasted = (event.clipboardData || window.clipboardData).getData("text");
      const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");
      if (!digits.length) return;
      event.preventDefault();
      verifyOtpDigits.forEach((el, i) => {
        el.value = digits[i] || "";
      });
    });
  });

  signupForm?.addEventListener("submit", async function (event) {
    event.preventDefault();
    validatePasswords();

    if (!signupForm.checkValidity()) {
      signupForm.reportValidity();
      return;
    }

    const payload = collectFormPayload();

    if (!payload.terms) {
      showToast("error", "Terms required", "You must accept the terms to continue.");
      return;
    }

    setButtonLoading(signupSubmitBtn, true, "Creating account...", "Create account");

    try {
      const response = await fetch("/api/auth/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Sign up failed.");
      }

      pendingVerifyToken = data.otp_request_token;
      pendingVerifyEmail = payload.email;

      signupForm.classList.add("hidden");
      document.getElementById("roleSwitch")?.classList.add("hidden");
      verifyScreen.classList.remove("hidden");
      verifyEmailText.textContent = data.message || `We sent a 6-digit code to ${payload.email}. Verify your email to activate access.`;
      startVerifyTimer(data.expires_at);

      showToast("success", "Account created", "Now verify your email to activate the account.");
    } catch (error) {
      showToast("error", "Sign up failed", error.message || "Could not create account.");
    } finally {
      setButtonLoading(signupSubmitBtn, false, "Creating account...", "Create account");
    }
  });

  emailVerifyForm?.addEventListener("submit", async function (event) {
    event.preventDefault();
    const code = getVerifyCode();

    if (code.length !== 6) {
      showToast("error", "Invalid code", "Enter the full 6-digit email verification code.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup/verify-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          otp_request_token: pendingVerifyToken,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Email verification failed.");
      }

      showToast("success", "Email verified", "Your account is now verified. You can sign in.");
      setTimeout(() => {
        window.location.href = data.redirect_url || "/signin/";
      }, 1200);
    } catch (error) {
      showToast("error", "Verification failed", error.message || "Could not verify email.");
    }
  });

  resendVerifyOtpBtn?.addEventListener("click", async function () {
    if (!pendingVerifyEmail) {
      showToast("error", "Cannot resend", "No pending email verification found.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup/resend-verification-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          email: pendingVerifyEmail,
          otp_request_token: pendingVerifyToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Could not resend verification code.");
      }

      pendingVerifyToken = data.otp_request_token;
      startVerifyTimer(data.expires_at);
      verifyOtpDigits.forEach((input) => (input.value = ""));
      if (verifyOtpDigits[0]) verifyOtpDigits[0].focus();

      showToast("info", "Code resent", "A new verification code was sent.");
    } catch (error) {
      showToast("error", "Resend failed", error.message || "Could not resend code.");
    }
  });

  loadCountries();
});