const NEEDS_DATA = [
  {
    id: "metallic-beds",
    title: "10 Metallic Beds",
    status: "active",
    date: "23rd September 2025",
    summary: "The orphanage needs 10 beds with the increasing number of children and to replace the old broken beds.",
    description: "Umbrella Children's Home is currently operating with an overstrained sleeping arrangement. Some children are sharing beds while several of the old frames are no longer safe. This need will fund durable metallic double-decker beds, mattresses, transport and installation.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    goal: 100000,
    raised: 57000,
    donors: 3201,
    graph: [5000, 9000, 18000, 27000, 35000, 44000, 57000],
    comments: [
      { name: "Mercy W.", text: "I visited the home and this need is genuine. Please support it." },
      { name: "David K.", text: "Children deserve dignity and proper sleeping space." }
    ],
    updates: [
      "3 old broken beds were removed from the boys' room.",
      "Supplier quotation received for 10 metallic deckers.",
      "Installation can begin immediately once funding is complete."
    ]
  },
  {
    id: "food-clothes",
    title: "Food and Clothes Support",
    status: "urgent",
    date: "01st October 2025",
    summary: "Monthly food stock and clothing support is running low and requires urgent replenishment.",
    description: "This fund goes toward dry food, fresh produce, cooking oil, sugar, bathing soap, winter clothing and basic hygiene support for the children over the next month.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    goal: 180000,
    raised: 104000,
    donors: 2142,
    graph: [14000, 25000, 38000, 61000, 77000, 93000, 104000],
    comments: [
      { name: "Faith N.", text: "This one is urgent. Food stock should never run out." },
      { name: "Anonymous", text: "I am pledging monthly toward this need." }
    ],
    updates: [
      "Rice and maize flour stock dropped below safe monthly threshold.",
      "New clothing request submitted for 28 children.",
      "Kitchen team provided updated consumption figures."
    ]
  },
  {
    id: "school-fees",
    title: "School Fees Balance",
    status: "active",
    date: "13th October 2025",
    summary: "Several children have pending school balances that must be cleared to avoid disruption.",
    description: "The home is raising funds to settle tuition balances, exam levies, stationery gaps and transport support for the new school cycle.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    goal: 240000,
    raised: 125000,
    donors: 1807,
    graph: [20000, 42000, 58000, 72000, 91000, 113000, 125000],
    comments: [
      { name: "Teacher James", text: "Education continuity matters. This is a strong cause." }
    ],
    updates: [
      "Fee statements collected from partner schools.",
      "Priority list created for the most at-risk learners."
    ]
  },
  {
    id: "medical-care",
    title: "Medical Care Fund",
    status: "active",
    date: "18th October 2025",
    summary: "Routine treatment, checkups and emergency medical support fund for the children.",
    description: "This need covers doctor reviews, prescriptions, lab tests, emergency transport and general health support over the next cycle.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
    goal: 150000,
    raised: 66000,
    donors: 941,
    graph: [8000, 12000, 22000, 36000, 49000, 58000, 66000],
    comments: [
      { name: "Dr. Anne", text: "Preventive care saves far more in the long run." }
    ],
    updates: [
      "Clinic budget revised after September treatment cases increased."
    ]
  },
  {
    id: "mattresses",
    title: "New Mattresses",
    status: "closed",
    date: "09th September 2025",
    summary: "Replacement mattresses for worn-out sleeping areas.",
    description: "This need focused on replacing damaged mattresses and upgrading sleeping comfort.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    goal: 90000,
    raised: 90000,
    donors: 602,
    graph: [10000, 18000, 35000, 54000, 70000, 85000, 90000],
    comments: [
      { name: "Sarah", text: "Glad to see this one fully funded." }
    ],
    updates: [
      "Need closed successfully and procurement completed."
    ]
  },
  {
    id: "water-system",
    title: "Water Storage Upgrade",
    status: "active",
    date: "05th November 2025",
    summary: "Improve water reliability with larger storage and plumbing adjustments.",
    description: "This need supports installation of a better water storage system to reduce shortages and improve sanitation reliability.",
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1200&q=80",
    goal: 320000,
    raised: 112000,
    donors: 1330,
    graph: [18000, 26000, 45000, 65000, 83000, 97000, 112000],
    comments: [
      { name: "George", text: "Infrastructure needs are not flashy, but they matter." }
    ],
    updates: [
      "Contractor assessed piping and tank placement options."
    ]
  }
];

