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
const userPagination = document.getElementById("userPagination");
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
    donor: "role-communications",
    volunteer: "role-staff",
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
    const totalCount = Number(data.count || 0);
    renderUsers(data.results || []);
    updateEntriesInfo(totalCount);
    renderUserPagination(userState.page, Math.max(1, Math.ceil(totalCount / userState.pageSize)));
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

function renderUserPagination(currentPage = 1, totalPages = 1) {
  if (!userPagination) return;

  if (totalPages <= 1) {
    userPagination.innerHTML = `<button class="page-btn active">1</button>`;
    return;
  }

  let html = `
    <button class="page-btn ${currentPage === 1 ? "disabled" : ""}" data-page="${currentPage - 1}">Prev</button>
  `;

  let dotsAdded = false;

  for (let page = 1; page <= totalPages; page++) {
    const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

    if (shouldShow) {
      dotsAdded = false;
      html += `<button class="page-btn ${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>`;
    } else if (!dotsAdded) {
      dotsAdded = true;
      html += `<button class="page-btn dots" disabled>...</button>`;
    }
  }

  html += `
    <button class="page-btn ${currentPage === totalPages ? "disabled" : ""}" data-page="${currentPage + 1}">Next</button>
  `;

  userPagination.innerHTML = html;

  userPagination.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return;
      userState.page = Number(btn.dataset.page);
      fetchUsers();
    });
  });
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
   ADD USER MODAL + CREATE USER
========================================= */
const addUserModalOverlay = document.getElementById("addUserModalOverlay");
const closeAddUserModalBtn = document.getElementById("closeAddUserModalBtn");
const cancelAddUserBtn = document.getElementById("cancelAddUserBtn");
const addUserForm = document.getElementById("addUserForm");
const addUserMessage = document.getElementById("addUserMessage");
const addUserPhotoInput = document.getElementById("addUserProfilePhoto");
const addUserPhotoPreview = document.getElementById("addUserPhotoPreview");

function showAddUserMessage(message, type = "success") {
  if (!addUserMessage) return;
  addUserMessage.textContent = message;
  addUserMessage.className = `user-modal-message ${type}`;
  addUserMessage.classList.remove("is-hidden");

  setTimeout(() => {
    addUserMessage.classList.add("is-hidden");
  }, 3500);
}

function openAddUserModal() {
  if (!addUserModalOverlay) return;
  addUserModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeAddUserModal() {
  if (!addUserModalOverlay) return;
  addUserModalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

function resetAddUserForm() {
  if (!addUserForm) return;
  addUserForm.reset();
  if (addUserPhotoPreview) {
    addUserPhotoPreview.src = "https://i.pravatar.cc/120?img=12";
  }
  if (addUserMessage) {
    addUserMessage.classList.add("is-hidden");
  }
}

if (addUserPhotoInput && addUserPhotoPreview) {
  addUserPhotoInput.addEventListener("input", () => {
    const value = addUserPhotoInput.value.trim();
    addUserPhotoPreview.src = value || "https://i.pravatar.cc/120?img=12";
  });

  addUserPhotoPreview.addEventListener("error", () => {
    addUserPhotoPreview.src = "https://i.pravatar.cc/120?img=12";
  });
}

if (openAddUserBtn) {
  openAddUserBtn.addEventListener("click", () => {
    resetAddUserForm();
    openAddUserModal();
  });
}

closeAddUserModalBtn?.addEventListener("click", closeAddUserModal);
cancelAddUserBtn?.addEventListener("click", closeAddUserModal);

addUserModalOverlay?.addEventListener("click", (e) => {
  if (e.target === addUserModalOverlay) {
    closeAddUserModal();
  }
});

addUserForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const first_name = document.getElementById("addUserFirstName")?.value.trim() || "";
  const last_name = document.getElementById("addUserLastName")?.value.trim() || "";
  const username = document.getElementById("addUserUsername")?.value.trim() || "";
  const email = document.getElementById("addUserEmail")?.value.trim() || "";
  const phone = document.getElementById("addUserPhone")?.value.trim() || "";
  const role = document.getElementById("addUserRole")?.value || "donor";
  const status = document.getElementById("addUserStatus")?.value || "paused";
  const verified = document.getElementById("addUserVerified")?.value === "true";
  const profile_photo = document.getElementById("addUserProfilePhoto")?.value.trim() || "";
  const password = document.getElementById("addUserPassword")?.value || "";
  const confirm_password = document.getElementById("addUserConfirmPassword")?.value || "";

  if (!first_name || !username || !email || !password) {
    showAddUserMessage("First name, username, email, and password are required.", "error");
    return;
  }

  if (password.length < 8) {
    showAddUserMessage("Password must be at least 8 characters.", "error");
    return;
  }

  if (password !== confirm_password) {
    showAddUserMessage("Password confirmation does not match.", "error");
    return;
  }

  try {
    const response = await fetch(DJANGO_USERS_API, {
      method: "POST",
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
        verified,
        profile_photo,
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.detail ||
        JSON.stringify(data) ||
        "Failed to create user."
      );
    }

    showAddUserMessage("User created successfully.", "success");
    resetAddUserForm();
    closeAddUserModal();
    fetchUsers();
  } catch (error) {
    console.error("Create user error:", error);
    showAddUserMessage(error.message || "Failed to create user.", "error");
  }
});

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
  const needsCardsGrid = document.getElementById("needsCardsGrid");
  const needForm = document.getElementById("needForm");
  const needMessageBox = document.getElementById("needMessage");
  const needSearchInput = document.getElementById("needSearchInput");
  const needStatusFilter = document.getElementById("needStatusFilter");
  const needTypeFilter = document.getElementById("needTypeFilter");
  const needEntriesInfo = document.getElementById("needEntriesInfo");
  const resetNeedBtn = document.getElementById("resetNeedBtn");
  const needRefreshBtn = document.getElementById("needRefreshBtn");
  const needsExportBtn = document.getElementById("needsExportBtn");
  const selectAllNeeds = document.getElementById("selectAllNeeds");

  const openNeedModalBtn = document.getElementById("openNeedModalBtn");
  const closeNeedModalBtn = document.getElementById("closeNeedModalBtn");
  const needModalOverlay = document.getElementById("needModalOverlay");
  const needModalTitle = document.getElementById("needModalTitle");
  const needSubmitBtn = document.getElementById("needSubmitBtn");

  const needsTabs = document.querySelectorAll(".needs-tab");
  const needsCardsView = document.getElementById("needsCardsView");
  const needsListView = document.getElementById("needsListView");
  const needsSortButtons = document.querySelectorAll(".needs-th-btn");
  const needPagination = document.getElementById("needPagination");

  if (!needsTableBody || !needsCardsGrid || !needForm) return;

  const needState = {
    results: [],
    search: "",
    status: "",
    needType: "",
    view: "cards",
    ordering: "-created_at",
    page: 1,
  pageSize: 6,
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

  function formatCurrency(value) {
    const num = Number(value || 0);
    return `KES ${num.toLocaleString()}`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function getNeedPercent(need) {
    const required = Number(need.quantity_required || 0);
    const received = Number(need.quantity_fulfilled || 0);
    if (required <= 0) return 0;
    return Math.min(100, Math.max(0, (received / required) * 100));
  }

  function getNeedStatusClass(status) {
    return String(status || "pending").toLowerCase();
  }

  function getNeedTypeClass(type) {
    return String(type || "in_kind").toLowerCase();
  }

  function getNeedImage(need) {
    return need.image_url || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";
  }

  function getDonorCount(need) {
    if (Array.isArray(need.donors)) return need.donors.length;
    return need.donors_count || 0;
  }

  function sortNeeds(results) {
    const ordering = needState.ordering;
    const isDesc = ordering.startsWith("-");
    const key = isDesc ? ordering.slice(1) : ordering;

    return [...results].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (["quantity_required", "quantity_fulfilled"].includes(key)) {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      }

      if (key === "deadline" || key === "created_at") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      aVal = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
      bVal = typeof bVal === "string" ? bVal.toLowerCase() : bVal;

      if (aVal < bVal) return isDesc ? 1 : -1;
      if (aVal > bVal) return isDesc ? -1 : 1;
      return 0;
    });
  }

  function renderNeedCards(needs = []) {
    if (!needs.length) {
      needsCardsGrid.innerHTML = `<div class="text-muted">No needs found.</div>`;
      return;
    }

    needsCardsGrid.innerHTML = needs.map((need) => {
      const percent = getNeedPercent(need);
      const statusClass = getNeedStatusClass(need.status);
      const donorCount = getDonorCount(need);

      return `
        <div class="need-admin-card" data-need-id="${need.id}">
          <div class="need-admin-image-wrap">
            <img src="${escapeHtml(getNeedImage(need))}" alt="${escapeHtml(need.title || "Need image")}">
            <span class="need-admin-badge">${escapeHtml((need.status || "pending").replaceAll("_", " "))}</span>

            <div class="need-admin-image-actions">
              <button class="need-image-action-btn" type="button" title="Change image" onclick="changeNeedImage('${need.id}')">
                <i class="bi bi-image"></i>
              </button>
              <button class="need-image-action-btn" type="button" title="Edit details" onclick="editNeed('${need.id}')">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
          </div>

          <div class="need-admin-body">
            <div class="need-admin-topline">
              <div class="need-admin-title">${escapeHtml(need.title || "-")}</div>
              <div class="need-admin-date">Date: ${escapeHtml(formatDate(need.created_at || need.deadline))}</div>
            </div>

            <div class="need-admin-desc">
              ${escapeHtml(need.description || "No description provided for this need.")}
            </div>

            <div class="need-admin-metric">
              <strong>Amount Needed:</strong>
              <span class="need-admin-highlight">${escapeHtml(formatCurrency(need.quantity_required))}</span>
            </div>

            <div class="need-admin-metric">
              <strong>Donors:</strong>
              <span class="need-admin-highlight">${escapeHtml(String(donorCount))}</span>
            </div>

            <div class="need-admin-progress-text">
              <span class="raised">${escapeHtml(formatCurrency(need.quantity_fulfilled))}</span>
              out of ${escapeHtml(Number(need.quantity_required || 0).toLocaleString())}
            </div>

            <div class="need-admin-progress-bar">
              <span style="width:${percent}%;"></span>
            </div>

            <div class="need-admin-actions">
              <button class="need-admin-btn pause" type="button" onclick="setNeedStatus('${need.id}', 'active')">Pause</button>
              <button class="need-admin-btn close" type="button" onclick="closeNeed('${need.id}')">Close</button>
              <button class="need-admin-btn edit" type="button" onclick="editNeed('${need.id}')">Edit Details</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderNeedsTable(needs = []) {
    if (!needs.length) {
      needsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">No needs found.</td>
        </tr>
      `;
      return;
    }

    needsTableBody.innerHTML = needs.map((need) => `
      <tr data-need-id="${need.id}">
        <td><input type="checkbox" class="need-row-check" data-need-id="${need.id}"></td>

        <td>
          <div class="need-table-title">
            <img class="need-table-thumb" src="${escapeHtml(getNeedImage(need))}" alt="${escapeHtml(need.title || "Need")}">
            <div>
              <div class="fw-bold">${escapeHtml(need.title || "-")}</div>
              <div class="text-mute small">${escapeHtml(need.needs_registration_code || "")}</div>
            </div>
          </div>
        </td>

        <td>
          <span class="need-type-pill ${getNeedTypeClass(need.need_type)}">
            ${escapeHtml((need.need_type || "-").replaceAll("_", " "))}
          </span>
        </td>

        <td>${escapeHtml(formatCurrency(need.quantity_required))}</td>
        <td>${escapeHtml(formatCurrency(need.quantity_fulfilled))}</td>

        <td>
          <span class="need-status-pill ${getNeedStatusClass(need.status)}">
            ${escapeHtml((need.status || "-").replaceAll("_", " "))}
          </span>
        </td>

        <td>${escapeHtml(need.deadline || "-")}</td>

        <td>
          <div class="action-btn-group">
            <button class="table-action-btn edit-btn" title="Edit Need" onclick="editNeed('${need.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="table-action-btn freeze-btn" title="Change Image" onclick="changeNeedImage('${need.id}')">
              <i class="bi bi-image"></i>
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
  }

  function updateNeedEntriesInfo(start = 0, end = 0, total = 0) {
  if (!needEntriesInfo) return;
  needEntriesInfo.textContent = total
    ? `Showing ${start} to ${end} of ${total} entries`
    : "Showing 0 to 0 of 0 entries";
}

function renderNeedPagination(currentPage = 1, totalPages = 1) {
  if (!needPagination) return;

  if (totalPages <= 1) {
    needPagination.innerHTML = `<button class="needs-page-btn active">1</button>`;
    return;
  }

  let html = `
    <button class="needs-page-btn ${currentPage === 1 ? "disabled" : ""}" data-page="${currentPage - 1}">Prev</button>
  `;

  let dotsAdded = false;

  for (let page = 1; page <= totalPages; page++) {
    const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

    if (shouldShow) {
      dotsAdded = false;
      html += `<button class="needs-page-btn ${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>`;
    } else if (!dotsAdded) {
      dotsAdded = true;
      html += `<button class="needs-page-btn dots" disabled>...</button>`;
    }
  }

  html += `
    <button class="needs-page-btn ${currentPage === totalPages ? "disabled" : ""}" data-page="${currentPage + 1}">Next</button>
  `;

  needPagination.innerHTML = html;

  needPagination.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return;
      needState.page = Number(btn.dataset.page);
      renderNeeds();
    });
  });
}

