const API_BASE_URL= /*process.env.API_URL || "http://localhost:8000" || "http://127.0.0.1:8000"*/ "";
//const API_BASE_URL = window.location.origin;

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

const DJANGO_USERS_API = `${API_BASE_URL}/api/users/`; 
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
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
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

async function editUser(userId) {

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/`);
    if (!response.ok) throw new Error("Failed to load user");

    const user = await response.json();

    const first_name = prompt("First name:", user.first_name || "");
    if (first_name === null) return;

    const last_name = prompt("Last name:", user.last_name || "");
    if (last_name === null) return;

    const username = prompt("Username:", user.username || "");
    if (username === null) return;

    const email = prompt("Email:", user.email || "");
    if (email === null) return;

    const phone = prompt("Phone:", user.phone || "");
    if (phone === null) return;

    const role = prompt("Role (admin, super-admin, staff, auditor, communications, director):", user.role || "staff");
    if (role === null) return;

    const status = prompt("Status (active, paused, terminated):", user.status || "paused");
    if (status === null) return;

    const updateResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name,
        last_name,
        username,
        email,
        phone,
        role,
        status,
      }),
    });

    if (!updateResponse.ok) {
      const err = await updateResponse.text();
      throw new Error(err || "Failed to update user");
    }

    fetchUsers();
  } catch (error) {
    console.error("Edit user error:", error);
    alert("Failed to update user.");
  }
}

async function freezeUser(userId) {
  const confirmed = confirm("Freeze this user account?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/freeze/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "paused" }),
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
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Delete failed");

    fetchUsers();
  } catch (error) {
    console.error("Delete user error:", error);
    alert("Failed to delete user.");
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
   NEEDS PAGE - DJANGO INTEGRATION
========================================= */
(function () {
  const DJANGO_NEEDS_API = `${API_BASE_URL}/needs/api/`;

  const needsTableBody = document.getElementById("needsTableBody");
  const needForm = document.getElementById("needForm");
  const needMessageBox = document.getElementById("needMessage");
  const needSearchInput = document.getElementById("needSearchInput");
  const needStatusFilter = document.getElementById("needStatusFilter");
  const needPriorityFilter = document.getElementById("needPriorityFilter");
  const needEntriesInfo = document.getElementById("needEntriesInfo");
  const resetNeedBtn = document.getElementById("resetNeedBtn");

  if (!needsTableBody && !needForm) return;

  const needState = {
    search: "",
    status: "",
    priority: "",
  };

  function getCookie(name) {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
  }

  async function needsRequest(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
        ...(options.headers || {}),
      },
      ...options,
    });

    let data = {};
    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  function showNeedMessage(message, type = "success") {
    if (!needMessageBox) {
      alert(message);
      return;
    }

    needMessageBox.textContent = message;
    needMessageBox.className = `alert alert-${type}`;
    needMessageBox.style.display = "block";

    setTimeout(() => {
      needMessageBox.style.display = "none";
    }, 3000);
  }

  function updateNeedEntriesInfo(total = 0) {
    if (!needEntriesInfo) return;
    needEntriesInfo.textContent = total
      ? `Showing 1 to ${total} of ${total} entries`
      : "Showing 0 to 0 of 0 entries";
  }

  function renderNeeds(needs = []) {
    if (!needsTableBody) return;

    if (!needs.length) {
      needsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">No needs found.</td>
        </tr>
      `;
      updateNeedEntriesInfo(0);
      return;
    }

    needsTableBody.innerHTML = needs.map((need) => `
      <tr data-need-id="${need.id}">
        <td>${escapeHtml(need.title || "-")}</td>
        <td>${escapeHtml(need.category || "-")}</td>
        <td>${escapeHtml(need.quantity_required ?? "-")}</td>
        <td>${escapeHtml(need.quantity_fulfilled ?? "-")}</td>
        <td>${escapeHtml(need.priority || "-")}</td>
        <td>${escapeHtml(need.deadline || "-")}</td>
        <td>${escapeHtml(need.status || "-")}</td>
        <td>
          <div class="action-btn-group">
            <button class="table-action-btn edit-btn" title="Edit Need" onclick="editNeed('${need.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="table-action-btn freeze-btn" title="Close Need" onclick="closeNeed('${need.id}')">
              <i class="bi bi-lock"></i>
            </button>
            <button class="table-action-btn delete-btn" title="Delete Need" onclick="deleteNeed('${need.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    updateNeedEntriesInfo(needs.length);
  }

  async function fetchNeeds() {
  try {
    const params = new URLSearchParams();

    if (needState.search && needState.search.trim()) {
      params.append("search", needState.search.trim());
    }
    if (needState.status) {
      params.append("status", needState.status);
    }
    if (needState.priority) {
      params.append("priority", needState.priority);
    }

    const url = `${DJANGO_NEEDS_API}${params.toString() ? `?${params.toString()}` : ""}`;
    console.log("Fetching needs from:", url);

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
      },
    });

    const rawText = await response.text();
    console.log("Needs raw response:", rawText);

    if (!response.ok) {
      throw new Error(`Failed to fetch needs (${response.status})`);
    }

    const data = rawText ? JSON.parse(rawText) : {};
    renderNeeds(data.results || []);
    updateNeedEntriesInfo(data.count || 0);

  } catch (error) {
    console.error("Needs fetch error:", error);
    showNeedMessage(error.message || "Failed to load needs.", "danger");

    if (needsTableBody) {
      needsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-danger">
            Failed to load needs.
          </td>
        </tr>
      `;
    }
  }
}

  function collectNeedFormData() {
    return {
      title: document.getElementById("needTitle")?.value?.trim() || "",
      description: document.getElementById("needDescription")?.value?.trim() || "",
      category: document.getElementById("needCategory")?.value?.trim() || "",
      quantity_required: parseInt(document.getElementById("needQuantityRequired")?.value || "0", 10),
      quantity_fulfilled: parseInt(document.getElementById("needQuantityFulfilled")?.value || "0", 10),
      priority: document.getElementById("needPriority")?.value || "medium",
      deadline: document.getElementById("needDeadline")?.value || null,
    };
  }

  function resetNeedForm() {
    if (needForm) needForm.reset();

    const needIdField = document.getElementById("needId");
    if (needIdField) needIdField.value = "";

    const submitBtn = document.getElementById("needSubmitBtn");
    if (submitBtn) submitBtn.textContent = "Save Need";
  }

  async function saveNeed(event) {
    event.preventDefault();

    const needId = document.getElementById("needId")?.value;
    const payload = collectNeedFormData();

    try {
      if (needId) {
        await needsRequest(`${DJANGO_NEEDS_API}${needId}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        showNeedMessage("Need updated successfully.");
      } else {
        await needsRequest(DJANGO_NEEDS_API, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showNeedMessage("Need created successfully.");
      }

      resetNeedForm();
      await fetchNeeds();
    } catch (error) {
      console.error("Save need error:", error);
      showNeedMessage(error.message, "danger");
    }
  }

  window.editNeed = async function (needId) {
    try {
      const need = await needsRequest(`${DJANGO_NEEDS_API}${needId}/`, {
        method: "GET",
      });

      document.getElementById("needId").value = need.id || "";
      document.getElementById("needTitle").value = need.title || "";
      document.getElementById("needDescription").value = need.description || "";
      document.getElementById("needCategory").value = need.category || "";
      document.getElementById("needQuantityRequired").value = need.quantity_required ?? "";
      document.getElementById("needQuantityFulfilled").value = need.quantity_fulfilled ?? 0;
      document.getElementById("needPriority").value = need.priority || "medium";
      document.getElementById("needDeadline").value = need.deadline || "";

      const submitBtn = document.getElementById("needSubmitBtn");
      if (submitBtn) submitBtn.textContent = "Update Need";
    } catch (error) {
      console.error("Edit need load error:", error);
      showNeedMessage(error.message, "danger");
    }
  };

  window.deleteNeed = async function (needId) {
    if (!confirm("Delete this need?")) return;

    try {
      await needsRequest(`${DJANGO_NEEDS_API}${needId}/`, {
        method: "DELETE",
      });
      showNeedMessage("Need deleted successfully.");
      await fetchNeeds();
    } catch (error) {
      console.error("Delete need error:", error);
      showNeedMessage(error.message, "danger");
    }
  };

  window.closeNeed = async function (needId) {
    if (!confirm("Close this need?")) return;

    try {
      await needsRequest(`${DJANGO_NEEDS_API}${needId}/close/`, {
        method: "POST",
      });
      showNeedMessage("Need closed successfully.");
      await fetchNeeds();
    } catch (error) {
      console.error("Close need error:", error);
      showNeedMessage(error.message, "danger");
    }
  };

  if (needForm) {
    needForm.addEventListener("submit", saveNeed);
  }

  if (resetNeedBtn) {
    resetNeedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetNeedForm();
    });
  }

  if (needSearchInput) {
    let timer;
    needSearchInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        needState.search = e.target.value.trim();
        fetchNeeds();
      }, 300);
    });
  }

  if (needStatusFilter) {
    needStatusFilter.addEventListener("change", (e) => {
      needState.status = e.target.value;
      fetchNeeds();
    });
  }

  if (needPriorityFilter) {
    needPriorityFilter.addEventListener("change", (e) => {
      needState.priority = e.target.value;
      fetchNeeds();
    });
  }

  fetchNeeds();
})();

/* =========================================
   DONATIONS PAGE - DJANGO INTEGRATION
========================================= */
(function () {
  const DJANGO_DONATIONS_API = `${API_BASE_URL}/donations/api/donations/`;
  const DJANGO_DONATIONS_STATS_API = `${API_BASE_URL}/donations/api/donations/stats/`;

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
  const donationPagination = document.getElementById("donationPagination");

  const donationThisMonthValue = document.getElementById("donationThisMonthValue");
  const donationGoalValue = document.getElementById("donationGoalValue");
  const donationDonorCount = document.getElementById("donationDonorCount");
  const donationAllTimeValue = document.getElementById("donationAllTimeValue");

  if (!donationTable || !donationTableBody) return;

  const donationState = {
    page: 1,
    pageSize: 10,
    tab: "latest",
    search: "",
    status: "all",
    method: "all",
    country: "all",
    ordering: "-created_at",
    frozenColumns: [],
  };

  function getMethodClass(method) {
    const map = {
      mpesa: "method-mpesa",
      paypal: "method-paypal",
      credit_card: "method-card",
      bank_transfer: "method-bank",
      cash: "method-bank",
      in_kind: "method-in-kind",
    };
    return map[(method || "").toLowerCase()] || "method-paypal";
  }

  function getStatusClass(status) {
    const map = {
      pending: "pending",
      confirmed: "paid",
      received: "paid",
      cancelled: "cancled",
    };
    return map[(status || "").toLowerCase()] || "pending";
  }

  function mapSortKeyToOrdering(key) {
    const map = {
      name: "donor_name",
      email: "email",
      method: "payment_method",
      datetime: "created_at",
      country: "country",
      pledge: "pledge_amount",
      lifetime: "amount",
      status: "status",
      towards: "need_title",
      comment: "notes",
    };
    return map[key] || "created_at";
  }

  function updateDonationEntriesInfo(start = 0, end = 0, total = 0) {
    if (!donationEntriesInfo) return;
    donationEntriesInfo.textContent = total
      ? `Showing ${start} to ${end} of ${total} entries`
      : "Showing 0 to 0 of 0 entries";
  }

  function renderDonationPagination(currentPage = 1, numPages = 1) {
    if (!donationPagination) return;

    if (numPages <= 1) {
      donationPagination.innerHTML = "";
      return;
    }

    let html = `
      <button class="donation-page-btn ${currentPage === 1 ? "disabled" : ""}" data-page="${currentPage - 1}">
        Prev
      </button>
    `;

    let dotsAdded = false;

    for (let page = 1; page <= numPages; page++) {
      const shouldShow =
        page === 1 ||
        page === numPages ||
        Math.abs(page - currentPage) <= 1;

      if (shouldShow) {
        dotsAdded = false;
        html += `
          <button class="donation-page-btn ${page === currentPage ? "active" : ""}" data-page="${page}">
            ${page}
          </button>
        `;
      } else if (!dotsAdded) {
        dotsAdded = true;
        html += `<button class="donation-page-btn dots" disabled>...</button>`;
      }
    }

    html += `
      <button class="donation-page-btn ${currentPage === numPages ? "disabled" : ""}" data-page="${currentPage + 1}">
        Next
      </button>
    `;

    donationPagination.innerHTML = html;

    donationPagination.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("disabled")) return;
        donationState.page = Number(btn.dataset.page);
        fetchDonations();
      });
    });
  }

  function renderDonations(donations = []) {
    if (!donations.length) {
      donationTableBody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center py-4 text-muted">
            No donations found.
          </td>
        </tr>
      `;
      return;
    }

    donationTableBody.innerHTML = donations
      .map((donation) => {
        const favoriteClass = donation.is_favorite ? "active" : "";
        const favoriteIcon = donation.is_favorite ? "bi-heart-fill" : "bi-heart";

        return `
          <tr data-donation-id="${donation.id}">
            <td class="sticky-base sticky-order-col">
              <input type="checkbox" class="donation-row-check" data-donation-id="${donation.id}">
            </td>

            <td class="sticky-base sticky-donor-col" data-col-key="donor">
              <div class="donor-cell-wrap">
                <span
                  class="favorite-front ${favoriteClass}"
                  style="cursor:pointer;"
                  onclick="toggleDonationFavorite('${donation.id}', ${!donation.is_favorite})"
                >
                  <i class="bi ${favoriteIcon}"></i>
                </span>

                <img
                  src="${escapeHtml(donation.avatar_url || "https://i.pravatar.cc/44?img=1")}"
                  alt="${escapeHtml(donation.donor_name || "Donor")}"
                />

                <div>
                  <div class="donor-name-line">${escapeHtml(donation.row_label || donation.donor_name || "Donor")}</div>
                  <div class="donor-ref-line">${escapeHtml(donation.reference_code || "-")}</div>
                </div>
              </div>
            </td>

            <td data-col-key="email">${escapeHtml(donation.email || "-")}</td>

            <td data-col-key="method">
              <span class="method-pill ${getMethodClass(donation.method)}">
                ${escapeHtml(donation.method_label || donation.method || "-")}
              </span>
            </td>

            <td data-col-key="datetime">${escapeHtml(donation.datetime || "-")}</td>
            <td data-col-key="country">${escapeHtml(donation.country || "-")}</td>
            <td data-col-key="pledge">${escapeHtml(donation.pledge || "-")}</td>
            <td data-col-key="lifetime">${escapeHtml(donation.amount || "-")}</td>

            <td data-col-key="status">
              <span class="donation-status ${getStatusClass(donation.status)}">
                ${escapeHtml(donation.status_label || donation.status || "-")}
              </span>
            </td>

            <td data-col-key="towards">${escapeHtml(donation.donation_towards || "-")}</td>
            <td data-col-key="comment">${escapeHtml(donation.comment || "-")}</td>

            <td data-col-key="actions">
              <div class="donation-actions gap-2">
                <button class="transparent-view-btn" onclick="viewDonation('${donation.id}')">
                  View details
                </button>

                <button class="table-action-btn edit-btn" title="Edit Donation" onclick="editDonation('${donation.id}')">
                  <i class="bi bi-pencil"></i>
                </button>

                <button class="table-action-btn delete-btn" title="Delete Donation" onclick="deleteDonation('${donation.id}')">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  async function fetchDonations() {
    try {
      const params = new URLSearchParams({
        page: donationState.page,
        page_size: donationState.pageSize,
        search: donationState.search,
        status: donationState.status,
        method: donationState.method,
        country: donationState.country,
        tab: donationState.tab,
        ordering: donationState.ordering,
      });

      const response = await fetch(`${DJANGO_DONATIONS_API}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch donations");
      }

      const data = await response.json();
      renderDonations(data.results || []);
      updateDonationEntriesInfo(data.start || 0, data.end || 0, data.count || 0);
      renderDonationPagination(data.page || 1, data.num_pages || 1);
      applyFrozenColumnLayout();
    } catch (error) {
      console.error("Donation fetch error:", error);
      donationTableBody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center py-4 text-danger">
            Failed to load donations.
          </td>
        </tr>
      `;
    }
  }

  async function fetchDonationStats() {
    try {
      const response = await fetch(DJANGO_DONATIONS_STATS_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch donation stats");
      }

      const data = await response.json();

      if (donationThisMonthValue) donationThisMonthValue.textContent = data.monthly_total || "KES 0.00";
      if (donationGoalValue) donationGoalValue.textContent = data.active_goal_percentage || "0%";
      if (donationDonorCount) donationDonorCount.textContent = data.donor_count ?? 0;
      if (donationAllTimeValue) donationAllTimeValue.textContent = data.all_time_total || "KES 0.00";
    } catch (error) {
      console.error("Donation stats error:", error);
    }
  }

  donationSearchInput?.addEventListener("input", (() => {
    let timer;
    return (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        donationState.search = e.target.value.trim();
        donationState.page = 1;
        fetchDonations();
      }, 350);
    };
  })());

  donationStatusFilter?.addEventListener("change", (e) => {
    donationState.status = e.target.value;
    donationState.page = 1;
    fetchDonations();
  });

  donationMethodFilter?.addEventListener("change", (e) => {
    donationState.method = e.target.value;
    donationState.page = 1;
    fetchDonations();
  });

  donationCountryFilter?.addEventListener("change", (e) => {
    donationState.country = e.target.value;
    donationState.page = 1;
    fetchDonations();
  });

  donationTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      donationTabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      donationState.tab = tab.dataset.donationTab;
      donationState.page = 1;
      fetchDonations();
    });
  });

  sortButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sortKey;
      if (!key) return;

      const mappedKey = mapSortKeyToOrdering(key);

      if (donationState.ordering === mappedKey) {
        donationState.ordering = `-${mappedKey}`;
      } else if (donationState.ordering === `-${mappedKey}`) {
        donationState.ordering = mappedKey;
      } else {
        donationState.ordering = mappedKey;
      }

      donationState.page = 1;
      fetchDonations();
    });
  });

  selectAllDonations?.addEventListener("change", (e) => {
    donationTableBody.querySelectorAll(".donation-row-check").forEach((checkbox) => {
      checkbox.checked = e.target.checked;
    });
  });

  markFavoriteBtn?.addEventListener("click", async () => {
    const selectedIds = Array.from(
      donationTableBody.querySelectorAll(".donation-row-check:checked")
    ).map((checkbox) => checkbox.dataset.donationId);

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${DJANGO_DONATIONS_API}${id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_favorite: true }),
          })
        )
      );

      fetchDonations();
    } catch (error) {
      console.error("Favorite update error:", error);
      alert("Failed to mark favorites.");
    }
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

    const frozen = Array.from(
      document.querySelectorAll('[data-freeze-col]:checked')
    ).map((el) => el.dataset.freezeCol);

    donationState.frozenColumns = frozen;

    let currentLeft = 308;

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

  function textContentOf(row, key) {
    const target = row.querySelector(`[data-col-key="${key}"]`);
    return (target?.innerText || "").trim().toLowerCase();
  }

  function getVisibleRowsData() {
    const rows = Array.from(donationTableBody.querySelectorAll("tr")).filter(
      (row) => row.style.display !== "none"
    );

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
      comment: textContentOf(row, "comment"),
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
      "Comment",
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
      row.comment,
    ]);

    if (type === "csv" || type === "xls") {
      const csv = [headers, ...body]
        .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `donations_export.${type === "xls" ? "xls" : "csv"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  window.toggleDonationFavorite = async function (donationId, makeFavorite = true) {
    try {
      const response = await fetch(`${DJANGO_DONATIONS_API}${donationId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_favorite: makeFavorite }),
      });

      if (!response.ok) {
        throw new Error("Favorite update failed");
      }

      fetchDonations();
    } catch (error) {
      console.error("Favorite toggle error:", error);
      alert("Failed to update favorite.");
    }
  };

  window.viewDonation = async function (donationId) {
    try {
      const response = await fetch(`${DJANGO_DONATIONS_API}${donationId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load donation details");
      }

      const donation = await response.json();

      alert(
        [
          `Donor: ${donation.donor_name || "-"}`,
          `Reference: ${donation.reference_code || "-"}`,
          `Email: ${donation.email || "-"}`,
          `Method: ${donation.method_label || donation.method || "-"}`,
          `Amount: ${donation.amount || "-"}`,
          `Status: ${donation.status_label || donation.status || "-"}`,
          `Towards: ${donation.donation_towards || "-"}`,
          `Comment: ${donation.comment || "-"}`,
        ].join("\\n")
      );
    } catch (error) {
      console.error("View donation error:", error);
      alert("Failed to load donation details.");
    }
  };

  window.editDonation = async function (donationId) {
    try {
      const getResponse = await fetch(`${DJANGO_DONATIONS_API}${donationId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!getResponse.ok) {
        throw new Error("Failed to load donation");
      }

      const donation = await getResponse.json();

      const status = prompt(
        "Status (pending, confirmed, received, cancelled):",
        donation.status || "pending"
      );
      if (status === null) return;

      const notes = prompt("Comment / Notes:", donation.comment === "-" ? "" : donation.comment || "");
      if (notes === null) return;

      const patchResponse = await fetch(`${DJANGO_DONATIONS_API}${donationId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      if (!patchResponse.ok) {
        throw new Error("Failed to update donation");
      }

      fetchDonations();
      fetchDonationStats();
    } catch (error) {
      console.error("Edit donation error:", error);
      alert("Failed to update donation.");
    }
  };

  window.deleteDonation = async function (donationId) {
    const confirmed = confirm("Delete this donation permanently?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${DJANGO_DONATIONS_API}${donationId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete donation");
      }

      fetchDonations();
      fetchDonationStats();
    } catch (error) {
      console.error("Delete donation error:", error);
      alert("Failed to delete donation.");
    }
  };

  fetchDonationStats();
  fetchDonations();
})();

/* =========================================
   STOCK PAGE INTERACTION
========================================= */
/* =========================================
   STOCK PAGE - DJANGO INTEGRATION
========================================= */
(function () {
  const STOCK_ITEMS_API = `${API_BASE_URL}/api/stock/items/`;
  const STOCK_TRANSACTIONS_API = `${API_BASE_URL}/api/stock/transactions/`;

  const stockTable = document.getElementById("stockTable");
  const stockTableBody = document.getElementById("stockTableBody");
  const stockCategoryFilter = document.getElementById("stockCategoryFilter");
  const stockLevelFilter = document.getElementById("stockLevelFilter");
  const stockActiveFilter = document.getElementById("stockActiveFilter");
  const stockEntriesInfo = document.getElementById("stockEntriesInfo");
  const selectAllStock = document.getElementById("selectAllStock");
  const stockSortBtn = document.getElementById("stockSortBtn");
  const stockSortHeaders = document.querySelectorAll(".stock-th-btn");
  const stockTransactionsList = document.getElementById("stockTransactionsList");

  const stockTotalItems = document.getElementById("stockTotalItems");
  const stockRecentlyReceived = document.getElementById("stockRecentlyReceived");
  const stockActiveItems = document.getElementById("stockActiveItems");
  const stockLowAlerts = document.getElementById("stockLowAlerts");

  if (!stockTable || !stockTableBody) return;

  const stockState = {
    category: "all",
    level: "all",
    active: "all",
    sortKey: "",
    sortDirection: "asc",
  };

  function formatNumber(value) {
    const num = Number(value || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getCategoryClass(category) {
    const key = String(category || "general").toLowerCase();
    if (key.includes("food")) return "stock-thumb-rice";
    if (key.includes("education")) return "stock-thumb-books";
    if (key.includes("medical")) return "stock-thumb-medical";
    if (key.includes("construction")) return "stock-thumb-cement";
    if (key.includes("cloth")) return "stock-thumb-clothes";
    return "stock-thumb-general";
  }

  function getInitial(name) {
    return String(name || "S").trim().charAt(0).toUpperCase() || "S";
  }

  function normalizeCategory(category) {
    const key = String(category || "general").toLowerCase();
    if (key.includes("food")) return "food";
    if (key.includes("cloth")) return "clothing";
    if (key.includes("education")) return "education";
    if (key.includes("medical")) return "medical";
    if (key.includes("construction")) return "construction";
    return "general";
  }

  function getStockPercent(quantity, reorderLevel) {
    const qty = Number(quantity || 0);
    const reorder = Number(reorderLevel || 0);

    if (qty <= 0) return 0;
    if (reorder <= 0) return 100;

    const maxReference = reorder * 2;
    return Math.max(5, Math.min(100, Math.round((qty / maxReference) * 100)));
  }

  function getLevelFromValues(quantity, reorder) {
    const qty = Number(quantity || 0);
    const reorderLevel = Number(reorder || 0);

    if (qty <= 0) return "critical";
    if (reorderLevel > 0 && qty <= reorderLevel) return "critical";
    if (reorderLevel > 0 && qty <= reorderLevel * 1.5) return "low";
    return "healthy";
  }

  function getVisibleRows() {
    return Array.from(stockTableBody.querySelectorAll("tr")).filter(
      (row) => row.style.display !== "none"
    );
  }

  function updateStockEntries() {
    const visibleRows = getVisibleRows();
    const total = visibleRows.length;

    if (stockEntriesInfo) {
      stockEntriesInfo.textContent = total
        ? `Showing 1 to ${total} of ${total} entries`
        : "Showing 0 to 0 of 0 entries";
    }
  }

  function wireStockToggles() {
    stockTableBody.querySelectorAll(".stock-toggle input").forEach((toggle) => {
      if (toggle.dataset.bound === "true") return;
      toggle.dataset.bound = "true";

      toggle.addEventListener("change", (e) => {
        const row = e.target.closest("tr");
        if (!row) return;
        row.dataset.active = e.target.checked ? "true" : "false";
        applyStockFilters();
      });
    });
  }

  function renderStockItems(items = []) {
    if (!items.length) {
      stockTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">No stock items found.</td>
        </tr>
      `;
      updateStockEntries();
      return;
    }

    stockTableBody.innerHTML = items
      .map((item) => {
        const quantity = Number(item.current_quantity || 0);
        const reorderLevel = Number(item.reorder_level || 0);
        const percent = getStockPercent(quantity, reorderLevel);
        const category = item.category || "General";
        const isActive = !!item.is_active;

        return `
          <tr
            data-category="${normalizeCategory(category)}"
            data-active="${isActive ? "true" : "false"}"
            data-quantity="${quantity}"
            data-reorder="${reorderLevel}"
          >
            <td><input type="checkbox" class="stock-row-check" /></td>

            <td>
              <div class="stock-item-cell">
                <div class="stock-thumb ${getCategoryClass(category)}">${getInitial(item.name)}</div>
                <div>
                  <div class="stock-item-name">${escapeHtml(item.name || "-")}</div>
                  <div class="stock-item-category">${escapeHtml(category)}</div>
                </div>
              </div>
            </td>

            <td><span class="stock-reg-badge">${escapeHtml(item.reg_code || "-")}</span></td>

            <td>${escapeHtml(formatDate(item.updated_at))}</td>

            <td>
              <div class="stock-level-wrap">
                <div class="stock-level-bar">
                  <span style="width: ${percent}%;"></span>
                </div>
                <div class="stock-level-text">
                  ${escapeHtml(formatNumber(quantity))} / Reorder ${escapeHtml(formatNumber(reorderLevel))}
                </div>
              </div>
            </td>

            <td>${escapeHtml(item.unit || "-")}</td>

            <td>
              <label class="stock-toggle">
                <input type="checkbox" ${isActive ? "checked" : ""} />
                <span></span>
              </label>
            </td>

            <td>
              <div class="stock-action-group">
                <button class="stock-action-btn" title="View">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="stock-action-btn" title="More">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    wireStockToggles();
    updateStockEntries();
  }

  function getTransactionIcon(tx) {
    const type = String(tx.transaction_type || "").toLowerCase();
    if (type === "in") return { cls: "received", icon: "bi-arrow-down-circle" };
    if (type === "out") return { cls: "issued", icon: "bi-arrow-up-circle" };
    return { cls: "adjusted", icon: "bi-sliders" };
  }

  function getTransactionLabel(tx) {
    const type = String(tx.transaction_type || "").toLowerCase();
    if (type === "in") return "received";
    if (type === "out") return "issued";
    return "adjusted";
  }

  function getTransactionSign(tx) {
    return String(tx.transaction_type || "").toLowerCase() === "out" ? "-" : "+";
  }

  function renderStockTransactions(transactions = []) {
    if (!stockTransactionsList) return;

    if (!transactions.length) {
      stockTransactionsList.innerHTML = `
        <div class="stock-transaction-item">
          <div class="stock-transaction-content">
            <div class="stock-transaction-title">No recent stock transactions</div>
            <div class="stock-transaction-meta">New stock activity will appear here.</div>
          </div>
        </div>
      `;
      return;
    }

    stockTransactionsList.innerHTML = transactions
      .slice(0, 6)
      .map((tx) => {
        const iconMeta = getTransactionIcon(tx);
        const itemName = tx.stock_item_name || "Stock Item";
        const sourceLabel = tx.source_display || tx.source || "manual";
        const signedQty = `${getTransactionSign(tx)}${formatNumber(tx.quantity)}`;

        return `
          <div class="stock-transaction-item">
            <div class="stock-transaction-icon ${iconMeta.cls}">
              <i class="bi ${iconMeta.icon}"></i>
            </div>
            <div class="stock-transaction-content">
              <div class="stock-transaction-title">${escapeHtml(itemName)} ${getTransactionLabel(tx)}</div>
              <div class="stock-transaction-meta">
                ${escapeHtml(sourceLabel)} · ${escapeHtml(formatDateTime(tx.created_at))} · Balance after: ${escapeHtml(formatNumber(tx.balance_after))}
              </div>
            </div>
            <div class="stock-transaction-qty ${getTransactionSign(tx) === "-" ? "negative" : "positive"}">
              ${escapeHtml(signedQty)}
            </div>
          </div>
        `;
      })
      .join("");
  }

  function updateStockStats(items = [], transactions = []) {
    const total = items.length;
    const active = items.filter((item) => !!item.is_active).length;
    const low = items.filter((item) =>
      getLevelFromValues(item.current_quantity, item.reorder_level) !== "healthy"
    ).length;

    const recentReceived = transactions
      .filter((tx) => String(tx.transaction_type || "").toLowerCase() === "in")
      .reduce((sum, tx) => sum + Number(tx.quantity || 0), 0);

    if (stockTotalItems) stockTotalItems.textContent = formatNumber(total);
    if (stockRecentlyReceived) stockRecentlyReceived.textContent = formatNumber(recentReceived);
    if (stockActiveItems) stockActiveItems.textContent = formatNumber(active);
    if (stockLowAlerts) stockLowAlerts.textContent = formatNumber(low);
  }

  function applyStockFilters() {
    const rows = Array.from(stockTableBody.querySelectorAll("tr"));

    rows.forEach((row) => {
      const category = row.dataset.category || "";
      const active = row.dataset.active || "false";
      const quantity = parseFloat(row.dataset.quantity || "0");
      const reorder = parseFloat(row.dataset.reorder || "0");
      const level = getLevelFromValues(quantity, reorder);

      let visible = true;

      if (stockState.category !== "all" && category !== stockState.category) visible = false;

      if (stockState.active !== "all") {
        if (stockState.active === "active" && active !== "true") visible = false;
        if (stockState.active === "inactive" && active !== "false") visible = false;
      }

      if (stockState.level !== "all" && level !== stockState.level) visible = false;

      row.style.display = visible ? "" : "none";
    });

    updateStockEntries();
  }

  function getText(row, selector) {
    return (row.querySelector(selector)?.innerText || "").trim().toLowerCase();
  }

  function sortStockRows(key) {
    const rows = Array.from(stockTableBody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      let aVal = "";
      let bVal = "";

      if (key === "name") {
        aVal = getText(a, ".stock-item-name");
        bVal = getText(b, ".stock-item-name");
      } else if (key === "reg") {
        aVal = getText(a, ".stock-reg-badge");
        bVal = getText(b, ".stock-reg-badge");
      } else if (key === "updated") {
        aVal = getText(a, "td:nth-child(4)");
        bVal = getText(b, "td:nth-child(4)");
      } else if (key === "quantity") {
        aVal = parseFloat(a.dataset.quantity || "0");
        bVal = parseFloat(b.dataset.quantity || "0");
      }

      if (aVal < bVal) return stockState.sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return stockState.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    rows.forEach((row) => stockTableBody.appendChild(row));
  }

  async function fetchStockItems() {
    const response = await fetch(STOCK_ITEMS_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch stock items");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  }

  async function fetchStockTransactions() {
    const response = await fetch(STOCK_TRANSACTIONS_API, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch stock transactions");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  }

  async function loadStockData() {
    try {
      const [items, transactions] = await Promise.all([
        fetchStockItems(),
        fetchStockTransactions(),
      ]);

      renderStockItems(items);
      renderStockTransactions(transactions);
      updateStockStats(items, transactions);
      applyStockFilters();
    } catch (error) {
      console.error("Stock load error:", error);

      stockTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-danger">Failed to load stock items.</td>
        </tr>
      `;

      if (stockTransactionsList) {
        stockTransactionsList.innerHTML = `
          <div class="stock-transaction-item">
            <div class="stock-transaction-content">
              <div class="stock-transaction-title text-danger">Failed to load stock transactions</div>
              <div class="stock-transaction-meta">Check your stock API endpoints.</div>
            </div>
          </div>
        `;
      }
    }
  }

  stockCategoryFilter?.addEventListener("change", (e) => {
    stockState.category = e.target.value;
    applyStockFilters();
  });

  stockLevelFilter?.addEventListener("change", (e) => {
    stockState.level = e.target.value;
    applyStockFilters();
  });

  stockActiveFilter?.addEventListener("change", (e) => {
    stockState.active = e.target.value;
    applyStockFilters();
  });

  stockSortHeaders.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sortKey;
      if (!key) return;

      if (stockState.sortKey === key) {
        stockState.sortDirection = stockState.sortDirection === "asc" ? "desc" : "asc";
      } else {
        stockState.sortKey = key;
        stockState.sortDirection = "asc";
      }

      sortStockRows(key);
      applyStockFilters();
    });
  });

  stockSortBtn?.addEventListener("click", () => {
    stockState.sortKey = "quantity";
    stockState.sortDirection = stockState.sortDirection === "asc" ? "desc" : "asc";
    sortStockRows("quantity");
    applyStockFilters();
  });

  selectAllStock?.addEventListener("change", (e) => {
    stockTableBody.querySelectorAll(".stock-row-check").forEach((checkbox) => {
      checkbox.checked = e.target.checked;
    });
  });

  loadStockData();
})();

document.querySelectorAll(".stock-nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    localStorage.setItem("umbrellaActivePage", "stock");
  });
});