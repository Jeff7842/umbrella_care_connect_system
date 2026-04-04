const API_BASE = "";
const state = {
  activePage: "overview",
  search: "",
  needStatus: "all",
  needSort: "latest",
  selectedAmounts: {}
};

const demoNeeds = [
  {
    id: "n1",
    title: "10 Metallic Beds",
    status: "active",
    date: "23 Sep 2025",
    summary: "The home needs 10 metallic beds to replace broken ones and support more children.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    goal: 100000,
    raised: 57000,
    donors: 3201
  },
  {
    id: "n2",
    title: "Food and Clothes Support",
    status: "urgent",
    date: "01 Oct 2025",
    summary: "Food stock and clothing support is running low and needs urgent replenishment.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    goal: 180000,
    raised: 104000,
    donors: 2142
  },
  {
    id: "n3",
    title: "School Fees Balance",
    status: "active",
    date: "13 Oct 2025",
    summary: "Several children have pending school balances that must be cleared immediately.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    goal: 240000,
    raised: 125000,
    donors: 1807
  },
  {
    id: "n4",
    title: "Medical Care Fund",
    status: "active",
    date: "18 Oct 2025",
    summary: "Routine treatment, checkups and emergency medical support for the children.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
    goal: 150000,
    raised: 66000,
    donors: 941
  },
  {
    id: "n5",
    title: "New Mattresses",
    status: "closed",
    date: "09 Sep 2025",
    summary: "Replacement mattresses for worn-out sleeping areas.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    goal: 90000,
    raised: 90000,
    donors: 602
  },
  {
    id: "n6",
    title: "Water Storage Upgrade",
    status: "active",
    date: "05 Nov 2025",
    summary: "Improve water reliability with larger storage and plumbing adjustments.",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1200&q=80",
    goal: 320000,
    raised: 112000,
    donors: 1330
  }
];

const demoEvents = [
  {
    id: "e1",
    title: "Children Home Visit",
    date: "12 Apr 2026",
    time: "10:00 AM",
    venue: "Umbrella Children Home",
    summary: "Donor visit and live impact briefing with the operations team."
  },
  {
    id: "e2",
    title: "Quarterly Donor Briefing",
    date: "25 Apr 2026",
    time: "2:00 PM",
    venue: "Zoom / Hybrid",
    summary: "Leadership update on priority needs, projects and pledge performance."
  },
  {
    id: "e3",
    title: "Community Food Drive",
    date: "04 May 2026",
    time: "9:00 AM",
    venue: "Nairobi Collection Hub",
    summary: "Mobilisation event for food and hygiene supplies."
  }
];

const demoHistory = [
  {
    date: "04 Apr 2026",
    reference: "#UCC1A9D2",
    type: "Donation",
    towards: "10 Metallic Beds",
    amount: "KES 1,000",
    status: "confirmed"
  },
  {
    date: "18 Mar 2026",
    reference: "#UCC9K3Q2",
    type: "Donation",
    towards: "Food and Clothes Support",
    amount: "KES 5,000",
    status: "received"
  },
  {
    date: "01 Mar 2026",
    reference: "#UCC7M2N9",
    type: "Pledge",
    towards: "School Fees Balance",
    amount: "KES 2,500 / month",
    status: "active"
  },
  {
    date: "16 Feb 2026",
    reference: "#UCC6W0X5",
    type: "Donation",
    towards: "Medical Care Fund",
    amount: "KES 3,000",
    status: "confirmed"
  }
];

const demoPledges = [
  {
    id: "p1",
    title: "School Fees Balance",
    amount: "KES 2,500 / month",
    schedule: "Every month",
    nextCharge: "01 May 2026",
    status: "active"
  },
  {
    id: "p2",
    title: "Food and Clothes Support",
    amount: "KES 1,000 / 2 weeks",
    schedule: "Every 2 weeks",
    nextCharge: "18 Apr 2026",
    status: "active"
  },
  {
    id: "p3",
    title: "Medical Care Fund",
    amount: "KES 1,500 / month",
    schedule: "Cancelled",
    nextCharge: "-",
    status: "cancelled"
  }
];

function formatKES(value) {
  return `KES ${Number(value).toLocaleString("en-KE")}`;
}

function setPage(page) {
  state.activePage = page;

  document.querySelectorAll(".page").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  document.getElementById("pageTitle").textContent =
    page.charAt(0).toUpperCase() + page.slice(1);

  document.getElementById("breadcrumbs").textContent =
    `Home / ${page.charAt(0).toUpperCase() + page.slice(1)}`;
}