function renderNeeds() {
  const total = needState.results.length;
  const totalPages = Math.max(1, Math.ceil(total / needState.pageSize));

  if (needState.page > totalPages) needState.page = totalPages;

  const startIndex = (needState.page - 1) * needState.pageSize;
  const endIndex = startIndex + needState.pageSize;
  const paginated = needState.results.slice(startIndex, endIndex);

  renderNeedCards(paginated);
  renderNeedsTable(paginated);
  updateNeedEntriesInfo(total ? startIndex + 1 : 0, Math.min(endIndex, total), total);
  renderNeedPagination(needState.page, totalPages);
}


  function switchNeedsView(view) {
    needState.view = view;

    needsTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.needsView === view);
    });

    needsCardsView.classList.toggle("active", view === "cards");
    needsListView.classList.toggle("active", view === "list");
  }

  function openNeedModal(editMode = false) {
    needModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    needModalTitle.textContent = editMode ? "Edit Need" : "Add Need";
    needSubmitBtn.textContent = editMode ? "Update Need" : "Save Need";
  }

  function closeNeedModal() {
    needModalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function collectNeedFormData() {
    return {
      title: document.getElementById("needTitle")?.value?.trim() || "",
      description: document.getElementById("needDescription")?.value?.trim() || "",
      quantity_required: parseFloat(document.getElementById("needQuantityRequired")?.value || "0"),
      quantity_fulfilled: parseFloat(document.getElementById("needQuantityFulfilled")?.value || "0"),
      deadline: document.getElementById("needDeadline")?.value || null,
      status: document.getElementById("needStatus")?.value || "pending",
      need_type: document.getElementById("needType")?.value || "in_kind",
      unit: document.getElementById("needUnit")?.value?.trim() || "units",
      image_url: document.getElementById("needImageUrl")?.value?.trim() || "",
    };
  }

  function resetNeedForm() {
    needForm.reset();
    document.getElementById("needId").value = "";
    document.getElementById("needQuantityFulfilled").value = "0";
    document.getElementById("needType").value = "in_kind";
    document.getElementById("needStatus").value = "pending";
    document.getElementById("needUnit").value = "";
    document.getElementById("needImageUrl").value = "";
    needModalTitle.textContent = "Add Need";
    needSubmitBtn.textContent = "Save Need";
  }

  async function fetchNeeds() {
    try {
      const params = new URLSearchParams();

      if (needState.search) params.append("search", needState.search);
      if (needState.status) params.append("status", needState.status);
      if (needState.needType) params.append("need_type", needState.needType);

      const response = await fetch(`${DJANGO_NEEDS_API}${params.toString() ? `?${params.toString()}` : ""}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
        },
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to fetch needs (${response.status})`);
      }

      const data = rawText ? JSON.parse(rawText) : {};
      const results = Array.isArray(data.results) ? data.results : [];

      needState.results = sortNeeds(results);
      needState.page = 1;
      renderNeeds();
    } catch (error) {
      console.error("Needs fetch error:", error);
      showNeedMessage(error.message || "Failed to load needs.", "danger");

      needsCardsGrid.innerHTML = `<div class="text-danger">Failed to load needs.</div>`;
      needsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-danger">Failed to load needs.</td>
        </tr>
      `;
    }
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
      closeNeedModal();
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
      document.getElementById("needQuantityRequired").value = need.quantity_required ?? "";
      document.getElementById("needQuantityFulfilled").value = need.quantity_fulfilled ?? 0;
      document.getElementById("needDeadline").value = need.deadline || "";
      document.getElementById("needStatus").value = need.status || "pending";
      document.getElementById("needType").value = need.need_type || "in_kind";
      document.getElementById("needUnit").value = need.unit || "units";
      document.getElementById("needImageUrl").value = need.image_url || "";

      openNeedModal(true);
    } catch (error) {
      console.error("Edit need load error:", error);
      showNeedMessage(error.message, "danger");
    }
  };

  window.changeNeedImage = async function (needId) {
    try {
      const need = await needsRequest(`${DJANGO_NEEDS_API}${needId}/`, {
        method: "GET",
      });

      const nextImageUrl = prompt("Paste the new image URL:", need.image_url || "");
      if (nextImageUrl === null) return;

      await needsRequest(`${DJANGO_NEEDS_API}${needId}/`, {
        method: "PATCH",
        body: JSON.stringify({ image_url: nextImageUrl.trim() }),
      });

      showNeedMessage("Need image updated successfully.");
      await fetchNeeds();
    } catch (error) {
      console.error("Change need image error:", error);
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

  window.setNeedStatus = async function (needId, status) {
    try {
      await needsRequest(`${DJANGO_NEEDS_API}${needId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      showNeedMessage("Need status updated successfully.");
      await fetchNeeds();
    } catch (error) {
      console.error("Set need status error:", error);
      showNeedMessage(error.message, "danger");
    }
  };

  function exportNeedsCSV() {
    const rows = needState.results || [];
    if (!rows.length) return;

    const headers = [
      "Registration Code",
      "Title",
      "Type",
      "Amount Needed",
      "Amount Received",
      "Status",
      "Deadline",
      "Unit",
      "Image URL",
      "Description",
    ];

    const body = rows.map((item) => [
      item.needs_registration_code || "",
      item.title || "",
      item.need_type || "",
      item.quantity_required || 0,
      item.quantity_fulfilled || 0,
      item.status || "",
      item.deadline || "",
      item.unit || "",
      item.image_url || "",
      item.description || "",
    ]);

    const csv = [headers, ...body]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "needs_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (needForm) {
    needForm.addEventListener("submit", saveNeed);
  }

  if (resetNeedBtn) {
    resetNeedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetNeedForm();
    });
  }

  openNeedModalBtn?.addEventListener("click", () => {
    resetNeedForm();
    openNeedModal(false);
  });

  closeNeedModalBtn?.addEventListener("click", closeNeedModal);

  needModalOverlay?.addEventListener("click", (e) => {
    if (e.target === needModalOverlay) closeNeedModal();
  });

  if (needSearchInput) {
    let timer;
    needSearchInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        needState.search = e.target.value.trim();
        needState.page = 1;
        fetchNeeds();
      }, 300);
    });
  }

  if (needStatusFilter) {
    needStatusFilter.addEventListener("change", (e) => {
      needState.status = e.target.value;
      needState.page = 1;
      fetchNeeds();
    });
  }

  if (needTypeFilter) {
    needTypeFilter.addEventListener("change", (e) => {
      needState.needType = e.target.value;
      needState.page = 1;
      fetchNeeds();
    });
  }

  needsTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.needsView || "cards";
      needState.page = 1;
      switchNeedsView(view);
    });
  });

  needsSortButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.sortKey;
    if (!key) return;

    if (needState.ordering === key) {
      needState.ordering = `-${key}`;
    } else if (needState.ordering === `-${key}`) {
      needState.ordering = key;
    } else {
      needState.ordering = key;
    }

    needState.results = sortNeeds(needState.results);
    needState.page = 1;
    renderNeeds();
  });
});

  needRefreshBtn?.addEventListener("click", fetchNeeds);
  needsExportBtn?.addEventListener("click", exportNeedsCSV);

  selectAllNeeds?.addEventListener("change", (e) => {
    document.querySelectorAll(".need-row-check").forEach((checkbox) => {
      checkbox.checked = e.target.checked;
    });
  });

  switchNeedsView("cards");
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
  const stockPagination = document.getElementById("stockPagination");
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
    page: 1,
  pageSize: 10,
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

  function updateStockEntries(start = 0, end = 0, total = 0) {
  if (stockEntriesInfo) {
    stockEntriesInfo.textContent = total
      ? `Showing ${start} to ${end} of ${total} entries`
      : "Showing 0 to 0 of 0 entries";
  }
}

