/**
 * CinemaX — Shared Layout Module
 * Injects navbar, mobile drawer, footer, bottom nav, search overlay
 * and wires all interactive behaviour.
 */

/* ── Nav link config ──────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home',         href: 'index.html',        icon: 'fa-house' },
  { label: 'Movies',       href: 'movies.html',        icon: 'fa-film' },
  { label: 'TV Shows',     href: 'tvshows.html',       icon: 'fa-tv' },
  { label: 'Anime',        href: 'anime.html',         icon: 'fa-star' },
  { label: 'Trending',     href: 'trending.html',      icon: 'fa-fire' },
  { label: 'New Releases', href: 'new-releases.html',  icon: 'fa-bolt' },
  { label: 'My List',      href: 'mylist.html',        icon: 'fa-bookmark' },
];

const ACCOUNT_LINKS = [
  { label: 'Profile',  href: 'profile.html',  icon: 'fa-user' },
  { label: 'Settings', href: 'settings.html', icon: 'fa-gear' },
  { label: 'Support',  href: 'support.html',  icon: 'fa-circle-question' },
];

const BOTTOM_NAV = [
  { label: 'Home',    href: 'index.html',    icon: 'fa-house' },
  { label: 'Search',  href: '#search',       icon: 'fa-search',  id: 'bn-search' },
  { label: 'Browse',  href: 'movies.html',   icon: 'fa-compass' },
  { label: 'My List', href: 'mylist.html',   icon: 'fa-bookmark' },
  { label: 'Profile', href: 'profile.html',  icon: 'fa-user' },
];

/* ── Determine current page ─────────────────────────────── */
function currentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}
function isActive(href) {
  return currentPage() === href ? 'active' : '';
}

/* ── Build navbar HTML ──────────────────────────────────── */
function buildNavbar() {
  const desktopLinks = NAV_LINKS.map(l =>
    `<a href="${l.href}" class="${isActive(l.href)}">${l.label}</a>`
  ).join('');

  return /* html */`
    <nav class="navbar" id="navbar">
      <a href="index.html" class="nav-logo">Cinema<span>X</span></a>

      <div class="nav-links" role="navigation" aria-label="Main navigation">
        ${desktopLinks}
      </div>

      <div class="nav-actions">
        <button class="nav-search-btn" id="nav-search-open" aria-label="Search">
          <i class="fas fa-search"></i>
          <span class="search-text">Search…</span>
        </button>

        <div class="nav-bell" id="nav-bell" aria-label="Notifications" role="button">
          <i class="fas fa-bell"></i>
          <span class="badge-dot"></span>
        </div>

        <!-- Logged out -->
        <div id="nav-login-btn">
          <button class="btn btn-primary btn-sm" id="login-btn">Sign In</button>
        </div>

        <!-- Logged in -->
        <div id="nav-avatar-wrap">
          <div id="nav-profile">
            <img src="https://i.pravatar.cc/80?img=11" alt="User Avatar" class="nav-avatar" id="nav-avatar-img">
            <div class="profile-dropdown" id="profile-dropdown">
              <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
              <a href="settings.html"><i class="fas fa-gear"></i> Settings</a>
              <a href="mylist.html"><i class="fas fa-bookmark"></i> My List</a>
              <div class="dropdown-divider"></div>
              <a href="support.html"><i class="fas fa-circle-question"></i> Help</a>
              <a href="#" id="logout-btn"><i class="fas fa-right-from-bracket"></i> Sign Out</a>
            </div>
          </div>
        </div>

        <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `;
}

/* ── Build mobile drawer ───────────────────────────────── */
function buildDrawer() {
  const mainLinks = NAV_LINKS.map(l =>
    `<a href="${l.href}" class="${isActive(l.href)}"><i class="fas ${l.icon}"></i>${l.label}</a>`
  ).join('');
  const accLinks = ACCOUNT_LINKS.map(l =>
    `<a href="${l.href}" class="${isActive(l.href)}"><i class="fas ${l.icon}"></i>${l.label}</a>`
  ).join('');

  return /* html */`
    <div class="drawer-overlay" id="drawer-overlay"></div>
    <aside class="mobile-drawer" id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div class="drawer-header">
        <span class="drawer-logo">Cinema<span style="color:#fff">X</span></span>
        <button class="drawer-close" id="drawer-close" aria-label="Close menu"><i class="fas fa-xmark"></i></button>
      </div>

      <div class="drawer-user" id="drawer-user-area">
        <img src="https://i.pravatar.cc/80?img=11" alt="" class="drawer-user-avatar" id="drawer-avatar">
        <div>
          <div class="drawer-user-name" id="drawer-user-name">Guest</div>
          <div class="drawer-user-sub" id="drawer-user-sub">Sign in for full access</div>
        </div>
      </div>

      <nav class="drawer-nav">
        <div class="drawer-section-label">Browse</div>
        ${mainLinks}
        <div class="drawer-section-label">Account</div>
        ${accLinks}
        <a href="#" id="drawer-login-link"><i class="fas fa-right-to-bracket"></i>Sign In</a>
      </nav>

      <div class="drawer-footer">
        <p>© 2026 CinemaX. All rights reserved.</p>
      </div>
    </aside>
  `;
}

