const dateEl = document.getElementById("currentDate");
  const themeToggle = document.getElementById("themeToggle");

  if (dateEl) {
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      document.body.classList.toggle("light-mode");
    });
  }

  (function () {
  const body = document.body;

  function setTheme(theme) {
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  }

  function wireThemeToggle() {
    document.querySelectorAll('.mode-toggle').forEach(el => {
      if (el.dataset.boundTheme === 'true') return;
      el.dataset.boundTheme = 'true';
      el.addEventListener('click', () => {
        const nextTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
        setTheme(nextTheme);
        localStorage.setItem('umbrellaTheme', nextTheme);
      });
    });
  }

  function showPage(pageName) {
    const pages = document.querySelectorAll('.app-page');
    const navItems = document.querySelectorAll('.admin-sidebar .nav-item[data-page]');

    pages.forEach(page => page.classList.toggle('active', page.dataset.page === pageName));
    navItems.forEach(item => item.classList.toggle('active', item.dataset.page === pageName));

    localStorage.setItem('umbrellaActivePage', pageName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function wireNavigation() {
    document.querySelectorAll('.admin-sidebar .nav-item[data-page]').forEach(item => {
      if (item.dataset.boundNav === 'true') return;
      item.dataset.boundNav = 'true';
      item.addEventListener('click', () => showPage(item.dataset.page));
    });

    document.querySelectorAll('[data-go-page]').forEach(button => {
      if (button.dataset.boundNav === 'true') return;
      button.dataset.boundNav = 'true';
      button.addEventListener('click', () => showPage(button.dataset.goPage));
    });
  }

  function initReportPreview() {
    const reportSelect = document.getElementById('reportType');
    const stat1 = document.getElementById('stat1');
    const stat2 = document.getElementById('stat2');
    const stat3 = document.getElementById('stat3');
    const stat4 = document.getElementById('stat4');
    const stat5 = document.getElementById('stat5');
    const detailBlock = document.getElementById('detailedReportBlock');
    const genReportBtn = document.getElementById('genReportBtn');

    if (!reportSelect) return;

    function updateReportPreview() {
      const type = reportSelect.value;
      if (type === 'Donations report') {
        stat1.innerText = '486'; stat2.innerText = '34'; stat3.innerText = '212'; stat4.innerText = '142'; stat5.innerText = '29';
        detailBlock.innerHTML = `<div><i class="bi bi-cash-stack fs-3 me-2"></i> <strong>Donations summary</strong></div>
          <div class="progress-tag"><i class="bi bi-calendar-week"></i> cash: 312K KES · in-kind: 174 items</div>
          <div class="progress-tag"><i class="bi bi-graph-up-arrow"></i> 23% increase from last month</div>
          <div class="ms-auto"><i class="bi bi-download"></i> export</div>`;
      } else if (type === 'Volunteer & duties') {
        stat1.innerText = '38'; stat2.innerText = '12'; stat3.innerText = '316'; stat4.innerText = '46'; stat5.innerText = '9';
        detailBlock.innerHTML = `<div><i class="bi bi-person-workspace fs-3 me-2"></i> <strong>Volunteer duties · activeness</strong></div>
          <div class="progress-tag"><i class="bi bi-calendar-check"></i> 24 duties scheduled, 19 completed</div>
          <div class="progress-tag"><i class="bi bi-heart-pulse"></i> top volunteer: Mary N. (12 hrs)</div>
          <div class="ms-auto"><i class="bi bi-file-spreadsheet"></i> full log</div>`;
      } else if (type === 'Needs & fulfillment') {
        stat1.innerText = '52'; stat2.innerText = '34'; stat3.innerText = '18'; stat4.innerText = '26'; stat5.innerText = '11';
        detailBlock.innerHTML = `<div><i class="bi bi-box-seam fs-3 me-2"></i> <strong>Needs fulfillment rate</strong></div>
          <div class="progress-tag">Food packs: 78% · Education: 42% · Medical: 90%</div>
          <div class="progress-tag">Most urgent: School uniforms (need 60, got 12)</div>
          <div class="ms-auto"><i class="bi bi-printer"></i> print</div>`;
      } else if (type === 'Donor activeness') {
        stat1.innerText = '210'; stat2.innerText = '148'; stat3.innerText = '62'; stat4.innerText = '87'; stat5.innerText = '13';
        detailBlock.innerHTML = `<div><i class="bi bi-people-fill fs-3 me-2"></i> <strong>Donor engagement</strong></div>
          <div class="progress-tag">Repeat donors: 64% · new donors this month: 28</div>
          <div class="progress-tag">avg donation size: 3,200 KES</div>
          <div class="ms-auto"><i class="bi bi-graph-up"></i> trends</div>`;
      } else {
        stat1.innerText = '—'; stat2.innerText = '—'; stat3.innerText = '—'; stat4.innerText = '—'; stat5.innerText = '—';
        detailBlock.innerHTML = `<div><i class="bi bi-sliders2"></i> select a report type</div>`;
      }
    }

    reportSelect.addEventListener('change', updateReportPreview);
    genReportBtn?.addEventListener('click', function (e) {
      e.preventDefault();
      updateReportPreview();
      alert('Report generated (demo) – check figures updated.');
    });

    updateReportPreview();
  }

  if (localStorage.getItem('umbrellaTheme') === 'dark') setTheme('dark');
  else setTheme('light');

  const startApp = () => {
    wireThemeToggle();
    wireNavigation();
    initReportPreview();
    showPage(localStorage.getItem('umbrellaActivePage') || 'analytics');
  };

  if (customElements.get('sidebar-component')) {
    startApp();
  } else {
    window.addEventListener('DOMContentLoaded', startApp, { once: true });
  }
})();

/* =========================================
   USER MANAGEMENT TABLE - DJANGO INTEGRATION
========================================= */

const DJANGO_USERS_API = "/api/users/"; 
const userTableBody = document.getElementById("userManagementTableBody");
const userSearchInput = document.getElementById("userSearchInput");
const userSortBy = document.getElementById("userSortBy");
const userEntriesInfo = document.getElementById("userEntriesInfo");
const selectAllUsers = document.getElementById("selectAllUsers");
const sortButtons = document.querySelectorAll(".th-sort-btn");

let userState = {
  page: 1,
  pageSize: 10,
  search: "",
  ordering: "-created_at",
};

function getRoleClass(role) {
  const map = {
    admin: "role-admin",
    "super-admin": "role-super-admin",
    staff: "role-staff",
    auditor: "role-auditor",
    communications: "role-communications",
    director: "role-director",
  };
  return map[(role || "").toLowerCase()] || "role-staff";
}

function getStatusClass(status) {
  const map = {
    active: "status-active",
    paused: "status-paused",
    terminated: "status-terminated",
  };
  return map[(status || "").toLowerCase()] || "status-paused";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================
   CHANGE THIS IF YOUR DJANGO FIELD NAMES DIFFER
   Expected backend fields:
   id
   full_name
   first_name
   username
   email
   reg_code
   phone
   role
   status
   profile_photo
   last_seen_human
========================================= */
function renderUsers(users = []) {
  if (!userTableBody) return;

  if (!users.length) {
    userTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center py-4 text-muted">
          No users found.
        </td>
      </tr>
    `;
    return;
  }

  userTableBody.innerHTML = users
    .map((user) => {
      const role = user.role || "staff";
      const status = user.status || "paused";
      const displayName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User";
      const photo = user.profile_photo || "https://i.pravatar.cc/40?img=1";

      return `
        <tr data-user-id="${user.id}">
          <td><input type="checkbox" class="row-check" data-user-id="${user.id}" /></td>
          <td>
            <div class="user-cell-profile">
              <img src="${escapeHtml(photo)}" alt="${escapeHtml(displayName)}" />
              <div>
                <div class="user-name">${escapeHtml(displayName)}</div>
                <div class="user-subtext">${escapeHtml(role)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(user.username || "-")}</td>
          <td>${escapeHtml(user.email || "-")}</td>
          <td><span class="reg-code-badge">${escapeHtml(user.reg_code || "-")}</span></td>
          <td>${escapeHtml(user.phone || "-")}</td>
          <td><span class="role-badge ${getRoleClass(role)}">${escapeHtml(role)}</span></td>
          <td><span class="status-badge ${getStatusClass(status)}">${escapeHtml(status)}</span></td>
          <td class="text-center">${escapeHtml(user.last_seen_human || "-")}</td>
          <td>
            <div class="action-btn-group">
              <button class="table-action-btn edit-btn" title="Edit User" onclick="editUser('${user.id}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="table-action-btn freeze-btn" title="Freeze User" onclick="freezeUser('${user.id}')">
                <i class="bi bi-snow"></i>
              </button>
              <button class="table-action-btn delete-btn" title="Delete User" onclick="deleteUser('${user.id}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function fetchUsers() {
  try {
    /* ================================
       CHANGE THIS URL STRUCTURE
       TO MATCH YOUR DJANGO API
    ================================ */
    const params = new URLSearchParams({
      page: userState.page,
      page_size: userState.pageSize,
      search: userState.search,
      ordering: userState.ordering,
    });

    const response = await fetch(`${DJANGO_USERS_API}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": "Bearer YOUR_TOKEN_HERE"
      },
      credentials: "include", // keep this if using session auth / cookies
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    /* =========================================
       CHANGE THIS TOO IF YOUR DJANGO RESPONSE
       DOES NOT USE:
       {
         results: [],
         count: 128
       }
    ========================================= */
    renderUsers(data.results || []);
    updateEntriesInfo(data.count || 0);
  } catch (error) {
    console.error("User fetch error:", error);
    if (userTableBody) {
      userTableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-4 text-danger">
            Failed to load users.
          </td>
        </tr>
      `;
    }
  }
}

function updateEntriesInfo(total = 0) {
  const start = total === 0 ? 0 : (userState.page - 1) * userState.pageSize + 1;
  const end = Math.min(userState.page * userState.pageSize, total);

  if (userEntriesInfo) {
    userEntriesInfo.textContent = `Showing ${start} to ${end} of ${total} entries`;
  }
}

function mapSortValueToOrdering(value) {
  const map = {
    created_desc: "-created_at",
    created_asc: "created_at",
    name_asc: "full_name",
    name_desc: "-full_name",
    username_asc: "username",
    role_asc: "role",
    status_asc: "status",
  };
  return map[value] || "-created_at";
}

if (userSearchInput) {
  let searchTimer;
  userSearchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      userState.search = e.target.value.trim();
      userState.page = 1;
      fetchUsers();
    }, 350);
  });
}

