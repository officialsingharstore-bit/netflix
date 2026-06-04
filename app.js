import tmdb from './api/tmdb.js';
import { initLayout, setLoggedInUser, setLoggedOutUser, showToast } from './components/layout.js';
import { auth, onAuthStateChanged } from './api/firebase.js';
import storage from './api/storage.js';

/* ── Bootstrap layout first ──────────────────────────────── */
initLayout();

/* ── Auth listener ───────────────────────────────────────── */
onAuthStateChanged(auth, user => {
  if (user) {
    setLoggedInUser(user);
  } else {
    setLoggedOutUser();
  }
});

/* ── Utility: build a movie card HTML string ─────────────── */
function buildCard(item) {
  const type  = item.title ? 'movie' : 'tv';
  const title = item.title || item.name;
  const year  = (item.release_date || item.first_air_date || '').split('-')[0];
  const img   = tmdb.getImageUrl(item.poster_path, 'w500');
  const rating = (item.vote_average || 0).toFixed(1);
  const titleEnc = encodeURIComponent(title);

  return /* html */`
    <div class="movie-card" role="listitem"
         data-id="${item.id}" data-type="${type}"
         style="cursor:pointer;"
         onclick="window.location.href='detail.html?id=${item.id}&type=${type}'">
      <img src="${img}" alt="${title}" loading="lazy">
      <div class="card-quality-badge">HD</div>
      <div class="card-rating-badge"><i class="fas fa-star"></i>${rating}</div>
      <div class="card-info-bar">
        <div class="card-title">${title}</div>
        <div class="card-meta">
          <span>${year}</span>
          <span class="star-rating"><i class="fas fa-star"></i></span>
          <span>${rating}</span>
        </div>
      </div>
      <div class="card-hover-overlay">
        <button class="card-play-btn"
                onclick="event.stopPropagation();window.location.href='player.html?id=${item.id}&type=${type}&title=${titleEnc}'"
                aria-label="Play ${title}">
          <i class="fas fa-play"></i>
        </button>
        <div class="card-action-row">
          <button class="card-action-btn" title="Add to Watchlist"
                  onclick="event.stopPropagation();addToWatchlist(${item.id},'${type}','${title.replace(/'/g,'')}','${item.poster_path}',${item.vote_average})">
            <i class="fas fa-plus"></i>
          </button>
          <button class="card-action-btn" title="Favorite"
                  onclick="event.stopPropagation();addToFavorites(${item.id},'${type}','${title.replace(/'/g,'')}','${item.poster_path}',${item.vote_average})">
            <i class="fas fa-heart"></i>
          </button>
          <button class="card-action-btn" title="Details"
                  onclick="event.stopPropagation();window.location.href='detail.html?id=${item.id}&type=${type}'"
                  aria-label="Details">
            <i class="fas fa-info"></i>
          </button>
        </div>
        <div class="card-hover-title">${title}</div>
      </div>
    </div>
  `;
}

/* ── Skeleton builder ────────────────────────────────────── */
function buildSkeletons(rowId, count = 12) {
  const el = document.getElementById(rowId);
  if (el) {
    el.innerHTML = Array(count).fill(0).map(() =>
      `<div class="skeleton-card"></div>`
    ).join('');
  }
}

/* ── Render row ──────────────────────────────────────────── */
function renderRow(rowId, data) {
  const el = document.getElementById(rowId);
  if (!el || !data?.results?.length) return;
  el.innerHTML = data.results.slice(0, 20).map(buildCard).join('');
}

/* ── Row arrows ──────────────────────────────────────────── */
function setupRowArrows() {
  document.querySelectorAll('.row-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const rowId = btn.dataset.row;
      const row   = document.getElementById(rowId);
      if (!row) return;
      const scrollAmount = row.clientWidth * 0.75;
      row.scrollBy({ left: btn.classList.contains('left') ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    });
  });
}

/* ── Provider filter ─────────────────────────────────────── */
function setupProviderFilters() {
  document.querySelectorAll('.provider-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Show a toast to indicate filtering (real provider IDs can be added to TMDB calls)
      const provider = btn.dataset.provider;
      if (provider !== 'all') {
        showToast(`Showing ${btn.textContent.trim()} content`, 'info', 2000);
      }
      loadDiscoveryRows();
    });
  });
}

/* ── Hero rotation ───────────────────────────────────────── */
let heroItems   = [];
let heroIndex   = 0;
let heroTimer   = null;