/* ── Build footer ──────────────────────────────────────── */
function buildFooter() {
  return /* html */`
    <footer class="footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="brand-logo">Cinema<span style="color:#fff">X</span></a>
          <p>The premium destination for movie and TV series discovery. Experience the cinematic world like never before, on any device.</p>
          <div class="footer-social">
            <a href="https://www.facebook.com"  target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://www.tiktok.com"    target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.youtube.com"   target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            <a href="https://www.twitter.com"   target="_blank" rel="noopener" aria-label="Twitter / X"><i class="fab fa-x-twitter"></i></a>
            <a href="https://www.linkedin.com"  target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Movies</h4>
          <ul>
            <li><a href="movies.html">All Movies</a></li>
            <li><a href="movies.html?genre=action">Action</a></li>
            <li><a href="movies.html?genre=comedy">Comedy</a></li>
            <li><a href="movies.html?genre=drama">Drama</a></li>
            <li><a href="movies.html?genre=thriller">Thriller</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>TV Shows</h4>
          <ul>
            <li><a href="tvshows.html">All TV Shows</a></li>
            <li><a href="anime.html">Anime</a></li>
            <li><a href="trending.html">Trending</a></li>
            <li><a href="new-releases.html">New Releases</a></li>
            <li><a href="mylist.html">My List</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="support.html">Help Center</a></li>
            <li><a href="support.html#contact">Contact Us</a></li>
            <li><a href="support.html#faq">FAQ</a></li>
            <li><a href="settings.html">Account Settings</a></li>
            <li><a href="profile.html">Profile</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="privacy.html">Privacy Policy</a></li>
            <li><a href="terms.html">Terms of Service</a></li>
            <li><a href="privacy.html#cookies">Cookie Policy</a></li>
            <li><a href="privacy.html#dmca">DMCA</a></li>
            <li><a href="terms.html#advertising">Advertising</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 CinemaX. All rights reserved. Data provided by <a href="https://www.themoviedb.org" target="_blank" style="color:inherit;text-decoration:underline">TMDB</a> and Trakt.</p>
        <div class="footer-bottom-links">
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
          <a href="support.html">Help</a>
        </div>
      </div>
    </footer>
  `;
}

/* ── Build bottom navigation ──────────────────────────── */
function buildBottomNav() {
  const items = BOTTOM_NAV.map(item => /* html */`
    <a href="${item.href}"
       class="bottom-nav-item ${isActive(item.href)}"
       ${item.id ? `id="${item.id}"` : ''}
       aria-label="${item.label}">
      <i class="fas ${item.icon}"></i>
      <span>${item.label}</span>
    </a>
  `).join('');

  return `<nav class="bottom-nav" role="navigation" aria-label="Mobile navigation">${items}</nav>`;
}

