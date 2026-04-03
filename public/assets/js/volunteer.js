// volunteer.js
const countySelect = document.getElementById("county");
const uploadInput = document.getElementById("passport_photo");
const uploadPreview = document.getElementById("uploadPreview");
const activityGrid = document.getElementById("activityGrid");
const daysWrap = document.getElementById("daysWrap");
const activityInput = document.getElementById("activity_id");
const volunteerForm = document.getElementById("volunteerForm");
const submitBtn = document.getElementById("submitBtn");
const successModal = document.getElementById("successModal");
const errorModal = document.getElementById("errorModal");
const errorText = document.getElementById("errorText");

const API_BASE = "http://127.0.0.1:8000/api"; // change this to your Python backend base URL

const fallbackCounties = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita/Taveta","Garissa","Wajir","Mandera",
  "Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua",
  "Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
  "Uasin Gishu","Elgeyo/Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado",
  "Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay",
  "Migori","Kisii","Nyamira","Nairobi"
];

const activities = [
  {
    id: "cleanup_drive",
    title: "Community Cleanup",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    available_days: ["Monday", "Wednesday", "Saturday"]
  },
  {
    id: "food_support",
    title: "Food Distribution",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    available_days: ["Tuesday", "Thursday", "Friday"]
  },
  {
    id: "child_care",
    title: "Child Support",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
    available_days: ["Monday", "Friday", "Sunday"]
  },
  {
    id: "medical_outreach",
    title: "Medical Outreach",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    available_days: ["Wednesday", "Saturday"]
  },
  {
    id: "education_support",
    title: "Education Support",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    available_days: ["Tuesday", "Thursday", "Saturday"]
  },
  {
    id: "shelter_support",
    title: "Shelter Support",
    image: "https://images.unsplash.com/photo-1469571486292-b53601020f06?auto=format&fit=crop&w=1200&q=80",
    available_days: ["Friday", "Saturday", "Sunday"]
  }
];

function updateStepIndicators(activeStep) {
  document.querySelectorAll("[data-step-indicator]").forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.stepIndicator) === activeStep);
  });
}

function goToStep(step) {
  document.querySelectorAll(".form-step").forEach((section) => {
    section.classList.toggle("active", Number(section.dataset.step) === step);
  });
  updateStepIndicators(step);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateStep(step) {
  const currentStep = document.querySelector(`.form-step[data-step="${step}"]`);
  if (!currentStep) return false;

  const requiredFields = currentStep.querySelectorAll("[required]");
  for (const field of requiredFields) {
    if (field.type === "file") {
      if (!field.files || !field.files.length) {
        field.focus();
        return false;
      }
    } else if (!field.value.trim()) {
      field.focus();
      field.reportValidity();
      return false;
    }
  }

  if (step === 2 && !activityInput.value) {
    showError("Please select a participation area.");
    return false;
  }

  if (step === 3) {
    const selectedDays = document.querySelectorAll('input[name="available_days"]:checked');
    if (!selectedDays.length) {
      showError("Please select at least one available day.");
      return false;
    }
  }

  return true;
}

async function loadCounties() {
  countySelect.innerHTML = `<option value="">Loading counties...</option>`;

  try {
    const response = await fetch("https://kenyan-counties.vercel.app/api/counties");
    if (!response.ok) throw new Error("Failed to load counties");

    const data = await response.json();
    const counties = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : fallbackCounties;

    renderCountyOptions(
      counties.map((item) => typeof item === "string" ? item : item.name).filter(Boolean)
    );
  } catch (error) {
    renderCountyOptions(fallbackCounties);
  }
}

function renderCountyOptions(counties) {
  countySelect.innerHTML = `<option value="">Select county</option>`;
  counties.forEach((county) => {
    const option = document.createElement("option");
    option.value = county;
    option.textContent = county;
    countySelect.appendChild(option);
  });
}

function renderActivities() {
  activityGrid.innerHTML = activities.map((activity) => `
    <article class="activity-card" data-activity-id="${activity.id}">
      <img src="${activity.image}" alt="${activity.title}">
      <div class="activity-overlay"></div>
      <div class="activity-title">${activity.title}</div>
    </article>
  `).join("");

  document.querySelectorAll(".activity-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".activity-card").forEach((item) => item.classList.remove("selected"));
      card.classList.add("selected");

      const activityId = card.dataset.activityId;
      activityInput.value = activityId;

      const selectedActivity = activities.find((item) => item.id === activityId);
      renderDays(selectedActivity?.available_days || []);
    });
  });
}

function renderDays(days) {
  if (!days.length) {
    daysWrap.innerHTML = `<p class="empty-days">No days available for this activity.</p>`;
    return;
  }

  daysWrap.innerHTML = days.map((day, index) => `
    <label class="day-pill">
      <input type="checkbox" name="available_days" value="${day}" ${index === 0 ? "" : ""}>
      <span>${day}</span>
    </label>
  `).join("");
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.querySelector(".btn-text").classList.toggle("hidden", isLoading);
  submitBtn.querySelector(".btn-loader").classList.toggle("hidden", !isLoading);
}

function showSuccess() {
  successModal.classList.remove("hidden");
}

function showError(message) {
  errorText.textContent = message || "Something went wrong while saving the application.";
  errorModal.classList.remove("hidden");
}

function closeModals() {
  successModal.classList.add("hidden");
  errorModal.classList.add("hidden");
}

uploadInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    uploadPreview.innerHTML = `<span>Upload a passport photo</span>`;
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadPreview.innerHTML = `<img src="${e.target.result}" alt="Passport preview">`;
  };
  reader.readAsDataURL(file);
});

document.querySelectorAll("[data-next-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStep = Number(button.dataset.nextStep);
    const currentStep = nextStep - 1;
    if (!validateStep(currentStep)) return;
    goToStep(nextStep);
  });
});

document.querySelectorAll("[data-prev-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const prevStep = Number(button.dataset.prevStep);
    goToStep(prevStep);
  });
});

document.querySelectorAll(".modal-close").forEach((button) => {
  button.addEventListener("click", closeModals);
});

volunteerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateStep(3)) return;

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("first_name", document.getElementById("first_name").value.trim());
    formData.append("last_name", document.getElementById("last_name").value.trim());
    formData.append("phone", document.getElementById("phone").value.trim());
    formData.append("email", document.getElementById("email").value.trim());
    formData.append("county", document.getElementById("county").value);
    formData.append("id_passport", document.getElementById("id_passport").value.trim());
    formData.append("activity_id", activityInput.value);

    const passportPhoto = document.getElementById("passport_photo").files?.[0];
    if (passportPhoto) {
      formData.append("passport_photo", passportPhoto);
    }

    const days = [...document.querySelectorAll('input[name="available_days"]:checked')].map(input => input.value);
    days.forEach((day) => formData.append("available_days[]", day));

    const response = await fetch(`${API_BASE}/volunteer-applications`, {
      method: "POST",
      body: formData
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result?.message || "Failed to save volunteer application.");
    }

    volunteerForm.reset();
    activityInput.value = "";
    uploadPreview.innerHTML = `<span>Upload a passport photo</span>`;
    daysWrap.innerHTML = `<p class="empty-days">Select an activity first.</p>`;
    document.querySelectorAll(".activity-card").forEach((item) => item.classList.remove("selected"));
    goToStep(1);
    showSuccess();
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
});

loadCounties();
renderActivities();