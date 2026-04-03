class NavbarComponent extends HTMLElement {
connectedCallback(){
    this.innerHTML=`<!-- navigation -->
    <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container-fluid px-lg-5">
            <!-- left logo -->
            <a class="navbar-brand" href="#"><img src="https://placehold.co/120x50/2F394C/white?text=Umbrella+Care" alt="Umbrella logo"></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" title="">
                <span class="navbar-toggler-icon" style="filter: invert(1);"></span>
            </button>
            <div class="collapse navbar-collapse" id="mainNavbar">
                <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="#about">About</a></li>
                    <!-- Needs dropdown -->
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Needs</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="volunteer.html"><i class="far fa-calendar-check me-2"></i>Volunteer</a></li>
                            <li><a class="dropdown-item" href="#"><i class="fas fa-boxes me-2"></i>Resources</a></li>
                        </ul>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
                    <li class="nav-item"><a class="nav-link" href="#about">About us</a></li>
                </ul>
                <div class="d-flex align-items-center">
                    <button class="mode-toggle" id="themeToggle"><i class="fas fa-palette me-1"></i>light/dark</button>
                    <a href="auth.html" class="btn btn-login">Log in</a>
                    <a href="#" class="btn btn-signup">Sign up</a>
                </div>
            </div>
        </div>
    </nav>`
}
}

customElements.define('main-navbar-component', NavbarComponent);