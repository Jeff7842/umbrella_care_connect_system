document.addEventListener("DOMContentLoaded", function () {
  const signinForm = document.getElementById("signinForm");
  const otpModal = document.getElementById("otpModal");
  const otpModalText = document.getElementById("otpModalText");
  const otpVerifyForm = document.getElementById("otpVerifyForm");
  const resendOtpBtn = document.getElementById("resendOtpBtn");
  const otpTimer = document.getElementById("otpTimer");
  const signinSubmitBtn = document.getElementById("signinSubmitBtn");
  const toastStack = document.getElementById("toastStack");
  const otpDigits = Array.from(document.querySelectorAll("#otpModal .otp-digit"));
  const closeOtpButtons = document.querySelectorAll("[data-close-otp]");

  let pendingOtpToken = null;
  let pendingLoginValue = null;
  let timerInterval = null;
  let otpExpiresAt = null;

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return "";
  }

  function showToast(type, title, text, duration = 4500) {
    if (!toastStack) return;

    const currentToasts = toastStack.querySelectorAll(".toast");
    if (currentToasts.length >= 10) {
      currentToasts[0].remove();
    }

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <div class="toast__title">${title}</div>
      <div class="toast__text">${text}</div>
      <div class="toast__bar" style="animation-duration:${duration}ms"></div>
    `;
    toastStack.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration);
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    const btnText = button.querySelector(".btn-text");
    const btnLoader = button.querySelector(".btn-loader");

    button.disabled = loading;
    if (btnText) btnText.textContent = loading ? "Please wait..." : "Sign in";
    if (btnLoader) btnLoader.classList.toggle("hidden", !loading);
  }

  function openOtpModal() {
    otpModal.classList.remove("hidden");
    otpModal.setAttribute("aria-hidden", "false");
    if (otpDigits[0]) otpDigits[0].focus();
  }

  function closeOtpModal() {
    otpModal.classList.add("hidden");
    otpModal.setAttribute("aria-hidden", "true");
    otpDigits.forEach((input) => (input.value = ""));
    stopTimer();
  }

  function getOtpCode() {
    return otpDigits.map((input) => input.value.trim()).join("");
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function startTimer(expiresAtIso) {
    otpExpiresAt = new Date(expiresAtIso).getTime();
    stopTimer();

    function render() {
      const now = Date.now();
      const diff = Math.max(0, otpExpiresAt - now);
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      otpTimer.textContent = `Expires in ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      if (diff <= 0) {
        stopTimer();
        showToast("error", "Code expired", "Your OTP expired. Click resend to get a new code.");
      }
    }

    render();
    timerInterval = setInterval(render, 1000);
  }

  otpDigits.forEach((input, index) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 1);
      if (this.value && otpDigits[index + 1]) otpDigits[index + 1].focus();
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Backspace" && !this.value && otpDigits[index - 1]) {
        otpDigits[index - 1].focus();
      }
      if (event.key === "ArrowLeft" && otpDigits[index - 1]) otpDigits[index - 1].focus();
      if (event.key === "ArrowRight" && otpDigits[index + 1]) otpDigits[index + 1].focus();
    });

    input.addEventListener("paste", function (event) {
      const pasted = (event.clipboardData || window.clipboardData).getData("text");
      const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");
      if (!digits.length) return;
      event.preventDefault();
      otpDigits.forEach((el, i) => {
        el.value = digits[i] || "";
      });
      const next = otpDigits[Math.min(digits.length, 5)];
      if (next) next.focus();
    });
  });

  closeOtpButtons.forEach((button) => {
    button.addEventListener("click", closeOtpModal);
  });

  signinForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(signinForm);
    const payload = {
      login: (formData.get("login") || "").toString().trim(),
      password: (formData.get("password") || "").toString(),
      remember_me: !!formData.get("remember_me"),
    };

    if (!payload.login || !payload.password) {
      showToast("error", "Missing fields", "Enter your login and password.");
      return;
    }

    pendingLoginValue = payload.login;
    setButtonLoading(signinSubmitBtn, true);

    try {
      const response = await fetch("/api/auth/signin/request-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to start sign in.");
      }

      pendingOtpToken = data.otp_request_token;
      otpModalText.textContent = data.message || "Enter the 6-digit code sent to your email.";
      openOtpModal();
      startTimer(data.expires_at);

      showToast("success", "OTP sent", "We sent a verification code to your email.");
    } catch (error) {
      showToast("error", "Sign in failed", error.message || "Unable to continue.");
    } finally {
      setButtonLoading(signinSubmitBtn, false);
    }
  });

  otpVerifyForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const code = getOtpCode();
    if (code.length !== 6) {
      showToast("error", "Invalid code", "Enter the full 6-digit OTP.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signin/verify-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          otp_request_token: pendingOtpToken,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "OTP verification failed.");
      }

      showToast("success", "Verified", "You are now signed in.");
      window.location.href = data.redirect_url || "/dashboard/";
    } catch (error) {
      showToast("error", "Verification failed", error.message || "Invalid OTP.");
    }
  });

  resendOtpBtn?.addEventListener("click", async function () {
    if (!pendingLoginValue) {
      showToast("error", "Cannot resend", "No sign in attempt found.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signin/resend-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          login: pendingLoginValue,
          otp_request_token: pendingOtpToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Could not resend OTP.");
      }

      pendingOtpToken = data.otp_request_token;
      startTimer(data.expires_at);
      otpDigits.forEach((input) => (input.value = ""));
      if (otpDigits[0]) otpDigits[0].focus();

      showToast("info", "Code resent", "A fresh OTP has been sent.");
    } catch (error) {
      showToast("error", "Resend failed", error.message || "Unable to resend.");
    }
  });
});