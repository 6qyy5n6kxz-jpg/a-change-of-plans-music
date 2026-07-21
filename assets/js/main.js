const page = document.body.dataset.page || "";
const siteRoot = document.body.dataset.siteRoot || ".";

const normalizePath = (value) => value.replace(/\/{2,}/g, "/").replace(/\/\.\//g, "/");

export const resolveSitePath = (relativePath) => {
  if (/^(?:https?:)?\/\//.test(relativePath) || relativePath.startsWith("#")) {
    return relativePath;
  }

  const cleanPath = relativePath.replace(/^\//, "");
  const base = siteRoot === "." ? "" : siteRoot.replace(/\/$/, "");
  const resolved = base ? `${base}/${cleanPath}` : cleanPath;
  return normalizePath(resolved || "./");
};

window.resolveSitePath = resolveSitePath;

const headerTarget = document.querySelector("[data-site-header]");
const footerTarget = document.querySelector("[data-site-footer]");

const navItems = [
  { label: "Home", href: "/", activePage: "home" },
  { label: "Schedule", href: "/#upcoming-schedule" },
  { label: "Song List", href: "/#song-list" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Booking", href: "/contact/", activePage: "contact" }
];

const navMarkup = navItems.map((item) => {
  const current = page === item.activePage ? ' aria-current="page"' : "";
  return `<a href="${resolveSitePath(item.href)}"${current}>${item.label}</a>`;
}).join("");

if (headerTarget) {
  headerTarget.innerHTML = `
    <header class="site-header">
      <div class="container site-header-inner">
        <a class="brand-lockup" href="${resolveSitePath("/")}" aria-label="A Change Of Plans home">
          <img class="brand-mark" src="${resolveSitePath("images/colored-logo.svg")}" width="1024" height="1024" alt="" aria-hidden="true">
          <span><strong>A Change Of Plans</strong><span>Acoustic solo and duo</span></span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav class="site-nav" id="site-nav" aria-label="Main navigation" hidden>
          ${navMarkup}
        </nav>
      </div>
    </header>
  `;
}

if (footerTarget) {
  footerTarget.innerHTML = `
    <footer class="site-footer">
      <div class="container site-footer-inner">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="footer-logo-link acop-footer-logo-link" href="${resolveSitePath("/")}" aria-label="A Change Of Plans home">
              <img class="footer-logo acop-footer-logo" src="${resolveSitePath("images/colored-logo.svg")}" width="1024" height="1024" alt="A Change Of Plans">
            </a>
            <h3>A Change Of Plans</h3>
            <p>Acoustic solo and duo featuring vocals, guitar, and piano.</p>
            <p>Performing across Northwest Ohio and Southeast Michigan.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <p><a href="${resolveSitePath("/#upcoming-schedule")}">Upcoming Schedule</a></p>
            <p><a href="${resolveSitePath("/#song-list")}">Search the Song List</a></p>
            <p><a href="${resolveSitePath("/#pricing")}">Solo and Duo Pricing</a></p>
            <p><a href="${resolveSitePath("/contact/")}">Request Availability</a></p>
          </div>
          <div>
            <h3>Follow</h3>
            <p><a href="https://www.facebook.com/AChangeOfPlans419" target="_blank" rel="noreferrer">Facebook</a></p>
            <p><a href="https://www.instagram.com/AChangeofPlansduo" target="_blank" rel="noreferrer">Instagram</a></p>
            <a class="button button-primary footer-cta" href="${resolveSitePath("/contact/")}">Start a Booking Inquiry</a>
          </div>
        </div>
        <p class="footer-legal">&copy; <span data-current-year></span> A Change Of Plans.</p>
      </div>
    </footer>
  `;
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  const closeNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.hidden = true;
  };

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.hidden = expanded;
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 960) closeNav();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) {
      siteNav.hidden = false;
      navToggle.setAttribute("aria-expanded", "true");
    } else {
      closeNav();
    }
  });

  if (window.innerWidth >= 960) {
    siteNav.hidden = false;
    navToggle.setAttribute("aria-expanded", "true");
  }
}
