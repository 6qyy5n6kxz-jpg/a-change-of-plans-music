const page = document.body.dataset.page || "";
const siteRoot = document.body.dataset.siteRoot || ".";

const normalizePath = (value) => value.replace(/\/{2,}/g, "/").replace(/\/\.\//g, "/");

export const resolveSitePath = (relativePath) => {
  if (/^(?:https?:)?\/\//.test(relativePath) || relativePath.startsWith("#")) return relativePath;
  const cleanPath = relativePath.replace(/^\//, "");
  const base = siteRoot === "." ? "" : siteRoot.replace(/\/$/, "");
  return normalizePath(base ? `${base}/${cleanPath}` : cleanPath) || "./";
};

window.resolveSitePath = resolveSitePath;

const headerTarget = document.querySelector("[data-site-header]");
const footerTarget = document.querySelector("[data-site-footer]");
const link = (label, href, activePage, className = "") => {
  const current = page === activePage ? ' aria-current="page"' : "";
  const classes = className ? ` class="${className}"` : "";
  return `<a href="${resolveSitePath(href)}"${classes}${current}>${label}</a>`;
};

if (headerTarget) {
  headerTarget.innerHTML = `
    <header class="site-header">
      <div class="container site-header-inner">
        <a class="brand-lockup" href="${resolveSitePath("/")}" aria-label="A Change Of Plans home">
          <img class="brand-mark" src="${resolveSitePath("images/colored-logo.svg")}" width="1024" height="1024" alt="" aria-hidden="true">
          <span><strong>A Change Of Plans</strong><span>Live music for Northwest Ohio</span></span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav class="site-nav" id="site-nav" aria-label="Main navigation" hidden>
          ${link("Home", "/", "home")}
          ${link("About", "/about/", "about")}
          <details class="nav-group"${["weddings", "restaurants", "festivals", "churches"].includes(page) ? " open" : ""}>
            <summary>Events</summary>
            <div class="nav-submenu">
              ${link("Weddings & Private Events", "/weddings-private-events/", "weddings")}
              ${link("Restaurants & Bars", "/restaurants-bars/", "restaurants")}
              ${link("Festivals & Community Events", "/festivals-community-events/", "festivals")}
              ${link("Churches", "/churches/", "churches")}
            </div>
          </details>
          ${link("Shows", "/shows/", "shows")}
          ${link("Song List", "/song-list/", "songs")}
          ${link("Pricing", "/pricing/", "pricing")}
          ${link("Book Us", "/contact/", "contact", "nav-cta")}
        </nav>
      </div>
    </header>`;
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
            <p>Devin Frank and Kendra German perform familiar songs with piano, guitar, and two lead vocalists.</p>
            <p>Based in Northwest Ohio and serving Toledo, Port Clinton, Fremont, Bowling Green, and surrounding communities.</p>
          </div>
          <div>
            <h3>Plan an event</h3>
            <p><a href="${resolveSitePath("/weddings-private-events/")}">Weddings & private events</a></p>
            <p><a href="${resolveSitePath("/restaurants-bars/")}">Restaurants & bars</a></p>
            <p><a href="${resolveSitePath("/festivals-community-events/")}">Festivals & community events</a></p>
            <p><a href="${resolveSitePath("/churches/")}">Churches</a></p>
            <p><a href="${resolveSitePath("/pricing/")}">Pricing</a></p>
          </div>
          <div>
            <h3>Listen & connect</h3>
            <p><a href="${resolveSitePath("/shows/")}">Upcoming shows</a></p>
            <p><a href="${resolveSitePath("/song-list/")}">Search the song list</a></p>
            <p><a href="${resolveSitePath("/live/")}">At the Show</a></p>
            <p><a href="https://www.facebook.com/AChangeOfPlans419" target="_blank" rel="noreferrer">Facebook</a> · <a href="https://www.instagram.com/AChangeofPlansduo" target="_blank" rel="noreferrer">Instagram</a></p>
            <a class="button button-primary footer-cta" href="${resolveSitePath("/contact/")}">Check Availability</a>
          </div>
        </div>
        <div class="footer-utility"><a href="${resolveSitePath("/about/")}">About</a><a href="${resolveSitePath("/contact/")}">Contact</a></div>
        <p class="footer-legal">&copy; <span data-current-year></span> A Change Of Plans.</p>
      </div>
    </footer>`;
}

document.querySelectorAll("[data-current-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });

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
  siteNav.querySelectorAll("a").forEach((item) => item.addEventListener("click", () => {
    if (window.innerWidth < 960) closeNav();
  }));
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) {
      siteNav.hidden = false;
      navToggle.setAttribute("aria-expanded", "true");
    } else closeNav();
  });
  if (window.innerWidth >= 960) {
    siteNav.hidden = false;
    navToggle.setAttribute("aria-expanded", "true");
  }
}
