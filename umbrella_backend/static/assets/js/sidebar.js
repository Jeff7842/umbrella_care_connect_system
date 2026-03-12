class SidebarComponent extends HTMLElement {
connectedCallback(){
    this.innerHTML=`
    <!-- SIDEBAR-->
  <div class="admin-sidebar">
    <div class="logo-area">
      <i class="bi bi-umbrella fs-1" style="color: var(--);"></i> <span>Umbrella</span>Care
    </div>
    <div class="nav-item active" data-page="analytics"><i class="bi bi-bar-chart-steps"></i> Analytics</div>
    <div class="nav-item" data-page="dashboard"><i class="bi bi-speedometer2"></i> Dashboard</div>
    <div class="nav-item" data-page="messages"><i class="bi bi-chat-dots"></i> Messages</div>
    <div class="nav-item" data-page="calendar"><i class="bi bi-calendar-event"></i> Calendar</div>
    <div class="nav-item" data-page="needs"><i class="bi bi-basket"></i> Needs</div>
    <div class="nav-item" data-page="donations"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M16 3C10.486 3 6 7.486 6 13s4.486 10 10 10s10-4.486 10-10S21.514 3 16 3m0 2c4.411 0 8 3.589 8 8s-3.589 8-8 8s-8-3.589-8-8s3.589-8 8-8m-1 2v1.19a3.08 3.08 0 0 0-1.674 1.464a2.92 2.92 0 0 0-.264 1.945a3.06 3.06 0 0 0 .822 1.516c.273.273.598.494.956.647S15.59 14 16 14q.215.001.396.076a.96.96 0 0 1 .528.528q.075.181.076.396a.98.98 0 0 1-.604.924q-.181.075-.396.076q-.215-.001-.396-.076a1 1 0 0 1-.317-.211A1 1 0 0 1 15 15h-2a2.94 2.94 0 0 0 .857 2.076a3.1 3.1 0 0 0 1.143.735V19h2v-1.19a3.02 3.02 0 0 0 1.96-2.335a2.94 2.94 0 0 0-.478-2.145a3.1 3.1 0 0 0-.812-.812a3 3 0 0 0-1.07-.456A3 3 0 0 0 16 12q-.215-.001-.396-.076a.96.96 0 0 1-.528-.528A1 1 0 0 1 15 11q.001-.215.076-.396a.96.96 0 0 1 .528-.528q.181-.075.396-.076c.57 0 1 .43 1 1h2a3 3 0 0 0-.148-.924A3.05 3.05 0 0 0 17 8.19V7zM2 21v8h2v-6h5.38a12 12 0 0 1-2.3-2zm22.92 0a12 12 0 0 1-2.3 2H28v6h2v-8zM6 25v2h20v-2z"/></svg>Donations</div>
    <div class="nav-item" data-page="volunteers"><i class="bi bi-people"></i> Volunteers</div>
    <div class="nav-item" data-page="stock"><i class="bi bi-boxes"></i> Stock</div>
    <div class="nav-item" data-page="user-management"><i class="bi bi-people"></i> User Management</div>
    
    
    <hr>
    <div class="text-muted small mb-3 px-3"></div>
    <!-- extra shortcut -->
    
    <div class="nav-item" data-page="reports"><i class="bi bi-file-earmark-text"></i> Report</div>
    <div class="nav-item" data-page="settings"><i class="bi bi-gear"></i> Setting</div>
    <div class="nav-item" data-page="privacy"><i class="bi bi-shield-lock"></i> Privacy</div>
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