function filteredNeeds() {
  let data = [...demoNeeds];

  if (state.search) {
    const q = state.search.toLowerCase();
    data = data.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q)
    );
  }

  if (state.needStatus !== "all") {
    data = data.filter((item) => item.status === state.needStatus);
  }

  if (state.needSort === "goal") {
    data.sort((a, b) => b.goal - a.goal);
  } else if (state.needSort === "progress") {
    data.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
  } else {
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return data;
}

function buildNeedCard(item) {
  const pct = Math.min(100, Math.round((item.raised / item.goal) * 100));
  const selected = state.selectedAmounts[item.id] || "1000";

  return `
    <article class="need-card">
      <div class="need-media">
        <img src="${item.image}" alt="${item.title}">
        <span class="status-pill ${item.status}">${item.status}</span>
      </div>

      <div class="need-body">
        <div class="need-head">
          <h4>${item.title}</h4>
          <div class="need-date">${item.date}</div>
        </div>

        <p class="need-desc">${item.summary}</p>

        <div class="need-meta">
          <div>
            <strong>Amount</strong>
            <span>${formatKES(item.goal)}</span>
          </div>
          <div>
            <strong>Donors</strong>
            <span>${item.donors.toLocaleString("en-KE")}</span>
          </div>
        </div>

        <div class="progress-text">
          <span class="raised">${formatKES(item.raised)}</span>
          out of ${Number(item.goal).toLocaleString("en-KE")}
        </div>

        <div class="progress">
          <span style="width:${pct}%"></span>
        </div>

        <div class="amounts" data-need="${item.id}">
          ${["50", "500", "1000", "custom"]
            .map((v) => `
              <button class="${selected === v ? "active" : ""}" data-amount="${v}">
                ${v === "custom" ? "Custom" : `KES ${Number(v).toLocaleString("en-KE")}`}
              </button>
            `)
            .join("")}
        </div>

        <div class="action-row">
          <button class="pledge" data-action="pledge" data-id="${item.id}">Pledge</button>
          <button class="donate" data-action="donate" data-id="${item.id}">Donate</button>
          <button class="details" data-action="details" data-id="${item.id}">View Details</button>
        </div>
      </div>
    </article>
  `;
}

function renderNeeds() {
  const data = filteredNeeds();

  const markup =
    data.map(buildNeedCard).join("") ||
    `<div class="mini-card"><p>No needs matched the current filters.</p></div>`;

  document.getElementById("overviewNeeds").innerHTML = data
    .slice(0, 3)
    .map(buildNeedCard)
    .join("");

  document.getElementById("needsBoard").innerHTML = markup;
}

function renderEvents() {
  const eventMarkup = demoEvents
    .map((item) => `
      <article class="event-card">
        <h4>${item.title}</h4>
        <p>${item.summary}</p>
        <div class="meta-row">
          <span><i class="bi bi-calendar3"></i> ${item.date}</span>
          <span><i class="bi bi-clock"></i> ${item.time}</span>
          <span><i class="bi bi-geo-alt"></i> ${item.venue}</span>
        </div>
      </article>
    `)
    .join("");

  document.getElementById("eventsBoard").innerHTML = eventMarkup;

  document.getElementById("overviewEvents").innerHTML = demoEvents
    .slice(0, 2)
    .map((item) => `
      <article class="mini-card">
        <h4>${item.title}</h4>
        <p>${item.summary}</p>
        <div class="meta-row">
          <span>${item.date}</span>
          <span>${item.time}</span>
        </div>
      </article>
    `)
    .join("");
}

function renderHistory() {
  document.getElementById("historyTable").innerHTML = demoHistory
    .map((item) => `
      <tr>
        <td>${item.date}</td>
        <td>${item.reference}</td>
        <td>${item.type}</td>
        <td>${item.towards}</td>
        <td>${item.amount}</td>
        <td><span class="badge ${item.status}">${item.status}</span></td>
      </tr>
    `)
    .join("");

  document.getElementById("overviewHistory").innerHTML = demoHistory
    .slice(0, 3)
    .map((item) => `
      <article class="mini-card">
        <h4>${item.type} · ${item.amount}</h4>
        <p>${item.towards}</p>
        <div class="meta-row">
          <span>${item.date}</span>
          <span>${item.reference}</span>
          <span class="badge ${item.status}">${item.status}</span>
        </div>
      </article>
    `)
    .join("");
}

