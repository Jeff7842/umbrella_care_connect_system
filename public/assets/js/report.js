const API_BASE_URL = "http://127.0.0.1:8000";
// Or use this instead if frontend is served through Django:
// const API_BASE_URL = window.location.origin;

const reportTypeEl = document.getElementById("reportType");
const startDateEl = document.getElementById("startDate");
const endDateEl = document.getElementById("endDate");
const generateBtn = document.getElementById("generateBtn");
const exportBtn = document.getElementById("exportBtn");
const summaryCards = document.getElementById("summaryCards");
const reportTable = document.getElementById("reportTable");
const thead = reportTable.querySelector("thead");
const tbody = reportTable.querySelector("tbody");

function getToday() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function getFirstDayOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

function setDefaults() {
  startDateEl.value = getFirstDayOfMonth();
  endDateEl.value = getToday();
}

function buildQuery() {
  return new URLSearchParams({
    report_type: reportTypeEl.value,
    start_date: startDateEl.value,
    end_date: endDateEl.value,
  }).toString();
}

function renderSummary(reportType, summary) {
  let html = `
    <div class="card">
      <h4>Total Records</h4>
      <p>${summary.count ?? 0}</p>
    </div>
  `;

  if (reportType === "donations") {
    html += `
      <div class="card">
        <h4>Cash Total</h4>
        <p>${summary.cash_total ?? 0}</p>
      </div>
      <div class="card">
        <h4>In-Kind Donations</h4>
        <p>${summary.in_kind_count ?? 0}</p>
      </div>
    `;
  } else if (reportType === "needs") {
    html += `
      <div class="card">
        <h4>Total Needed</h4>
        <p>${summary.total_needed ?? 0}</p>
      </div>
      <div class="card">
        <h4>Total Received</h4>
        <p>${summary.total_received ?? 0}</p>
      </div>
    `;
  } else if (reportType === "volunteers") {
    html += `
      <div class="card">
        <h4>Confirmed</h4>
        <p>${summary.confirmed_count ?? 0}</p>
      </div>
      <div class="card">
        <h4>Attended</h4>
        <p>${summary.attended_count ?? 0}</p>
      </div>
    `;
  }

  summaryCards.innerHTML = html;
}

function renderTable(headers, rows) {
  thead.innerHTML = `
    <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
  `;

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${headers.length}">No records found for this period.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows.map(row => `
    <tr>${row.map(cell => `<td>${cell ?? "-"}</td>`).join("")}</tr>
  `).join("");
}

async function loadReport() {
  const query = buildQuery();

  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/?${query}`, {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to load report");
    }

    const data = await response.json();
    renderSummary(data.report_type, data.summary);
    renderTable(data.headers, data.rows);
  } catch (error) {
    console.error("Report load error:", error);
    summaryCards.innerHTML = `<div class="card"><p>Failed to load report.</p></div>`;
    thead.innerHTML = "";
    tbody.innerHTML = "";
  }
}

function exportReport() {
  const query = buildQuery();
  window.open(`${API_BASE_URL}/api/reports/export/?${query}`, "_blank");
}

generateBtn.addEventListener("click", loadReport);
exportBtn.addEventListener("click", exportReport);

setDefaults();
loadReport();