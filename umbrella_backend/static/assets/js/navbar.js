class NavbarComponent extends HTMLElement {
connectedCallback(){
    this.innerHTML=`<div class="dashboard-navbar">
  <div class="navbar-left">
    <div class="navbar-greeting">Hello, Elias 👋</div>
    <div class="navbar-date" id="currentDate">23 September 2026</div>
  </div>


<div class="dashboard-search navbar-center">
      <i class="bi bi-search"></i>
      <input type="text" placeholder="Search donations, needs..." />
    </div>

  <div class="navbar-right">
    <button class="nav-icon-btn" id="themeToggle" type="button" title="Toggle theme">
      <i class="bi bi-sun"></i>
      <i class="bi bi-moon"></i>
    </button>

    <button class="nav-icon-btn" type="button" title="Notifications">
      <i class="bi bi-bell"></i>
    </button>

    <div class="profile-chip">
      <img src="https://ui-avatars.com/api/?name=Elias&background=F4A623&color=fff&bold=true" alt="Elias">
      <div class="profile-info">
        <span class="profile-name">Elias Mutahi</span>
        <span class="profile-role">CEO Umbrella Care </span>
      </div>
      <i class="bi bi-chevron-right"></i>
    </div>
  </div>
</div>`
}
}

customElements.define('navbar-component', NavbarComponent);