function renderPledges() {
  document.getElementById("activePledges").innerHTML = demoPledges
    .filter((x) => x.status === "active")
    .map((item) => `
      <article class="pledge-card">
        <h4>${item.title}</h4>
        <p>${item.amount}</p>
        <div class="meta-row">
          <span>${item.schedule}</span>
          <span>Next: ${item.nextCharge}</span>
          <span class="badge active">${item.status}</span>
        </div>
      </article>
    `)
    .join("");

  document.getElementById("pastPledges").innerHTML = demoPledges
    .filter((x) => x.status !== "active")
    .map((item) => `
      <article class="pledge-card">
        <h4>${item.title}</h4>
        <p>${item.amount}</p>
        <div class="meta-row">
          <span>${item.schedule}</span>
          <span>${item.nextCharge}</span>
          <span class="badge ${item.status}">${item.status}</span>
        </div>
      </article>
    `)
    .join("");
}

function renderStats() {
  const total = 1000 + 5000 + 3000;

  document.getElementById("statTotalDonated").textContent = formatKES(total);
  document.getElementById("statActivePledges").textContent =
    demoPledges.filter((x) => x.status === "active").length;
  document.getElementById("statNeedsSupported").textContent =
    new Set(demoHistory.map((x) => x.towards)).size;
  document.getElementById("statUpcomingEvents").textContent = demoEvents.length;
}

function openModal(html) {
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("actionModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("actionModal").classList.add("hidden");
}

function findNeed(id) {
  return demoNeeds.find((x) => x.id === id);
}

function handleNeedAction(action, id) {
  const need = findNeed(id);
  if (!need) return;

  const amount = state.selectedAmounts[id] || "1000";

  if (action === "details") {
    openModal(`
      <h3>${need.title}</h3>
      <p style="color:var(--muted);line-height:1.8;">${need.summary}</p>
      <div class="meta-row">
        <span>Goal: ${formatKES(need.goal)}</span>
        <span>Raised: ${formatKES(need.raised)}</span>
        <span>Donors: ${need.donors.toLocaleString("en-KE")}</span>
      </div>
      <div class="modal-actions">
        <button class="primary-btn" onclick="handleNeedAction('donate','${id}')">Donate</button>
        <button class="ghost-btn" onclick="handleNeedAction('pledge','${id}')">Pledge</button>
      </div>
    `);
    return;
  }

  if (action === "donate") {
    openModal(`
      <h3>Donate to ${need.title}</h3>
      <p style="color:var(--muted);line-height:1.8;">
        Selected amount: ${amount === "custom" ? "Custom amount" : `KES ${Number(amount).toLocaleString("en-KE")}`}
      </p>
      <div class="modal-actions">
        <input class="input" placeholder="M-Pesa phone / card reference">
        <button class="primary-btn" onclick="closeModal()">Submit donation</button>
      </div>
    `);
    return;
  }

  openModal(`
    <h3>Create pledge for ${need.title}</h3>
    <p style="color:var(--muted);line-height:1.8;">
      Preset amount: ${amount === "custom" ? "Custom amount" : `KES ${Number(amount).toLocaleString("en-KE")}`}
    </p>
    <div style="display:grid;gap:12px">
      <select class="input">
        <option>Every 2 days</option>
        <option>Every 3 days</option>
        <option>Every 2 weeks</option>
        <option>Every 1 month</option>
        <option>Every 2 months</option>
      </select>
      <input class="input" type="date">
      <button class="primary-btn" onclick="closeModal()">Save pledge</button>
    </div>
  `);
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => setPage(btn.dataset.page));
  });

  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => setPage(btn.dataset.go));
  });

  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "donor-dashboard-theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
  });

  document.getElementById("globalSearch").addEventListener("input", (e) => {
    state.search = e.target.value.trim();
    renderNeeds();
  });

  document.getElementById("needStatusFilter").addEventListener("change", (e) => {
    state.needStatus = e.target.value;
    renderNeeds();
  });

  document.getElementById("needSortFilter").addEventListener("change", (e) => {
    state.needSort = e.target.value;
    renderNeeds();
  });

  document.body.addEventListener("click", (e) => {
    const amountBtn = e.target.closest(".amounts button");
    if (amountBtn) {
      const wrap = amountBtn.closest(".amounts");
      const needId = wrap.dataset.need;
      state.selectedAmounts[needId] = amountBtn.dataset.amount;
      renderNeeds();
      return;
    }

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      handleNeedAction(actionBtn.dataset.action, actionBtn.dataset.id);
    }
  });

  document.getElementById("closeModal").addEventListener("click", closeModal);

  document.getElementById("actionModal").addEventListener("click", (e) => {
    if (e.target.id === "actionModal") {
      closeModal();
    }
  });
}

function initTheme() {
  if (localStorage.getItem("donor-dashboard-theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
}

function init() {
  initTheme();
  renderStats();
  renderEvents();
  renderHistory();
  renderPledges();
  renderNeeds();
  bindEvents();
}

init();