function renderStockPagination(currentPage = 1, totalPages = 1) {
  if (!stockPagination) return;

  if (totalPages <= 1) {
    stockPagination.innerHTML = `<button class="stock-page-btn active">1</button>`;
    return;
  }

  let html = `
    <button class="stock-page-btn ${currentPage === 1 ? "disabled" : ""}" data-page="${currentPage - 1}">Prev</button>
  `;

  let dotsAdded = false;

  for (let page = 1; page <= totalPages; page++) {
    const shouldShow = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

    if (shouldShow) {
      dotsAdded = false;
      html += `<button class="stock-page-btn ${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>`;
    } else if (!dotsAdded) {
      dotsAdded = true;
      html += `<button class="stock-page-btn dots" disabled>...</button>`;
    }
  }

  html += `
    <button class="stock-page-btn ${currentPage === totalPages ? "disabled" : ""}" data-page="${currentPage + 1}">Next</button>
  `;

  stockPagination.innerHTML = html;

  stockPagination.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return;
      stockState.page = Number(btn.dataset.page);
      applyStockFilters();
    });
  });
}

function paginateStockRows() {
  const filteredRows = Array.from(stockTableBody.querySelectorAll('tr')).filter(
    (row) => row.dataset.filterMatch !== 'false'
  );

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / stockState.pageSize));

  if (stockState.page > totalPages) stockState.page = totalPages;

  const startIndex = (stockState.page - 1) * stockState.pageSize;
  const endIndex = startIndex + stockState.pageSize;

  filteredRows.forEach((row, index) => {
    row.style.display = index >= startIndex && index < endIndex ? '' : 'none';
  });

  updateStockEntries(total ? startIndex + 1 : 0, Math.min(endIndex, total), total);
  renderStockPagination(stockState.page, totalPages);
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

    row.dataset.filterMatch = visible ? "true" : "false";
    row.style.display = visible ? "" : "none";
  });

  paginateStockRows();
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
  stockState.page = 1;
  applyStockFilters();
});

stockLevelFilter?.addEventListener("change", (e) => {
  stockState.level = e.target.value;
  stockState.page = 1;
  applyStockFilters();
});

stockActiveFilter?.addEventListener("change", (e) => {
  stockState.active = e.target.value;
  stockState.page = 1;
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
    stockState.page = 1;
    applyStockFilters();
  });
});