const NEEDS_GRID = document.getElementById("needsGrid");
const SEARCH_INPUT = document.getElementById("needSearch");
const STATUS_FILTER = document.getElementById("statusFilter");
const SORT_FILTER = document.getElementById("sortFilter");
const THEME_TOGGLE = document.getElementById("themeToggle");
const GLOBAL_MODAL = document.getElementById("globalModal");
const GLOBAL_MODAL_CARD = document.getElementById("globalModalCard");
const GLOBAL_MODAL_ICON = document.getElementById("globalModalIcon");
const GLOBAL_MODAL_TITLE = document.getElementById("globalModalTitle");
const GLOBAL_MODAL_TEXT = document.getElementById("globalModalText");
const CLOSE_MODAL_BTN = document.getElementById("closeModalBtn");

let currentState = {
  search: "",
  status: "all",
  sort: "latest"
};

function formatKES(value) {
  return `KES ${Number(value).toLocaleString("en-KE")}`;
}

function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  }
  localStorage.setItem("umbrella-needs-theme", theme);
}

function hydrateTheme() {
  const saved = localStorage.getItem("umbrella-needs-theme") || "light";
  setTheme(saved);
}

function openModal(type, title, text) {
  GLOBAL_MODAL_CARD.classList.remove("error");
  GLOBAL_MODAL_ICON.innerHTML = type === "error"
    ? `<i class="bi bi-x-circle"></i>`
    : `<i class="bi bi-check2-circle"></i>`;

  if (type === "error") {
    GLOBAL_MODAL_CARD.classList.add("error");
  }

  GLOBAL_MODAL_TITLE.textContent = title;
  GLOBAL_MODAL_TEXT.textContent = text;
  GLOBAL_MODAL.classList.remove("hidden");
}

function closeModal() {
  GLOBAL_MODAL.classList.add("hidden");
}

function saveNeedSelection(needId, amount) {
  localStorage.setItem("selectedNeedId", needId);
  localStorage.setItem("selectedAmount", String(amount || ""));
}

function getSelectedAmount(card) {
  const checked = card.querySelector('input[name^="amount-"]:checked');
  return checked ? checked.value : "";
}

function filteredNeeds() {
  let data = [...NEEDS_DATA];

  if (currentState.search) {
    const q = currentState.search.toLowerCase();
    data = data.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q)
    );
  }

  if (currentState.status !== "all") {
    data = data.filter(item => item.status === currentState.status);
  }

  switch (currentState.sort) {
    case "target-high":
      data.sort((a, b) => b.goal - a.goal);
      break;
    case "progress-high":
      data.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
      break;
    case "donors-high":
      data.sort((a, b) => b.donors - a.donors);
      break;
    default:
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
  }

  return data;
}