function updateHero(item) {
  const titleEl    = document.getElementById('hero-title');
  const overviewEl = document.getElementById('hero-overview');
  const ratingEl   = document.getElementById('hero-rating');
  const yearEl     = document.getElementById('hero-year');
  const genresEl   = document.getElementById('hero-genres');
  const backdropEl = document.getElementById('hero-backdrop');
  const playBtn    = document.getElementById('hero-play-btn');
  const trailerBtn = document.getElementById('hero-trailer-btn');
  const watchlistBtn = document.getElementById('hero-watchlist-btn');

  if (!titleEl) return;

  // Fade out
  backdropEl.classList.add('fading');
  setTimeout(() => {
    titleEl.textContent    = item.title    || item.name;
    overviewEl.textContent = item.overview || '';
    ratingEl.textContent   = (item.vote_average || 0).toFixed(1);
    yearEl.textContent     = (item.release_date || item.first_air_date || '').split('-')[0];
    backdropEl.src         = tmdb.getImageUrl(item.backdrop_path, 'original');
    backdropEl.classList.remove('fading');
  }, 300);

  // Genres (from item or use fallback)
  if (item.genre_ids) {
    genresEl.textContent = item.genre_ids.slice(0, 3).join(' · ');
  }

  // Buttons
  const type = item.title ? 'movie' : 'tv';
  if (playBtn) {
    playBtn.onclick = () => window.location.href = `player.html?id=${item.id}&type=${type}&title=${encodeURIComponent(item.title || item.name)}`;
  }
  if (trailerBtn) {
    trailerBtn.onclick = () => window.location.href = `detail.html?id=${item.id}&type=${type}`;
  }
  if (watchlistBtn) {
    watchlistBtn.onclick = () => {
      if (!auth.currentUser) { showToast('Please sign in to save to your list', 'error'); return; }
      storage.addToWatchlist({ id: item.id, title: item.title || item.name, poster_path: item.poster_path, type, vote_average: item.vote_average });
      showToast(`Added "${item.title || item.name}" to your list`, 'success');
      watchlistBtn.innerHTML = '<i class="fas fa-check"></i> In My List';
    };
  }
}

function buildHeroIndicators(count) {
  const container = document.getElementById('hero-indicators');
  if (!container) return;
  container.innerHTML = Array(count).fill(0).map((_, i) =>
    `<span class="hero-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
  ).join('');
  container.querySelectorAll('.hero-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      heroIndex = Number(dot.dataset.index);
      showHeroItem(heroIndex);
    });
  });
}

function showHeroItem(index) {
  heroIndex = index;
  updateHero(heroItems[heroIndex]);
  document.querySelectorAll('.hero-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === heroIndex);
  });
}

function startHeroRotation() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    const next = (heroIndex + 1) % heroItems.length;
    showHeroItem(next);
  }, 6000);
}

async function loadHeroSection() {
  const trending = await tmdb.getTrending('movie', 'week');
  if (!trending?.results?.length) return;

  heroItems = trending.results.slice(0, 6);
  buildHeroIndicators(heroItems.length);
  showHeroItem(0);
  startHeroRotation();
}

/* ── Discovery rows ──────────────────────────────────────── */
async function loadDiscoveryRows() {
  const ids = ['trendingMovies','topRatedTV','popularMovies','animeSeries','upcomingMovies'];
  ids.forEach(id => buildSkeletons(id));

  const [trending, topTv, popular, anime, upcoming] = await Promise.all([
    tmdb.getTrending('movie', 'day'),
    tmdb.getTopRated('tv'),
    tmdb.getPopular('movie'),
    tmdb.fetchFromTMDB('/discover/tv', { with_genres: '16', with_original_language: 'ja', sort_by: 'popularity.desc' }),
    tmdb.getUpcoming()
  ]);

  renderRow('trendingMovies', trending);
  renderRow('topRatedTV',     topTv);
  renderRow('popularMovies',  popular);
  renderRow('animeSeries',    anime);
  renderRow('upcomingMovies', upcoming);
}

/* ── Watchlist / Favorites helpers (global for onclick) ──── */
window.addToWatchlist = async (id, type, title, posterPath, rating) => {
  if (!auth.currentUser) { showToast('Please sign in to save content', 'error'); return; }
  await storage.addToWatchlist({ id, type, title, poster_path: posterPath, vote_average: rating });
  showToast(`Added "${title}" to your list`, 'success');
};

window.addToFavorites = async (id, type, title, posterPath, rating) => {
  if (!auth.currentUser) { showToast('Please sign in to favourite content', 'error'); return; }
  await storage.addToFavorites({ id, type, title, poster_path: posterPath, vote_average: rating });
  showToast(`Added "${title}" to favourites`, 'success');
};

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  setupRowArrows();
  setupProviderFilters();
  await loadHeroSection();
  await loadDiscoveryRows();
});