stockSortBtn?.addEventListener("click", () => {
  stockState.sortKey = "quantity";
  stockState.sortDirection = stockState.sortDirection === "asc" ? "desc" : "asc";
  sortStockRows("quantity");
  stockState.page = 1;
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

/* =========================================
   VOLUNTEERS PAGE - DJANGO INTEGRATION
========================================= */
(function () {
  const DJANGO_VOLUNTEERS_API = `${API_BASE_URL}/api/volunteers/`;

  const volunteerTable = document.getElementById("volunteerTable");
  const volunteerTableBody = document.getElementById("volunteerTableBody");
  const volunteerSearchInput = document.getElementById("volunteerSearchInput");
  const volunteerStatusFilter = document.getElementById("volunteerStatusFilter");
  const volunteerSignupFilter = document.getElementById("volunteerSignupFilter");
  const volunteerEntriesInfo = document.getElementById("volunteerEntriesInfo");
  const volunteerPagination = document.getElementById("volunteerPagination");
  const volunteerTabs = document.querySelectorAll(".volunteer-tab");
  const volunteerSortButtons = document.querySelectorAll(".volunteer-th-btn");
  const volunteerExportBtn = document.getElementById("volunteerExportBtn");
  const selectAllVolunteers = document.getElementById("selectAllVolunteers");

  if (!volunteerTable || !volunteerTableBody) return;

  const volunteerState = {
    page: 1,
    pageSize: 10,
    search: "",
    tab: "all",
    status: "all",
    signupRange: "all",
    ordering: "-created_at",
    rawResults: [],
    filteredResults: [],
  };

  function formatVolunteerDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getVolunteerInitials(name = "") {
    const clean = String(name).trim();
    if (!clean) return "V";
    const parts = clean.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  function getVolunteerStatusClass(isActive) {
    return isActive ? "active" : "inactive";
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function updateVolunteerEntriesInfo(start = 0, end = 0, total = 0) {
    if (!volunteerEntriesInfo) return;
    volunteerEntriesInfo.textContent = total
      ? `Showing ${start} to ${end} of ${total} entries`
      : "Showing 0 to 0 of 0 entries";
  }

  function renderVolunteerPagination(currentPage = 1, totalPages = 1) {
    if (!volunteerPagination) return;

    if (totalPages <= 1) {
      volunteerPagination.innerHTML = `<button class="volunteer-page-btn active">1</button>`;
      return;
    }

    let html = `
      <button class="volunteer-page-btn ${currentPage === 1 ? "disabled" : ""}" data-page="${currentPage - 1}">
        Prev
      </button>
    `;

    let dotsAdded = false;

    for (let page = 1; page <= totalPages; page++) {
      const shouldShow =
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1;

      if (shouldShow) {
        dotsAdded = false;
        html += `
          <button class="volunteer-page-btn ${page === currentPage ? "active" : ""}" data-page="${page}">
            ${page}
          </button>
        `;
      } else if (!dotsAdded) {
        dotsAdded = true;
        html += `<button class="volunteer-page-btn dots" disabled>...</button>`;
      }
    }

    html += `
      <button class="volunteer-page-btn ${currentPage === totalPages ? "disabled" : ""}" data-page="${currentPage + 1}">
        Next
      </button>
    `;

    volunteerPagination.innerHTML = html;

    volunteerPagination.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("disabled")) return;
        volunteerState.page = Number(btn.dataset.page);
        renderVolunteerTable();
      });
    });
  }

  function applyVolunteerFilters(results = []) {
    let filtered = [...results];

    if (volunteerState.tab === "active") {
      filtered = filtered.filter((item) => !!item.is_active);
    } else if (volunteerState.tab === "inactive") {
      filtered = filtered.filter((item) => !item.is_active);
    }

    if (volunteerState.status === "active") {
      filtered = filtered.filter((item) => !!item.is_active);
    } else if (volunteerState.status === "inactive") {
      filtered = filtered.filter((item) => !item.is_active);
    }

    if (volunteerState.signupRange !== "all") {
      filtered = filtered.filter((item) => {
        const count = Number(item.signups_count || 0);
        if (volunteerState.signupRange === "0") return count === 0;
        if (volunteerState.signupRange === "1-5") return count >= 1 && count <= 5;
        if (volunteerState.signupRange === "6-10") return count >= 6 && count <= 10;
        if (volunteerState.signupRange === "10+") return count > 10;
        return true;
      });
    }

    return filtered;
  }

  function sortVolunteerResults(results = []) {
    const ordering = volunteerState.ordering;
    const isDesc = ordering.startsWith("-");
    const key = isDesc ? ordering.slice(1) : ordering;

    return [...results].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === "is_active") {
        aVal = a.is_active ? 1 : 0;
        bVal = b.is_active ? 1 : 0;
      }

      if (key === "signups_count") {
        aVal = Number(a.signups_count || 0);
        bVal = Number(b.signups_count || 0);
      }

      if (key === "created_at") {
        aVal = new Date(a.created_at || 0).getTime();
        bVal = new Date(b.created_at || 0).getTime();
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return isDesc ? 1 : -1;
      if (aVal > bVal) return isDesc ? -1 : 1;
      return 0;
    });
  }

  function renderVolunteerTable() {
    const filtered = sortVolunteerResults(
      applyVolunteerFilters(volunteerState.rawResults)
    );

    volunteerState.filteredResults = filtered;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / volunteerState.pageSize));

    if (volunteerState.page > totalPages) volunteerState.page = totalPages;

    const startIndex = (volunteerState.page - 1) * volunteerState.pageSize;
    const endIndex = startIndex + volunteerState.pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    if (!paginated.length) {
      volunteerTableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-4 text-muted">
            No volunteers found.
          </td>
        </tr>
      `;
      updateVolunteerEntriesInfo(0, 0, total);
      renderVolunteerPagination(1, 1);
      return;
    }

    volunteerTableBody.innerHTML = paginated.map((volunteer) => {
      const statusText = volunteer.is_active ? "Active" : "Inactive";
      const safeName = escapeHtml(volunteer.name || "Volunteer");
      const safeEmail = escapeHtml(volunteer.email || "-");
      const safePhone = escapeHtml(volunteer.phone || "-");
      const safeSkills = escapeHtml(volunteer.skills || "-");
      const safeAvailability = escapeHtml(volunteer.availability || "-");
      const safeSignups = escapeHtml(volunteer.signups_count ?? 0);
      const safeCreated = escapeHtml(formatVolunteerDate(volunteer.created_at));

      return `
        <tr data-volunteer-id="${volunteer.id}">
          <td class="sticky-base sticky-order-col">
            <input type="checkbox" class="volunteer-row-check" data-volunteer-id="${volunteer.id}">
          </td>

          <td class="sticky-base sticky-volunteer-col" data-col-key="volunteer">
            <div class="volunteer-cell-wrap">
              <span class="volunteer-avatar">${escapeHtml(getVolunteerInitials(volunteer.name || "Volunteer"))}</span>
              <div>
                <div class="volunteer-name-line">${safeName}</div>
                <div class="volunteer-meta-line">ID: ${escapeHtml(volunteer.id)}</div>
              </div>
            </div>
          </td>

          <td data-col-key="email">${safeEmail}</td>
          <td data-col-key="phone">${safePhone}</td>
          <td data-col-key="skills">
            <span class="volunteer-skill-badge">${safeSkills}</span>
          </td>
          <td data-col-key="availability">${safeAvailability}</td>
          <td data-col-key="signups_count">
            <span class="volunteer-signup-pill">${safeSignups}</span>
          </td>
          <td data-col-key="status">
            <span class="volunteer-status ${getVolunteerStatusClass(volunteer.is_active)}">${statusText}</span>
          </td>
          <td data-col-key="created_at">${safeCreated}</td>
          <td data-col-key="actions">
            <div class="d-flex align-items-center gap-2">
              <button class="volunteer-action-btn" title="View Volunteer" onclick="viewVolunteer('${volunteer.id}')">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    updateVolunteerEntriesInfo(
      total === 0 ? 0 : startIndex + 1,
      Math.min(endIndex, total),
      total
    );

    renderVolunteerPagination(volunteerState.page, totalPages);
  }

  async function fetchVolunteers() {
    try {
      const params = new URLSearchParams();

      if (volunteerState.search) {
        params.set("search", volunteerState.search);
      }

      const response = await fetch(`${DJANGO_VOLUNTEERS_API}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch volunteers");
      }

      const data = await response.json();
      volunteerState.rawResults = Array.isArray(data.results) ? data.results : [];
      volunteerState.page = 1;
      renderVolunteerTable();
    } catch (error) {
      console.error("Volunteer fetch error:", error);
      volunteerTableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-4 text-danger">
            Failed to load volunteers.
          </td>
        </tr>
      `;
      updateVolunteerEntriesInfo(0, 0, 0);
    }
  }

  function exportVolunteersCSV() {
    const rows = volunteerState.filteredResults || [];
    if (!rows.length) return;

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Skills",
      "Availability",
      "Signups Count",
      "Status",
      "Created At"
    ];

    const body = rows.map((item) => [
      item.id ?? "",
      item.name ?? "",
      item.email ?? "",
      item.phone ?? "",
      item.skills ?? "",
      item.availability ?? "",
      item.signups_count ?? 0,
      item.is_active ? "Active" : "Inactive",
      formatVolunteerDate(item.created_at),
    ]);

    const csv = [headers, ...body]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "volunteers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  window.viewVolunteer = function (volunteerId) {
    const volunteer = volunteerState.rawResults.find((item) => String(item.id) === String(volunteerId));
    if (!volunteer) return;

    alert([
      `Name: ${volunteer.name || "-"}`,
      `Email: ${volunteer.email || "-"}`,
      `Phone: ${volunteer.phone || "-"}`,
      `Skills: ${volunteer.skills || "-"}`,
      `Availability: ${volunteer.availability || "-"}`,
      `Signups: ${volunteer.signups_count ?? 0}`,
      `Status: ${volunteer.is_active ? "Active" : "Inactive"}`,
      `Joined: ${formatVolunteerDate(volunteer.created_at)}`
    ].join("\n"));
  };

  volunteerSearchInput?.addEventListener("input", (() => {
    let timer;
    return (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        volunteerState.search = e.target.value.trim();
        fetchVolunteers();
      }, 350);
    };
  })());

  volunteerStatusFilter?.addEventListener("change", (e) => {
    volunteerState.status = e.target.value;
    volunteerState.page = 1;
    renderVolunteerTable();
  });

  volunteerSignupFilter?.addEventListener("change", (e) => {
    volunteerState.signupRange = e.target.value;
    volunteerState.page = 1;
    renderVolunteerTable();
  });

  volunteerTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      volunteerTabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      volunteerState.tab = tab.dataset.volunteerTab || "all";
      volunteerState.page = 1;
      renderVolunteerTable();
    });
  });

  volunteerSortButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sortKey;
      if (!key) return;

      if (volunteerState.ordering === key) {
        volunteerState.ordering = `-${key}`;
      } else if (volunteerState.ordering === `-${key}`) {
        volunteerState.ordering = key;
      } else {
        volunteerState.ordering = key;
      }

      volunteerState.page = 1;
      renderVolunteerTable();
    });
  });

  volunteerExportBtn?.addEventListener("click", exportVolunteersCSV);

  selectAllVolunteers?.addEventListener("change", (e) => {
    volunteerTableBody.querySelectorAll(".volunteer-row-check").forEach((checkbox) => {
      checkbox.checked = e.target.checked;
    });
  });

  fetchVolunteers();
})();