function buildNeedCard(item) {
  const percentage = Math.min(100, Math.round((item.raised / item.goal) * 100));

  return `
    <article class="need-card" data-need-id="${item.id}">
      <div class="need-card-media">
        <img src="${item.image}" alt="${item.title}">
        <span class="need-status-pill">${item.status}</span>
      </div>

      <div class="need-card-body">
        <div class="need-head">
          <h3 class="need-title">${item.title}</h3>
          <div class="need-date">Date: ${item.date}</div>
        </div>

        <p class="need-desc">${item.summary}</p>

        <div class="need-meta">
          <div class="need-meta-block">
            <strong>Amount:</strong>
            <span class="need-meta-highlight">${formatKES(item.goal)}</span>
          </div>

          <div class="need-meta-block">
            <strong>Donors:</strong>
            <span class="need-meta-highlight">${item.donors.toLocaleString()}</span>
          </div>
        </div>

        <div class="need-progress-row">
          <span class="raised">${formatKES(item.raised)}</span> out of ${Number(item.goal).toLocaleString("en-KE")}
        </div>

        <div class="progress-track">
          <div class="progress-fill" style="width:${percentage}%"></div>
        </div>

        <div class="amount-title">Select an amount</div>

        <div class="amount-options">
          <label class="amount-option kes-50">
            <input type="radio" name="amount-${item.id}" value="50">
            <span>KES 50</span>
          </label>

          <label class="amount-option kes-500">
            <input type="radio" name="amount-${item.id}" value="500">
            <span>KES 500</span>
          </label>

          <label class="amount-option kes-1000">
            <input type="radio" name="amount-${item.id}" value="1000" checked>
            <span>KES 1000</span>
          </label>

          <label class="amount-option">
            <input type="radio" name="amount-${item.id}" value="custom">
            <span>Custom</span>
          </label>
        </div>

        <div class="action-row">
          <button class="action-btn btn-pledge" data-action="pledge">Pledge</button>
          <button class="action-btn btn-donate" data-action="donate">Donate</button>
          <button class="action-btn btn-details" data-action="details">View Details</button>
        </div>
      </div>
    </article>
  `;
}

function renderNeeds() {
  const data = filteredNeeds();

  if (!data.length) {
    NEEDS_GRID.innerHTML = `<div class="no-results">No needs matched your search or filters.</div>`;
    return;
  }

  NEEDS_GRID.innerHTML = data.map(buildNeedCard).join("");
}

function handleCardActions(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const card = button.closest(".need-card");
  const needId = card?.dataset.needId;
  const selectedAmount = getSelectedAmount(card);

  if (!needId) {
    openModal("error", "Need not found", "The selected need could not be resolved.");
    return;
  }

  saveNeedSelection(needId, selectedAmount);

  if (button.dataset.action === "pledge") {
    window.location.href = `pledge.html?need=${encodeURIComponent(needId)}`;
    return;
  }

  if (button.dataset.action === "details") {
    window.location.href = `need-details.html?need=${encodeURIComponent(needId)}`;
    return;
  }

  if (button.dataset.action === "donate") {
    if (selectedAmount === "custom") {
      window.location.href = `donate.html?need=${encodeURIComponent(needId)}&mode=custom`;
    } else {
      window.location.href = `donate.html?need=${encodeURIComponent(needId)}&amount=${encodeURIComponent(selectedAmount)}`;
    }
  }
}

function initEvents() {
  SEARCH_INPUT?.addEventListener("input", (e) => {
    currentState.search = e.target.value.trim();
    renderNeeds();
  });

  STATUS_FILTER?.addEventListener("change", (e) => {
    currentState.status = e.target.value;
    renderNeeds();
  });

  SORT_FILTER?.addEventListener("change", (e) => {
    currentState.sort = e.target.value;
    renderNeeds();
  });

  NEEDS_GRID?.addEventListener("click", handleCardActions);

  THEME_TOGGLE?.addEventListener("click", () => {
    const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(next);
  });

  CLOSE_MODAL_BTN?.addEventListener("click", closeModal);
  GLOBAL_MODAL?.addEventListener("click", (e) => {
    if (e.target === GLOBAL_MODAL) closeModal();
  });
}

hydrateTheme();
renderNeeds();
initEvents();

/* Expose for other pages if you decide to share one JS bundle */
window.UMBRELLA_NEEDS = NEEDS_DATA;
window.UMBRELLA_UTILS = { formatKES, openModal };