/* ── Build search overlay ─────────────────────────────── */
function buildSearchOverlay() {
  const popular = ['Stranger Things','Avengers','Attack on Titan','Breaking Bad','Dune','The Bear','One Piece','Interstellar'];
  const recent  = ['Spider-Man','The Batman','Loki','Wednesday'];

  return /* html */`
    <div class="search-overlay" id="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
      <div class="search-overlay-inner">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" id="search-input" placeholder="Search movies, shows, people…" autocomplete="off" autofocus>
          <button class="search-close" id="search-close" aria-label="Close search"><i class="fas fa-xmark"></i></button>
        </div>

        <div id="search-suggestions">
          <div class="search-section-label">Recent Searches</div>
          <div class="search-tags" id="recent-tags">
            ${recent.map(t => `<span class="search-tag">${t}</span>`).join('')}
          </div>

          <div class="search-section-label">Popular Right Now</div>
          <div class="search-tags" id="popular-tags">
            ${popular.map(t => `<span class="search-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div id="search-results-section" style="display:none;">
          <div class="search-section-label" id="search-results-label">Results</div>
          <div class="search-results-grid" id="search-results-grid"></div>
        </div>
      </div>
    </div>
  `;
}

/* ── Toast helper ─────────────────────────────────────── */
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ── Inject all layout pieces ─────────────────────────── */
export function initLayout() {
  // Navbar
  document.body.insertAdjacentHTML('afterbegin', buildNavbar());

  // Drawer + overlay
  document.body.insertAdjacentHTML('afterbegin', buildDrawer());

  // Search overlay
  document.body.insertAdjacentHTML('afterbegin', buildSearchOverlay());

  // Footer
  document.body.insertAdjacentHTML('beforeend', buildFooter());

  // Bottom nav
  document.body.insertAdjacentHTML('beforeend', buildBottomNav());

  // Wire everything
  wireNavbar();
  wireDrawer();
  wireSearch();
}

/* ── Wire navbar ─────────────────────────────────────── */
function wireNavbar() {
  const navbar = document.getElementById('navbar');

  // Scroll glass effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Profile dropdown
  const avatarWrap = document.getElementById('nav-avatar-wrap');
  const dropdown   = document.getElementById('profile-dropdown');
  if (avatarWrap && dropdown) {
    avatarWrap.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  // Login button triggers drawer
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => openDrawer());
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      // Will be overridden by auth.js if Firebase loaded
      showToast('Signed out successfully', 'success');
      window.location.href = 'index.html';
    });
  }
}

/* ── Wire hamburger & drawer ─────────────────────────── */
function openDrawer() {
  document.getElementById('mobile-drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
  document.getElementById('hamburger')?.classList.add('open');
  document.getElementById('hamburger')?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  document.getElementById('mobile-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('hamburger')?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function wireDrawer() {
  document.getElementById('hamburger')?.addEventListener('click', openDrawer);
  document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawer);

  // Search link in bottom nav that opens overlay
  document.getElementById('bn-search')?.addEventListener('click', e => {
    e.preventDefault();
    openSearch();
  });
}

/* ── Wire search ─────────────────────────────────────── */
let searchTimer;

function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('search-input')?.focus(), 150);
}
function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function wireSearch() {
  document.getElementById('nav-search-open')?.addEventListener('click', openSearch);
  document.getElementById('search-close')?.addEventListener('click', closeSearch);

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSearch();
      closeDrawer();
    }
  });

  // Search tags auto-fill
  document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const input = document.getElementById('search-input');
      input.value = tag.textContent;
      input.dispatchEvent(new Event('input'));
    });
  });

  // Live search
  document.getElementById('search-input')?.addEventListener('input', e => {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    if (!q) {
      document.getElementById('search-suggestions').style.display = '';
      document.getElementById('search-results-section').style.display = 'none';
      return;
    }
    document.getElementById('search-suggestions').style.display = 'none';
    document.getElementById('search-results-section').style.display = '';
    document.getElementById('search-results-label').textContent = `Results for "${q}"`;
    document.getElementById('search-results-grid').innerHTML = buildSkeletonSearchResults();

    searchTimer = setTimeout(() => performSearch(q), 450);
  });
}

function buildSkeletonSearchResults() {
  return Array(8).fill(0).map(() =>
    `<div class="skeleton-card" style="width:100%;height:0;padding-bottom:150%;border-radius:10px;"></div>`
  ).join('');
}

async function performSearch(query) {
  try {
    // Dynamic import to get tmdb
    const { default: tmdb } = await import('../api/tmdb.js');
    const data = await tmdb.search(query, 'multi');
    if (!data || !data.results) return;

    const grid = document.getElementById('search-results-grid');
    const results = data.results.filter(r => r.poster_path && (r.title || r.name)).slice(0, 12);

    if (results.length === 0) {
      grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1">No results found for "${query}"</p>`;
      return;
    }

    grid.innerHTML = results.map(item => {
      const type  = item.title ? 'movie' : 'tv';
      const title = item.title || item.name;
      const img   = tmdb.getImageUrl(item.poster_path, 'w300');
      return /* html */`
        <div class="movie-card" style="cursor:pointer;width:100%;height:0;padding-bottom:150%;position:relative;"
             onclick="window.location.href='detail.html?id=${item.id}&type=${type}'">
          <img src="${img}" alt="${title}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
          <div class="card-quality-badge">HD</div>
          <div class="card-info-bar" style="position:absolute;">
            <div class="card-title">${title}</div>
            <div class="card-meta">
              <span class="star-rating"><i class="fas fa-star"></i></span>
              <span>${(item.vote_average || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch(err) {
    console.error('Search error:', err);
  }
}

/* ── Update navbar for logged-in user ─────────────────── */
export function setLoggedInUser(user) {
  const loginWrap  = document.getElementById('nav-login-btn');
  const avatarWrap = document.getElementById('nav-avatar-wrap');
  const avatarImg  = document.getElementById('nav-avatar-img');
  const drawerName = document.getElementById('drawer-user-name');
  const drawerSub  = document.getElementById('drawer-user-sub');
  const drawerAv   = document.getElementById('drawer-avatar');
  const drawerLogin= document.getElementById('drawer-login-link');

  if (loginWrap)  loginWrap.style.display  = 'none';
  if (avatarWrap) avatarWrap.style.display = 'flex';
  if (avatarImg && user.photoURL) avatarImg.src = user.photoURL;
  if (drawerName) drawerName.textContent = user.displayName || 'User';
  if (drawerSub)  drawerSub.textContent  = user.email || '';
  if (drawerAv && user.photoURL) drawerAv.src = user.photoURL;
  if (drawerLogin) drawerLogin.style.display = 'none';
}

export function setLoggedOutUser() {
  const loginWrap  = document.getElementById('nav-login-btn');
  const avatarWrap = document.getElementById('nav-avatar-wrap');
  const drawerName = document.getElementById('drawer-user-name');
  const drawerSub  = document.getElementById('drawer-user-sub');
  const drawerLogin= document.getElementById('drawer-login-link');

  if (loginWrap)  loginWrap.style.display  = 'flex';
  if (avatarWrap) avatarWrap.style.display = 'none';
  if (drawerName) drawerName.textContent = 'Guest';
  if (drawerSub)  drawerSub.textContent  = 'Sign in for full access';
  if (drawerLogin) drawerLogin.style.display = '';
}