/* =========================================
   CALENDAR PAGE - DJANGO CONNECTED VERSION
   Endpoints expected:
   GET    /api/calendar/events/
   POST   /api/calendar/events/
   GET    /api/calendar/events/:id/
   PATCH  /api/calendar/events/:id/
   DELETE /api/calendar/events/:id/
========================================= */
(function () {
  const CALENDAR_API = `${API_BASE_URL}/api/calendar/events/`;

  const board = document.getElementById("calendarBoard");
  const currentLabel = document.getElementById("calendarCurrentLabel");
  const currentSummary = document.getElementById("calendarSelectionSummary");
  const searchInput = document.getElementById("calendarSearchInput");
  const todayBtn = document.getElementById("calendarTodayBtn");
  const prevBtn = document.getElementById("calendarPrevBtn");
  const nextBtn = document.getElementById("calendarNextBtn");
  const viewSwitchButtons = document.querySelectorAll(".calendar-view-btn");
  const miniTitle = document.getElementById("calendarMiniTitle");
  const miniGrid = document.getElementById("calendarMiniGrid");
  const miniPrevBtn = document.getElementById("calendarMiniPrev");
  const miniNextBtn = document.getElementById("calendarMiniNext");
  const legendList = document.getElementById("calendarLegendList");

  const modalBackdrop = document.getElementById("calendarEventModalBackdrop");
  const openModalBtn = document.getElementById("openCalendarEventModal");
  const closeModalBtn = document.getElementById("closeCalendarEventModal");
  const cancelModalBtn = document.getElementById("cancelCalendarEventBtn");
  const deleteEventBtn = document.getElementById("deleteCalendarEventBtn");
  const eventForm = document.getElementById("calendarEventForm");
  const modalTitle = document.getElementById("calendarModalTitle");

  const eventIdField = document.getElementById("calendarEventId");
  const titleField = document.getElementById("calendarEventTitle");
  const startDateField = document.getElementById("calendarStartDate");
  const endDateField = document.getElementById("calendarEndDate");
  const startTimeField = document.getElementById("calendarStartTime");
  const endTimeField = document.getElementById("calendarEndTime");
  const allDayField = document.getElementById("calendarAllDay");
  const colorField = document.getElementById("calendarColor");
  const statusField = document.getElementById("calendarStatus");
  const descriptionField = document.getElementById("calendarDescription");
  const timeFields = document.getElementById("calendarTimeFields");

  if (!board) return;

  const calendarState = {
    view: "month",
    anchorDate: startOfDay(new Date()),
    selectedDate: startOfDay(new Date()),
    miniDate: startOfMonth(new Date()),
    events: [],
    filteredEvents: [],
    search: "",
    draggingEventId: null,
  };

  function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function addMonths(date, months) {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() + months);
    return copy;
  }

  function addYears(date, years) {
    const copy = new Date(date);
    copy.setFullYear(copy.getFullYear() + years);
    return copy;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function toISODate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function formatLongMonth(date) {
    return date.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }

  function formatWeekdayShort(date) {
    return date.toLocaleDateString("en-GB", { weekday: "short" });
  }

  function formatDateLabel(date) {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTimeLabel(time24) {
    if (!time24) return "";
    const [h, m] = String(time24).split(":");
    const d = new Date();
    d.setHours(Number(h || 0), Number(m || 0), 0, 0);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function hexToRgba(hex, alpha) {
    const clean = String(hex || "#2563eb").replace("#", "");
    const normalized = clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
    const value = parseInt(normalized, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getCookie(name) {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
  }

  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
        ...(options.headers || {}),
      },
      ...options,
    });

    let data = {};
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.detail || data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  function normalizeEvent(raw = {}) {
    return {
      id: raw.id,
      title: raw.title || "Untitled event",
      description: raw.description || "",
      start_date: raw.start_date,
      end_date: raw.end_date || raw.start_date,
      start_time: raw.start_time || "",
      end_time: raw.end_time || "",
      all_day: !!raw.all_day,
      color: raw.color || "#2563eb",
      status: raw.status || "scheduled",
      starts_at: raw.starts_at || null,
      ends_at: raw.ends_at || null,
    };
  }

  function applySearchFilter() {
    const query = calendarState.search.toLowerCase().trim();
    calendarState.filteredEvents = calendarState.events.filter((event) => {
      if (!query) return true;
      return [event.title, event.description, event.start_date, event.end_date]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }

  async function fetchEvents() {
    try {
      const data = await apiRequest(CALENDAR_API, { method: "GET" });
      const results = Array.isArray(data) ? data : (data.results || []);
      calendarState.events = results.map(normalizeEvent);
      applySearchFilter();
      renderCalendar();
    } catch (error) {
      console.error("Calendar fetch error:", error);
      board.innerHTML = `<div style="padding:2rem; color:#dc2626; font-weight:700;">Failed to load calendar events.</div>`;
    }
  }

  function getEventsForDate(date) {
    const iso = toISODate(date);
    return calendarState.filteredEvents.filter((event) => iso >= event.start_date && iso <= event.end_date);
  }

  function getEventById(eventId) {
    return calendarState.events.find((event) => String(event.id) === String(eventId));
  }

  function setSelectedDate(date) {
    calendarState.selectedDate = startOfDay(date);
    if (calendarState.view === "day") {
      calendarState.anchorDate = startOfDay(date);
    }
    renderCalendar();
  }

  function renderCalendar() {
    applySearchFilter();
    renderHeaderLabels();
    renderMiniCalendar();
    renderLegend();

    if (calendarState.view === "month") {
      renderMonthView();
    } else if (calendarState.view === "day") {
      renderDayView();
    } else {
      renderYearView();
    }
  }

  function renderHeaderLabels() {
    if (calendarState.view === "month") {
      currentLabel.textContent = formatLongMonth(calendarState.anchorDate);
      currentSummary.textContent = `Month schedule overview · ${calendarState.filteredEvents.length} event(s)`;
    } else if (calendarState.view === "day") {
      currentLabel.textContent = formatDateLabel(calendarState.anchorDate);
      currentSummary.textContent = `${getEventsForDate(calendarState.anchorDate).length} event(s) on this day`;
    } else {
      currentLabel.textContent = String(calendarState.anchorDate.getFullYear());
      currentSummary.textContent = `${calendarState.filteredEvents.length} event(s) this year`;
    }
  }

  function renderMiniCalendar() {
    const first = startOfMonth(calendarState.miniDate);
    const startWeekDay = first.getDay();
    const gridStart = addDays(first, -startWeekDay);

    miniTitle.textContent = formatLongMonth(calendarState.miniDate);

    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const date = addDays(gridStart, i);
      const iso = toISODate(date);
      const isCurrentMonth = date.getMonth() === calendarState.miniDate.getMonth();
      const isToday = iso === toISODate(new Date());
      const isSelected = iso === toISODate(calendarState.selectedDate);
      const classes = ["calendar-mini-day"];
      if (!isCurrentMonth) classes.push("is-muted");
      if (isToday) classes.push("is-today");
      if (isSelected) classes.push("is-selected");

      cells.push(`
        <button class="${classes.join(" ")}" data-mini-date="${iso}" type="button">
          ${date.getDate()}
        </button>
      `);
    }

    miniGrid.innerHTML = cells.join("");

    miniGrid.querySelectorAll("[data-mini-date]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const date = new Date(`${btn.dataset.miniDate}T00:00:00`);
        calendarState.anchorDate = startOfDay(date);
        setSelectedDate(date);
      });
    });
  }

  function renderLegend() {
    const grouped = new Map();

    calendarState.filteredEvents.forEach((event) => {
      const key = `${event.color}|${event.status}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          color: event.color,
          status: event.status,
          count: 0,
          latestTitle: event.title,
        });
      }
      grouped.get(key).count += 1;
    });

    if (!grouped.size) {
      legendList.innerHTML = `
        <div class="calendar-legend-item">
          <div class="calendar-legend-swatch" style="background:#94a3b8"></div>
          <div class="calendar-legend-text">
            <div class="calendar-legend-name">No events yet</div>
            <div class="calendar-legend-meta">Add a schedule item to start.</div>
          </div>
        </div>
      `;
      return;
    }

    legendList.innerHTML = Array.from(grouped.values())
      .slice(0, 8)
      .map((item) => `
        <div class="calendar-legend-item">
          <div class="calendar-legend-swatch" style="background:${item.color}"></div>
          <div class="calendar-legend-text">
            <div class="calendar-legend-name">${escapeHtml(item.latestTitle)}</div>
            <div class="calendar-legend-meta">${escapeHtml(item.status)} · ${item.count} item(s)</div>
          </div>
        </div>
      `)
      .join("");
  }

  function renderMonthView() {
    const first = startOfMonth(calendarState.anchorDate);
    const monthStartWeekDay = first.getDay();
    const gridStart = addDays(first, -monthStartWeekDay);

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const weekdayHtml = weekdays
      .map((day) => `<div class="calendar-weekday-cell">${day}</div>`)
      .join("");

    const dayCells = [];

    for (let i = 0; i < 42; i += 1) {
      const date = addDays(gridStart, i);
      const iso = toISODate(date);
      const isToday = iso === toISODate(new Date());
      const isSelected = iso === toISODate(calendarState.selectedDate);
      const isMuted = date.getMonth() !== calendarState.anchorDate.getMonth();

      const classes = ["calendar-day-cell"];
      if (isToday) classes.push("is-today");
      if (isSelected) classes.push("is-selected");
      if (isMuted) classes.push("is-muted");

      const dayEvents = getEventsForDate(date);
      const visibleEvents = dayEvents.slice(0, 3);
      const moreCount = Math.max(dayEvents.length - visibleEvents.length, 0);

      dayCells.push(`
        <div class="${classes.join(" ")}" data-calendar-date="${iso}">
          <div class="calendar-day-head">
            <button class="calendar-day-number" type="button" data-select-date="${iso}">${date.getDate()}</button>
          </div>
          <div class="calendar-day-events">
            ${visibleEvents.map((event) => renderEventChip(event)).join("")}
            ${moreCount ? `<button class="calendar-more-events" type="button" data-select-date="${iso}">+${moreCount} more</button>` : ""}
          </div>
        </div>
      `);
    }

    board.innerHTML = `
      <div class="calendar-month-view">
        <div class="calendar-month-weekdays">${weekdayHtml}</div>
        <div class="calendar-month-grid">${dayCells.join("")}</div>
      </div>
    `;

    wireMonthInteractions();
  }

  function renderEventChip(event) {
    return `
      <div
        class="calendar-event-chip status-${escapeHtml(event.status)}"
        data-event-id="${event.id}"
        draggable="true"
        style="background:${event.color}; ${event.all_day ? "" : `border-left:3px solid ${hexToRgba(event.color, 0.75)}`};"
        title="${escapeHtml(event.title)}"
      >
        ${escapeHtml(event.title)}
      </div>
    `;
  }

  function wireMonthInteractions() {
    board.querySelectorAll("[data-select-date]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const date = new Date(`${btn.dataset.selectDate}T00:00:00`);
        setSelectedDate(date);
      });
    });

    board.querySelectorAll(".calendar-event-chip").forEach((chip) => {
      chip.addEventListener("click", (event) => {
        event.stopPropagation();
        openEditModal(chip.dataset.eventId);
      });

      chip.addEventListener("dragstart", () => {
        calendarState.draggingEventId = chip.dataset.eventId;
      });

      chip.addEventListener("dragend", () => {
        calendarState.draggingEventId = null;
      });
    });

    board.querySelectorAll("[data-calendar-date]").forEach((cell) => {
      cell.addEventListener("click", () => {
        const date = new Date(`${cell.dataset.calendarDate}T00:00:00`);
        setSelectedDate(date);
      });

      cell.addEventListener("dblclick", () => {
        const date = new Date(`${cell.dataset.calendarDate}T00:00:00`);
        openCreateModal(date);
      });

      cell.addEventListener("dragover", (event) => {
        event.preventDefault();
        cell.classList.add("calendar-drop-target");
      });

      cell.addEventListener("dragleave", () => {
        cell.classList.remove("calendar-drop-target");
      });

      cell.addEventListener("drop", async (event) => {
        event.preventDefault();
        cell.classList.remove("calendar-drop-target");
        if (!calendarState.draggingEventId) return;

        const newDate = cell.dataset.calendarDate;
        const currentEvent = getEventById(calendarState.draggingEventId);
        if (!currentEvent) return;

        const originalStart = new Date(`${currentEvent.start_date}T00:00:00`);
        const originalEnd = new Date(`${currentEvent.end_date}T00:00:00`);
        const targetDate = new Date(`${newDate}T00:00:00`);
        const durationDays = Math.max(0, Math.round((originalEnd - originalStart) / 86400000));
        const newEnd = addDays(targetDate, durationDays);

        try {
          await updateEvent(currentEvent.id, {
            start_date: toISODate(targetDate),
            end_date: toISODate(newEnd),
          }, false);
          await fetchEvents();
        } catch (error) {
          console.error("Drag update error:", error);
          alert(error.message || "Failed to move event.");
        }
      });
    });
  }

  function renderDayView() {
    const selectedEvents = getEventsForDate(calendarState.anchorDate);
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour += 1) {
      timeSlots.push(`<div class="calendar-time-slot">${pad(hour)}:00</div>`);
    }

    board.innerHTML = `
      <div class="calendar-day-view">
        <div class="calendar-time-rail">${timeSlots.join("")}</div>
        <div class="calendar-day-columns" id="calendarDayColumns">
          ${new Array(24).fill(0).map(() => '<div class="calendar-day-slot"></div>').join("")}
          <div class="calendar-day-event-layer" id="calendarDayEventLayer"></div>
        </div>
      </div>
    `;

    const eventLayer = document.getElementById("calendarDayEventLayer");
    const slotHeight = 52;

    eventLayer.innerHTML = selectedEvents.map((event) => {
      const startHour = event.all_day ? 0 : Number(String(event.start_time || "00:00").split(":")[0]);
      const startMinute = event.all_day ? 0 : Number(String(event.start_time || "00:00").split(":")[1]);
      const endHour = event.all_day ? 23 : Number(String(event.end_time || event.start_time || "23:59").split(":")[0]);
      const endMinute = event.all_day ? 59 : Number(String(event.end_time || event.start_time || "23:59").split(":")[1]);

      const startPosition = ((startHour * 60) + startMinute) / 60 * slotHeight;
      const endPosition = ((endHour * 60) + endMinute) / 60 * slotHeight;
      const height = Math.max(slotHeight * 0.9, endPosition - startPosition);

      return `
        <div
          class="calendar-day-event-block"
          data-event-id="${event.id}"
          style="top:${startPosition}px; height:${height}px; background:${event.color};"
        >
          ${escapeHtml(event.title)}
          <span class="calendar-day-event-time">${event.all_day ? 'All day' : `${formatTimeLabel(event.start_time)} - ${formatTimeLabel(event.end_time)}`}</span>
        </div>
      `;
    }).join("");

    eventLayer.querySelectorAll("[data-event-id]").forEach((block) => {
      block.addEventListener("click", () => openEditModal(block.dataset.eventId));
    });

    currentSummary.textContent = selectedEvents.length
      ? `${selectedEvents.length} scheduled block(s)`
      : "No event on this day";
  }

  function renderYearView() {
    const year = calendarState.anchorDate.getFullYear();
    const monthsHtml = [];

    for (let month = 0; month < 12; month += 1) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = endOfMonth(monthStart);
      const startWeekDay = monthStart.getDay();
      const daysInMonth = monthEnd.getDate();
      const cells = [];

      for (let i = 0; i < startWeekDay; i += 1) {
        cells.push('<div class="calendar-year-day"></div>');
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const iso = toISODate(date);
        const hasEvents = getEventsForDate(date).length > 0;
        const isCurrent = iso === toISODate(new Date());
        const classes = ["calendar-year-day"];
        if (hasEvents) classes.push("has-events");
        if (isCurrent) classes.push("is-current");

        cells.push(`<button class="${classes.join(" ")}" data-year-date="${iso}" type="button">${day}</button>`);
      }

      monthsHtml.push(`
        <div class="calendar-year-month">
          <h4>${monthStart.toLocaleDateString("en-GB", { month: "long" })}</h4>
          <div class="calendar-year-grid">${cells.join("")}</div>
        </div>
      `);
    }

    board.innerHTML = `<div class="calendar-year-view">${monthsHtml.join("")}</div>`;

    board.querySelectorAll("[data-year-date]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const date = new Date(`${btn.dataset.yearDate}T00:00:00`);
        calendarState.view = "day";
        calendarState.anchorDate = date;
        calendarState.selectedDate = date;
        syncViewButtons();
        renderCalendar();
      });
    });
  }

  function syncViewButtons() {
    viewSwitchButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === calendarState.view);
    });
  }

  function resetForm() {
    eventForm.reset();
    eventIdField.value = "";
    deleteEventBtn.style.display = "none";
    modalTitle.textContent = "New event";
    const todayIso = toISODate(calendarState.selectedDate || new Date());
    startDateField.value = todayIso;
    endDateField.value = todayIso;
    startTimeField.value = "09:00";
    endTimeField.value = "10:00";
    colorField.value = "#2563eb";
    statusField.value = "scheduled";
    descriptionField.value = "";
    allDayField.checked = false;
    toggleTimeFields();
  }

  function openModal() {
    modalBackdrop.classList.remove("is-hidden");
  }

  function closeModal() {
    modalBackdrop.classList.add("is-hidden");
  }

  function toggleTimeFields() {
    timeFields.style.display = allDayField.checked ? "none" : "grid";
  }

  function fillFormFromEvent(event) {
    eventIdField.value = event.id;
    titleField.value = event.title || "";
    startDateField.value = event.start_date;
    endDateField.value = event.end_date;
    startTimeField.value = event.start_time || "";
    endTimeField.value = event.end_time || "";
    allDayField.checked = !!event.all_day;
    colorField.value = event.color || "#2563eb";
    statusField.value = event.status || "scheduled";
    descriptionField.value = event.description || "";
    deleteEventBtn.style.display = "inline-flex";
    modalTitle.textContent = "Edit event";
    toggleTimeFields();
  }

  function collectFormPayload() {
    const payload = {
      title: titleField.value.trim(),
      start_date: startDateField.value,
      end_date: endDateField.value,
      all_day: allDayField.checked,
      color: colorField.value,
      status: statusField.value,
      description: descriptionField.value.trim(),
    };

    if (!payload.all_day) {
      payload.start_time = startTimeField.value || "09:00";
      payload.end_time = endTimeField.value || payload.start_time;
    } else {
      payload.start_time = null;
      payload.end_time = null;
    }

    return payload;
  }

  function validatePayload(payload) {
    if (!payload.title) throw new Error("Event title is required.");
    if (!payload.start_date || !payload.end_date) throw new Error("Start and end dates are required.");
    if (payload.end_date < payload.start_date) throw new Error("End date cannot be before start date.");
    if (!payload.all_day && payload.end_time < payload.start_time) {
      throw new Error("End time cannot be before start time on the same day.");
    }
  }

  function openCreateModal(date = new Date()) {
    resetForm();
    const iso = toISODate(date);
    startDateField.value = iso;
    endDateField.value = iso;
    openModal();
  }

  function openEditModal(eventId) {
    const event = getEventById(eventId);
    if (!event) return;
    resetForm();
    fillFormFromEvent(event);
    openModal();
  }

  async function createEvent(payload) {
    return apiRequest(CALENDAR_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async function updateEvent(eventId, payload, reload = true) {
    const response = await apiRequest(`${CALENDAR_API}${eventId}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (reload) await fetchEvents();
    return response;
  }

  async function deleteEvent(eventId) {
    return apiRequest(`${CALENDAR_API}${eventId}/`, {
      method: "DELETE",
    });
  }

  eventForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const payload = collectFormPayload();
      validatePayload(payload);

      if (eventIdField.value) {
        await updateEvent(eventIdField.value, payload, false);
      } else {
        await createEvent(payload);
      }

      closeModal();
      await fetchEvents();
    } catch (error) {
      console.error("Save calendar event error:", error);
      alert(error.message || "Failed to save event.");
    }
  });

  deleteEventBtn?.addEventListener("click", async () => {
    if (!eventIdField.value) return;
    if (!confirm("Delete this event?")) return;

    try {
      await deleteEvent(eventIdField.value);
      closeModal();
      await fetchEvents();
    } catch (error) {
      console.error("Delete event error:", error);
      alert(error.message || "Failed to delete event.");
    }
  });

  allDayField?.addEventListener("change", toggleTimeFields);
  openModalBtn?.addEventListener("click", () => openCreateModal(calendarState.selectedDate));
  closeModalBtn?.addEventListener("click", closeModal);
  cancelModalBtn?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeModal();
  });

  todayBtn?.addEventListener("click", () => {
    const today = startOfDay(new Date());
    calendarState.anchorDate = today;
    calendarState.selectedDate = today;
    calendarState.miniDate = startOfMonth(today);
    renderCalendar();
  });

  prevBtn?.addEventListener("click", () => {
    if (calendarState.view === "month") {
      calendarState.anchorDate = addMonths(calendarState.anchorDate, -1);
      calendarState.miniDate = startOfMonth(calendarState.anchorDate);
    } else if (calendarState.view === "day") {
      calendarState.anchorDate = addDays(calendarState.anchorDate, -1);
      calendarState.selectedDate = calendarState.anchorDate;
      calendarState.miniDate = startOfMonth(calendarState.anchorDate);
    } else {
      calendarState.anchorDate = addYears(calendarState.anchorDate, -1);
      calendarState.miniDate = startOfMonth(calendarState.anchorDate);
    }
    renderCalendar();
  });

  nextBtn?.addEventListener("click", () => {
    if (calendarState.view === "month") {
      calendarState.anchorDate = addMonths(calendarState.anchorDate, 1);
      calendarState.miniDate = startOfMonth(calendarState.anchorDate);
    } else if (calendarState.view === "day") {
      calendarState.anchorDate = addDays(calendarState.anchorDate, 1);
      calendarState.selectedDate = calendarState.anchorDate;
      calendarState.miniDate = startOfMonth(calendarState.anchorDate);
    } else {
      calendarState.anchorDate = addYears(calendarState.anchorDate, 1);
      calendarState.miniDate = startOfMonth(calendarState.anchorDate);
    }
    renderCalendar();
  });

  viewSwitchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      calendarState.view = button.dataset.view;
      syncViewButtons();
      renderCalendar();
    });
  });

  miniPrevBtn?.addEventListener("click", () => {
    calendarState.miniDate = addMonths(calendarState.miniDate, -1);
    renderMiniCalendar();
  });

  miniNextBtn?.addEventListener("click", () => {
    calendarState.miniDate = addMonths(calendarState.miniDate, 1);
    renderMiniCalendar();
  });

  searchInput?.addEventListener("input", (() => {
    let timer;
    return (event) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        calendarState.search = event.target.value || "";
        renderCalendar();
      }, 250);
    };
  })());

  syncViewButtons();
  resetForm();
  fetchEvents();
})();