if (userSortBy) {
  userSortBy.addEventListener("change", (e) => {
    userState.ordering = mapSortValueToOrdering(e.target.value);
    userState.page = 1;
    fetchUsers();
  });
}

sortButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.sort;
    if (!key) return;

    if (userState.ordering === key) {
      userState.ordering = `-${key}`;
    } else {
      userState.ordering = key;
    }

    fetchUsers();
  });
});

if (selectAllUsers) {
  selectAllUsers.addEventListener("change", (e) => {
    document.querySelectorAll(".row-check").forEach((checkbox) => {
      checkbox.checked = e.target.checked;
    });
  });
}

/* =========================================
   CRUD ACTIONS
   CONNECT THESE TO DJANGO ENDPOINTS
========================================= */

async function editUser(userId) {
  console.log("Edit user:", userId);

  // OPEN EDIT MODAL HERE
  // fetch(`/api/users/${userId}/`)
  // then populate form
}

async function freezeUser(userId) {
  const confirmed = confirm("Freeze this user account?");
  if (!confirmed) return;

  try {
    /* =========================================
       CHANGE THIS ENDPOINT TO YOUR DJANGO ROUTE
       Example:
       PATCH /api/users/<id>/freeze/
    ========================================= */
    const response = await fetch(`/api/users/${userId}/freeze/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // "X-CSRFToken": getCSRFToken(),
      },
      credentials: "include",
      body: JSON.stringify({
        status: "paused"
      }),
    });

    if (!response.ok) throw new Error("Freeze failed");

    fetchUsers();
  } catch (error) {
    console.error("Freeze user error:", error);
    alert("Failed to freeze user.");
  }
}

async function deleteUser(userId) {
  const confirmed = confirm("Delete this user permanently?");
  if (!confirmed) return;

  try {
    /* =========================================
       CHANGE THIS TO YOUR DJANGO DELETE ROUTE
       Example:
       DELETE /api/users/<id>/
    ========================================= */
    const response = await fetch(`/api/users/${userId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // "X-CSRFToken": getCSRFToken(),
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Delete failed");

    fetchUsers();
  } catch (error) {
    console.error("Delete user error:", error);
    alert("Failed to delete user.");
  }
}

/* =========================================
   ADD USER BUTTON
========================================= */
const openAddUserBtn = document.getElementById("openAddUserBtn");
if (openAddUserBtn) {
  openAddUserBtn.addEventListener("click", () => {
    console.log("Open add user modal/form");
    // OPEN ADD USER MODAL HERE
    // submit to POST /api/users/
  });
}

/* Initial load */
fetchUsers();

/* =========================================
   MESSAGES PAGE INTERACTION
========================================= */
(function () {
  const contactList = document.getElementById("messagesContactList");
  const emptyState = document.getElementById("messagesEmptyState");
  const chatShell = document.getElementById("messagesChatShell");
  const activeChatName = document.getElementById("activeChatName");
  const activeChatAvatar = document.getElementById("activeChatAvatar");
  const activeChatStatus = document.getElementById("activeChatStatus");
  const searchInput = document.getElementById("messageSearchInput");

  if (!contactList) return;

  function showEmptyState() {
    emptyState?.classList.remove("is-hidden");
    chatShell?.classList.add("is-hidden");
  }

  function showChatState() {
    emptyState?.classList.add("is-hidden");
    chatShell?.classList.remove("is-hidden");
  }

  function activateContact(button) {
    document.querySelectorAll(".message-contact-item").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const img = button.querySelector("img");
    const name = button.querySelector(".message-contact-name");

    if (img && activeChatAvatar) {
      activeChatAvatar.src = img.src;
      activeChatAvatar.alt = img.alt;
    }

    if (name && activeChatName) {
      activeChatName.textContent = name.textContent.trim();
    }

    if (activeChatStatus) {
      activeChatStatus.textContent = "Online now";
    }

    showChatState();
  }

  document.querySelectorAll(".message-contact-item").forEach((button) => {
    button.addEventListener("click", () => activateContact(button));
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll(".message-contact-item");

      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? "" : "none";
      });
    });
  }

  /* 
    IMPORTANT:
    If you want the page to open with no selected account,
    remove the "active" class from all .message-contact-item buttons in HTML.
  */
  const initiallyActive = document.querySelector(".message-contact-item.active");

  if (initiallyActive) {
    activateContact(initiallyActive);
  } else {
    showEmptyState();
  }
})();

