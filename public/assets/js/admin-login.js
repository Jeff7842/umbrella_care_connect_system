(() => {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return "";
  }

  function showToast(type, title, text, duration = 4500) {
    const toastStack = document.getElementById("toastStack");
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

  function initAdminSigninPage() {
    const form = document.getElementById("adminSigninForm");
    const loginInput = document.getElementById("admin_login");
    const passwordInput = document.getElementById("admin_password");
    const togglePassword = document.getElementById("toggleAdminPassword");
    const button = document.getElementById("adminSigninBtn");
    const loader = document.getElementById("adminSigninLoader");
    const btnText = button?.querySelector(".btn-text");

    if (!form || !loginInput || !passwordInput || !button) return;

    function setLoading(isLoading) {
      button.disabled = isLoading;
      if (btnText) {
        btnText.textContent = isLoading ? "Checking Access..." : "Authorize Access";
      }
      if (loader) {
        loader.classList.toggle("show", isLoading);
      }
    }

    if (togglePassword) {
      togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePassword.classList.toggle("fa-eye", !isPassword);
        togglePassword.classList.toggle("fa-eye-slash", isPassword);
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const payload = {
        login: loginInput.value.trim(),
        password: passwordInput.value,
      };

      if (!payload.login || !payload.password) {
        showToast("error", "Missing credentials", "Enter your admin username and admin key.");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/admin-auth/signin/request-otp/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Unable to authorize access.");
        }

        sessionStorage.setItem("adminOtpRequestToken", data.otp_request_token || "");
        sessionStorage.setItem("adminLoginValue", payload.login);

        showToast("success", "OTP sent", "Verification code sent to the admin email.");
        setTimeout(() => {
          window.location.href = "/admin-otp/";
        }, 700);
      } catch (error) {
        showToast("error", "Authorization failed", error.message || "Unable to continue.");
      } finally {
        setLoading(false);
      }
    });
  }

  function initAdminOtpPage() {
    const form = document.getElementById("adminOtpForm");
    const digits = Array.from(document.querySelectorAll(".otp-digit"));
    const resendBtn = document.getElementById("adminOtpResendBtn");
    const timerEl = document.getElementById("adminOtpTimer");

    if (!form || !digits.length || !resendBtn || !timerEl) return;

    let timerInterval = null;
    let expiresAt = Date.now() + 15 * 60 * 1000;

    function renderTimer() {
      const diff = Math.max(0, expiresAt - Date.now());
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      timerEl.textContent = `Expires in ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      if (diff <= 0 && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        showToast("error", "OTP expired", "The admin verification code expired. Resend a new one.");
      }
    }

    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      expiresAt = Date.now() + 15 * 60 * 1000;
      renderTimer();
      timerInterval = setInterval(renderTimer, 1000);
    }

    function getCode() {
      return digits.map((input) => input.value.trim()).join("");
    }

    digits.forEach((input, index) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 1);
        if (input.value && digits[index + 1]) {
          digits[index + 1].focus();
        }
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && digits[index - 1]) {
          digits[index - 1].focus();
        }
        if (event.key === "ArrowLeft" && digits[index - 1]) {
          digits[index - 1].focus();
        }
        if (event.key === "ArrowRight" && digits[index + 1]) {
          digits[index + 1].focus();
        }
      });

      input.addEventListener("paste", (event) => {
        const pasted = (event.clipboardData || window.clipboardData).getData("text");
        const numeric = pasted.replace(/\D/g, "").slice(0, 6).split("");
        if (!numeric.length) return;

        event.preventDefault();
        digits.forEach((el, i) => {
          el.value = numeric[i] || "";
        });

        const targetIndex = Math.min(numeric.length, digits.length - 1);
        digits[targetIndex]?.focus();
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const otpRequestToken = sessionStorage.getItem("adminOtpRequestToken") || "";
      const code = getCode();

      if (!otpRequestToken) {
        showToast("error", "No pending request", "Start from the admin login page first.");
        return;
      }

      if (code.length !== 6) {
        showToast("error", "Invalid code", "Enter the full 6-digit verification code.");
        return;
      }

      try {
        const response = await fetch("/api/admin-auth/signin/verify-otp/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: JSON.stringify({
            otp_request_token: otpRequestToken,
            code,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Could not verify OTP.");
        }

        sessionStorage.removeItem("adminOtpRequestToken");
        sessionStorage.removeItem("adminLoginValue");

        showToast("success", "Verified", "Admin authentication successful.");
        setTimeout(() => {
          window.location.href = data.redirect_url || "/dashboard/";
        }, 800);
      } catch (error) {
        showToast("error", "Verification failed", error.message || "Invalid OTP.");
      }
    });

    resendBtn.addEventListener("click", async () => {
      const login = sessionStorage.getItem("adminLoginValue") || "";
      const otpRequestToken = sessionStorage.getItem("adminOtpRequestToken") || "";

      if (!login) {
        showToast("error", "Missing login", "Go back and re-enter admin credentials.");
        return;
      }

      try {
        const response = await fetch("/api/admin-auth/signin/resend-otp/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: JSON.stringify({
            login,
            otp_request_token: otpRequestToken,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Could not resend admin OTP.");
        }

        sessionStorage.setItem("adminOtpRequestToken", data.otp_request_token || "");
        digits.forEach((input) => {
          input.value = "";
        });
        digits[0]?.focus();
        startTimer();

        showToast("info", "Code resent", "A new admin verification code was sent.");
      } catch (error) {
        showToast("error", "Resend failed", error.message || "Could not resend OTP.");
      }
    });

    startTimer();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAdminSigninPage();
    initAdminOtpPage();
  });
})();