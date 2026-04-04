class SidebarComponent extends HTMLElement {
connectedCallback(){
    this.innerHTML=`
    <!-- SIDEBAR-->
  <div class="admin-sidebar">
    <div class="logo-area">
      <i class="bi bi-umbrella fs-1" style="color: var(--);"></i> <span>Umbrella</span>Care
    </div>
    <div class="nav-item" data-page="dashboard"><i class="bi bi-speedometer2"></i> Dashboard</div>
    <div class="nav-item" data-page="calendar"><i class="bi bi-calendar-event"></i> Calendar</div>
    <div class="nav-item" data-page="opportunities"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school-icon lucide-school"><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M18 4.933V21"/><path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"/><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"/><path d="M6 4.933V21"/><circle cx="12" cy="9" r="2"/></svg>Opportunities</div>
    <div class="nav-item" data-page="volunteers"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history-icon lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>Volunteer History</div>
    
    
    <hr>
    <div class="text-muted small mb-3 px-3"></div>
    <!-- extra shortcut -->
    
    <div class="nav-item" data-page="reports"><i class="bi bi-file-earmark-text"></i> Report</div>
    <div class="nav-item" data-page="settings"><i class="bi bi-gear"></i> Setting</div>
    <div class="nav-item" style="display: none;" data-page="privacy"><i class="bi bi-shield-lock"></i> Privacy</div>
    <!-- theme toggle inside sidebar (optional) -->
    <div style="margin-top: 3rem;">
      <div class="mode-toggle text-center" id="themeToggleSide"><i class="bi bi-palette me-2"></i>light/dark</div>
    </div>

    <!-- logout -->
    <div style="margin-top: 1.3rem;">
      <div class="logout-btn text-center" id="logout"><i class="bi bi-box-arrow-right me-2"></i>Logout</div>
    </div>
  </div>`

}
}

customElements.define('sidebar-component', SidebarComponent);