/* =========================================
   SETTINGS PAGE - DJANGO INTEGRATION
========================================= */
(function () {
  const settingsTabButtons = document.querySelectorAll(".settings-tab-btn");
  const settingsTabPanels = document.querySelectorAll(".settings-tab-panel");
  const settingsMessage = document.getElementById("settingsMessage");

  const refreshSettingsBtn = document.getElementById("refreshSettingsBtn");

  const settingsProfileForm = document.getElementById("settingsProfileForm");
  const settingsDetailsForm = document.getElementById("settingsDetailsForm");
  const settingsPasswordForm = document.getElementById("settingsPasswordForm");

  const resetProfileSettingsBtn = document.getElementById("resetProfileSettingsBtn");
  const resetDetailsSettingsBtn = document.getElementById("resetDetailsSettingsBtn");
  const resetPasswordSettingsBtn = document.getElementById("resetPasswordSettingsBtn");

  if (!settingsProfileForm || !settingsDetailsForm || !settingsPasswordForm) return;

  const SETTINGS_USERS_API = `${API_BASE_URL}/api/users/`;

  let settingsState = {
    user: null,
  };

  function showSettingsMessage(message, type = "success") {
    if (!settingsMessage) return;
    settingsMessage.textContent = message;
    settingsMessage.className = `settings-message ${type}`;
    settingsMessage.classList.remove("is-hidden");

    setTimeout(() => {
      settingsMessage.classList.add("is-hidden");
    }, 3200);
  }

  function setActiveSettingsTab(tabName) {
    settingsTabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.settingsTab === tabName);
    });

    settingsTabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.settingsPanel === tabName);
    });
  }

  settingsTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveSettingsTab(btn.dataset.settingsTab);
    });
  });

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

  function roleLabel(role) {
    const map = {
      admin: "Admin",
      donor: "Donor",
      volunteer: "Volunteer",
    };
    return map[(role || "").toLowerCase()] || (role || "Unknown");
  }

  function statusLabel(status) {
    const map = {
      active: "Active",
      paused: "Paused",
      terminated: "Terminated",
    };
    return map[(status || "").toLowerCase()] || (status || "Unknown");
  }

  function getFullName(user = {}) {
    if (user.full_name) return user.full_name;
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User";
  }

  function fillSettingsUI(user) {
    settingsState.user = user;

    const fullName = getFullName(user);
    const photo = user.profile_photo || "https://i.pravatar.cc/140?img=12";

    document.getElementById("settingsUserId").value = user.id || "";

    document.getElementById("settingsProfilePhoto").src = photo;
    document.getElementById("settingsProfilePhoto").alt = fullName;
    document.getElementById("settingsProfilePhotoInput").value = user.profile_photo || "";

    document.getElementById("settingsFullName").textContent = fullName;
    document.getElementById("settingsEmailHero").textContent = user.email || "-";
    document.getElementById("settingsRoleHero").textContent = roleLabel(user.role);
    document.getElementById("settingsStatusHero").textContent = statusLabel(user.status);
    document.getElementById("settingsVerifiedHero").textContent = user.verified ? "Verified" : "Not verified";

    document.getElementById("settingsFirstName").value = user.first_name || "";
    document.getElementById("settingsLastName").value = user.last_name || "";
    document.getElementById("settingsUsername").value = user.username || "";
    document.getElementById("settingsRole").value = user.role || "donor";
    document.getElementById("settingsStatus").value = user.status || "paused";
    document.getElementById("settingsVerified").checked = !!user.verified;

    document.getElementById("settingsEmail").value = user.email || "";
    document.getElementById("settingsPhone").value = user.phone || "";
    document.getElementById("settingsRegCode").value = user.reg_code || "";
    document.getElementById("settingsFullNameReadOnly").value = fullName;
    document.getElementById("settingsCreatedAt").value = formatDateTime(user.created_at);
    document.getElementById("settingsLastSeen").value = user.last_seen_human || "-";
    document.getElementById("settingsUpdatedAt").value = formatDateTime(user.updated_at);
  }

  async function fetchSettingsUser() {
    try {
      const response = await fetch(`${SETTINGS_USERS_API}?page=1&page_size=1`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to load settings user.");

      const data = await response.json();
      const user = data?.results?.[0];

      if (!user) {
        throw new Error("No active user record found.");
      }

      fillSettingsUI(user);
    } catch (error) {
      console.error("Settings load error:", error);
      showSettingsMessage(error.message || "Failed to load settings.", "error");
    }
  }

  async function patchSettingsUser(payload) {
    const userId = document.getElementById("settingsUserId").value;

    if (!userId) {
      throw new Error("User ID missing.");
    }

    const response = await fetch(`${SETTINGS_USERS_API}${userId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update settings.";
      try {
        const err = await response.json();
        errorMessage = typeof err === "object" ? JSON.stringify(err) : errorMessage;
      } catch (_) {}
      throw new Error(errorMessage);
    }

    return response.json();
  }

  settingsProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const payload = {
        first_name: document.getElementById("settingsFirstName").value.trim(),
        last_name: document.getElementById("settingsLastName").value.trim(),
        username: document.getElementById("settingsUsername").value.trim(),
        profile_photo: document.getElementById("settingsProfilePhotoInput").value.trim(),
        role: document.getElementById("settingsRole").value,
        status: document.getElementById("settingsStatus").value,
        verified: document.getElementById("settingsVerified").checked,
      };

      const updatedUser = await patchSettingsUser(payload);
      fillSettingsUI(updatedUser);
      showSettingsMessage("Profile updated successfully.", "success");
    } catch (error) {
      console.error("Profile settings update error:", error);
      showSettingsMessage(error.message || "Failed to update profile.", "error");
    }
  });

  settingsDetailsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const payload = {
        email: document.getElementById("settingsEmail").value.trim(),
        phone: document.getElementById("settingsPhone").value.trim(),
      };

      const updatedUser = await patchSettingsUser(payload);
      fillSettingsUI(updatedUser);
      showSettingsMessage("Details updated successfully.", "success");
    } catch (error) {
      console.error("Details settings update error:", error);
      showSettingsMessage(error.message || "Failed to update details.", "error");
    }
  });

  settingsPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("settingsCurrentPassword").value;
    const newPassword = document.getElementById("settingsNewPassword").value;
    const confirmPassword = document.getElementById("settingsConfirmPassword").value;

    if (newPassword.length < 8) {
      showSettingsMessage("New password must be at least 8 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showSettingsMessage("New password and confirmation do not match.", "error");
      return;
    }

    try {
      const userId = document.getElementById("settingsUserId").value;

      const response = await fetch(`${SETTINGS_USERS_API}${userId}/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Password update failed.";
        try {
          const err = await response.json();
          errorMessage = err.message || err.error || JSON.stringify(err);
        } catch (_) {}
        throw new Error(errorMessage);
      }

      settingsPasswordForm.reset();
      showSettingsMessage("Password updated successfully.", "success");
    } catch (error) {
      console.error("Password update error:", error);
      showSettingsMessage(
        error.message || "Password update needs a backend endpoint.",
        "error"
      );
    }
  });

  resetProfileSettingsBtn?.addEventListener("click", () => {
    if (settingsState.user) fillSettingsUI(settingsState.user);
  });

  resetDetailsSettingsBtn?.addEventListener("click", () => {
    if (settingsState.user) fillSettingsUI(settingsState.user);
  });

  resetPasswordSettingsBtn?.addEventListener("click", () => {
    settingsPasswordForm.reset();
  });

  refreshSettingsBtn?.addEventListener("click", fetchSettingsUser);

  fetchSettingsUser();
})();