/* =========================================
   DONATIONS PAGE INTERACTION
========================================= */
(function () {
  const donationTable = document.getElementById("donationTable");
  const donationTableBody = document.getElementById("donationTableBody");
  const donationSearchInput = document.getElementById("donationSearchInput");
  const donationStatusFilter = document.getElementById("donationStatusFilter");
  const donationMethodFilter = document.getElementById("donationMethodFilter");
  const donationCountryFilter = document.getElementById("donationCountryFilter");
  const donationEntriesInfo = document.getElementById("donationEntriesInfo");
  const donationTabs = document.querySelectorAll(".donation-tab");
  const selectAllDonations = document.getElementById("selectAllDonations");
  const donationExportToggle = document.getElementById("donationExportToggle");
  const donationExportMenu = document.getElementById("donationExportMenu");
  const toggleDonationColumnEditor = document.getElementById("toggleDonationColumnEditor");
  const donationColumnEditor = document.getElementById("donationColumnEditor");
  const applyFrozenColumns = document.getElementById("applyFrozenColumns");
  const markFavoriteBtn = document.getElementById("markFavoriteBtn");
  const sortButtons = document.querySelectorAll(".donation-th-btn");

  if (!donationTable || !donationTableBody) return;

  const donationState = {
    tab: "latest",
    search: "",
    status: "all",
    method: "all",
    country: "all",
    sortKey: "",
    sortDirection: "asc",
    frozenColumns: []
  };

  const allRows = Array.from(donationTableBody.querySelectorAll("tr"));

  function textContentOf(row, key) {
    const target = row.querySelector(`[data-col-key="${key}"]`);
    return (target?.innerText || "").trim().toLowerCase();
  }

  function amountValue(row) {
    const raw = textContentOf(row, "lifetime").replace(/[^0-9.]/g, "");
    return parseFloat(raw || "0");
  }

  function updateEntries() {
    const visibleRows = Array.from(donationTableBody.querySelectorAll("tr")).filter(row => row.style.display !== "none");
    const total = visibleRows.length;
    donationEntriesInfo.textContent = total
      ? `Showing 1 to ${total} of ${total} entries`
      : "Showing 0 to 0 of 0 entries";
  }

  function applyFilters() {
    const search = donationState.search.toLowerCase();
    const status = donationState.status;
    const method = donationState.method;
    const country = donationState.country;
    const tab = donationState.tab;

    allRows.forEach((row) => {
      const donorText = row.innerText.toLowerCase();
      const rowStatus = textContentOf(row, "status");
      const rowMethod = textContentOf(row, "method");
      const rowCountry = textContentOf(row, "country");
      const isFavorite = row.querySelector(".favorite-front")?.classList.contains("active");
      const amount = amountValue(row);

      let visible = true;

      if (search && !donorText.includes(search)) visible = false;
      if (status !== "all" && !rowStatus.includes(status)) visible = false;
      if (method !== "all" && !rowMethod.includes(method)) visible = false;
      if (country !== "all" && !rowCountry.includes(country.toLowerCase())) visible = false;

      if (tab === "favorites" && !isFavorite) visible = false;
      if (tab === "top" && amount < 40) visible = false; // demo rule for top donors in last 30 days

      row.style.display = visible ? "" : "none";
    });

    updateEntries();
  }

  function sortRows(key) {
    const rows = Array.from(donationTableBody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      let aVal = textContentOf(a, key);
      let bVal = textContentOf(b, key);

      if (key === "lifetime" || key === "pledge") {
        aVal = parseFloat(aVal.replace(/[^0-9.]/g, "") || "0");
        bVal = parseFloat(bVal.replace(/[^0-9.]/g, "") || "0");
      }

      if (key === "name") {
        aVal = (a.querySelector(".donor-name-line")?.innerText || "").toLowerCase();
        bVal = (b.querySelector(".donor-name-line")?.innerText || "").toLowerCase();
      }

      if (aVal < bVal) return donationState.sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return donationState.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    rows.forEach(row => donationTableBody.appendChild(row));
  }

  donationSearchInput?.addEventListener("input", (e) => {
    donationState.search = e.target.value.trim();
    applyFilters();
  });

  donationStatusFilter?.addEventListener("change", (e) => {
    donationState.status = e.target.value;
    applyFilters();
  });

  donationMethodFilter?.addEventListener("change", (e) => {
    donationState.method = e.target.value;
    applyFilters();
  });

  donationCountryFilter?.addEventListener("change", (e) => {
    donationState.country = e.target.value;
    applyFilters();
  });

  donationTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      donationTabs.forEach(item => item.classList.remove("active"));
      tab.classList.add("active");
      donationState.tab = tab.dataset.donationTab;
      applyFilters();
    });
  });

  sortButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sortKey;
      if (!key) return;

      if (donationState.sortKey === key) {
        donationState.sortDirection = donationState.sortDirection === "asc" ? "desc" : "asc";
      } else {
        donationState.sortKey = key;
        donationState.sortDirection = "asc";
      }

      sortRows(key);
      applyFilters();
    });
  });

  selectAllDonations?.addEventListener("change", (e) => {
    donationTableBody.querySelectorAll(".donation-row-check").forEach((checkbox) => {
      checkbox.checked = e.target.checked;
    });
  });

  markFavoriteBtn?.addEventListener("click", () => {
    const selectedRows = Array.from(donationTableBody.querySelectorAll("tr")).filter(row => {
      return row.querySelector(".donation-row-check")?.checked;
    });

    selectedRows.forEach((row) => {
      const heart = row.querySelector(".favorite-front");
      if (!heart) return;

      heart.classList.add("active");
      heart.innerHTML = `<i class="bi bi-heart-fill"></i>`;
    });

    applyFilters();
  });

  donationExportToggle?.addEventListener("click", () => {
    donationExportMenu?.classList.toggle("is-hidden");
  });

  document.querySelectorAll("[data-export-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.exportType;
      exportDonationTable(type);
      donationExportMenu?.classList.add("is-hidden");
    });
  });

  toggleDonationColumnEditor?.addEventListener("click", () => {
    donationColumnEditor?.classList.toggle("is-hidden");
  });

  function clearFrozenClasses() {
    donationTable.querySelectorAll(".frozen-col").forEach((el) => {
      el.classList.remove("frozen-col");
      el.style.left = "";
    });
  }

  function applyFrozenColumnLayout() {
    clearFrozenClasses();

    const frozen = Array.from(document.querySelectorAll('[data-freeze-col]:checked')).map(el => el.dataset.freezeCol);
    donationState.frozenColumns = frozen;

    let currentLeft = 308; // 58 for checkbox + 250 donor col

    frozen.forEach((key) => {
      const head = donationTable.querySelector(`thead [data-col-key="${key}"]`);
      const cells = donationTable.querySelectorAll(`tbody [data-col-key="${key}"]`);
      const width = head ? Math.max(head.offsetWidth || 140, 140) : 140;

      if (head) {
        head.classList.add("frozen-col");
        head.style.left = `${currentLeft}px`;
      }

      cells.forEach((cell) => {
        cell.classList.add("frozen-col");
        cell.style.left = `${currentLeft}px`;
      });

      currentLeft += width;
    });
  }

  applyFrozenColumns?.addEventListener("click", () => {
    applyFrozenColumnLayout();
    donationColumnEditor?.classList.add("is-hidden");
  });

  function getVisibleRowsData() {
    const rows = Array.from(donationTableBody.querySelectorAll("tr")).filter(row => row.style.display !== "none");

    return rows.map((row) => ({
      donor: row.querySelector(".donor-name-line")?.innerText || "",
      reference_code: row.querySelector(".donor-ref-line")?.innerText || "",
      email: textContentOf(row, "email"),
      method: textContentOf(row, "method"),
      datetime: textContentOf(row, "datetime"),
      country: textContentOf(row, "country"),
      pledge: textContentOf(row, "pledge"),
      amount: textContentOf(row, "lifetime"),
      status: textContentOf(row, "status"),
      donation_towards: textContentOf(row, "towards"),
      comment: textContentOf(row, "comment")
    }));
  }

  function exportDonationTable(type = "csv") {
    const rows = getVisibleRowsData();
    if (!rows.length) return;

    const headers = [
      "Donor",
      "Reference Code",
      "Email",
      "Method",
      "Date & Time",
      "Country",
      "Pledge",
      "Amount",
      "Status",
      "Donation Towards",
      "Comment"
    ];

    const body = rows.map((row) => [
      row.donor,
      row.reference_code,
      row.email,
      row.method,
      row.datetime,
      row.country,
      row.pledge,
      row.amount,
      row.status,
      row.donation_towards,
      row.comment
    ]);

    if (type === "csv") {
      const csv = [headers, ...body]
        .map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "donations-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (type === "xls") {
      const tableHtml = `
        <table border="1">
          <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
          ${body.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </table>
      `;
      const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "donations-export.xls";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".donation-export-group")) {
      donationExportMenu?.classList.add("is-hidden");
    }

    if (!e.target.closest(".donation-columns-group")) {
      donationColumnEditor?.classList.add("is-hidden");
    }

    const favoriteBtn = e.target.closest(".favorite-front");
    if (favoriteBtn) {
      favoriteBtn.classList.toggle("active");
      favoriteBtn.innerHTML = favoriteBtn.classList.contains("active")
        ? `<i class="bi bi-heart-fill"></i>`
        : `<i class="bi bi-heart"></i>`;
      applyFilters();
    }
  });

  applyFilters();
})();