import tmdb from '../api/tmdb.js';
import { initLayout, setLoggedInUser, setLoggedOutUser, showToast } from '../components/layout.js';
import storage from '../api/storage.js';
import { auth, onAuthStateChanged } from '../api/firebase.js';

/* ── Bootstrap layout ─────────────────────────────────────── */
initLayout();

onAuthStateChanged(auth, user => {
  if (user) setLoggedInUser(user);
  else      setLoggedOutUser();
});

class DetailPage {
  constructor() {
    this.params  = new URLSearchParams(window.location.search);
    this.id      = this.params.get('id');
    this.type    = this.params.get('type') || 'movie';
    this.data    = null;
    this.seasons = [];
    this.init();
  }

  async init() {
    if (!this.id) { window.location.href = 'index.html'; return; }

    const data = await tmdb.getDetails(this.type, this.id);
    if (!data) { showToast('Failed to load content. Please try again.', 'error'); return; }

    this.data = data;
    document.title = `${data.title || data.name} | CinemaX`;

    this.renderHero(data);
    this.renderCast(data.credits?.cast || []);
    this.renderSimilar(data.similar?.results || []);
    this.renderReviews([]);
    this.setupTabs();
    this.setupActions(data);

    if (this.type === 'tv') {
      this.setupTVFeatures(data);
    } else {
      this.setupMovieInfoTab(data);
    }

    this.loadReviews();
  }

  /* ── Hero ─────────────────────────────────────────────── */
  renderHero(data) {
    const backdrop = document.getElementById('backdrop');
    const poster   = document.getElementById('poster');

    if (backdrop) backdrop.src = tmdb.getImageUrl(data.backdrop_path, 'original');
    if (poster)   poster.src   = tmdb.getImageUrl(data.poster_path, 'w500');

    const titleEl = document.getElementById('title-name');
    if (titleEl) titleEl.textContent = data.title || data.name;

    const ovEl = document.getElementById('overview');
    if (ovEl) ovEl.textContent = data.overview || '';

    const ratingEl = document.getElementById('vote-average');
    if (ratingEl) ratingEl.textContent = `⭐ ${(data.vote_average || 0).toFixed(1)}`;

    const yearEl = document.getElementById('release-year');
    if (yearEl) yearEl.textContent = (data.release_date || data.first_air_date || '').split('-')[0];

    const runtimeEl = document.getElementById('runtime');
    if (runtimeEl) {
      runtimeEl.textContent = this.type === 'movie'
        ? (data.runtime ? `${data.runtime} min` : '')
        : (data.number_of_seasons ? `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}` : '');
    }

    const typeEl = document.getElementById('content-type');
    if (typeEl) typeEl.textContent = this.type === 'movie' ? 'Movie' : 'TV Series';

    const genresEl = document.getElementById('genres');
    if (genresEl && data.genres) {
      genresEl.textContent = data.genres.map(g => g.name).join(' · ');
    }
  }

  /* ── Actions ──────────────────────────────────────────── */
  setupActions(data) {
    const playBtn      = document.getElementById('play-btn');
    const trailerBtn   = document.getElementById('trailer-btn');
    const watchlistBtn = document.getElementById('watchlist-btn');
    const favoriteBtn  = document.getElementById('favorite-btn');
    const shareBtn     = document.getElementById('share-btn');

    const title    = data.title || data.name;
    const titleEnc = encodeURIComponent(title);

    if (playBtn) {
      playBtn.onclick = () => {
        const url = this.type === 'movie'
          ? `player.html?id=${this.id}&type=movie&title=${titleEnc}`
          : `player.html?id=${this.id}&type=tv&season=1&episode=1&title=${titleEnc}`;
        window.location.href = url;
      };
    }

    if (trailerBtn) {
      trailerBtn.onclick = () => {
        const trailer = data.videos?.results?.find(v => v.type === 'Trailer') || data.videos?.results?.[0];
        if (trailer) {
          window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
        } else {
          showToast('Trailer not available', 'error');
        }
      };
    }

    if (watchlistBtn) {
      watchlistBtn.onclick = async () => {
        if (!auth.currentUser) { showToast('Please sign in to save to My List', 'error'); return; }
        await storage.addToWatchlist({
          id: data.id, title, poster_path: data.poster_path,
          type: this.type, vote_average: data.vote_average
        });
        watchlistBtn.innerHTML = '<i class="fas fa-check"></i> In My List';
        showToast(`Added "${title}" to your list`, 'success');
      };
    }

    if (favoriteBtn) {
      favoriteBtn.onclick = async () => {
        if (!auth.currentUser) { showToast('Please sign in to favourite content', 'error'); return; }
        await storage.addToFavorites({
          id: data.id, title, poster_path: data.poster_path,
          type: this.type, vote_average: data.vote_average
        });
        favoriteBtn.style.color = 'var(--primary)';
        showToast(`Added "${title}" to favourites`, 'success');
      };
    }

    if (shareBtn) {
      shareBtn.onclick = () => {
        if (navigator.share) {
          navigator.share({ title: `Watch ${title} on CinemaX`, url: window.location.href });
        } else {
          navigator.clipboard?.writeText(window.location.href);
          showToast('Link copied to clipboard', 'success');
        }
      };
    }
  }

  /* ── Tabs ─────────────────────────────────────────────── */
  setupTabs() {
    document.querySelectorAll('.detail-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById(`tab-pane-${btn.dataset.tab}`);
        if (pane) pane.classList.add('active');
      });
    });
  }

  /* ── TV Features ──────────────────────────────────────── */
  setupTVFeatures(data) {
    // Hide "Episodes" tab label (it works for both movie info and TV)
    const epTabBtn = document.getElementById('tab-episodes');
    if (epTabBtn) epTabBtn.innerHTML = '<i class="fas fa-list"></i> Episodes';

    const seasonSection = document.getElementById('season-section');
    if (seasonSection) seasonSection.style.display = 'block';

    const movieInfoTab = document.getElementById('movie-info-tab');
    if (movieInfoTab) movieInfoTab.style.display = 'none';

    const seasons = data.seasons?.filter(s => s.season_number > 0) || [];
    this.seasons  = seasons;

    const pillsEl = document.getElementById('season-pills');
    if (!pillsEl || !seasons.length) return;

    pillsEl.innerHTML = seasons.map((s, i) =>
      `<button class="season-pill${i === 0 ? ' active' : ''}" data-season="${s.season_number}">
        Season ${s.season_number}
       </button>`
    ).join('');

    pillsEl.querySelectorAll('.season-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        pillsEl.querySelectorAll('.season-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.loadEpisodes(pill.dataset.season);
      });
    });

    if (seasons.length) this.loadEpisodes(seasons[0].season_number);
  }

  async loadEpisodes(seasonNumber) {
    const grid = document.getElementById('episode-grid');
    if (!grid) return;
    grid.innerHTML = '<p style="color:var(--text-secondary)">Loading episodes…</p>';

    const seasonData = await tmdb.getSeasons(this.id, seasonNumber);
    if (!seasonData?.episodes) {
      grid.innerHTML = '<p style="color:var(--text-secondary)">No episodes found.</p>';
      return;
    }

    const data  = this.data;
    const title = data?.title || data?.name || '';
    const titleEnc = encodeURIComponent(title);

    grid.innerHTML = seasonData.episodes.map(ep => {
      const img = tmdb.getImageUrl(ep.still_path, 'w500');
      const url = `player.html?id=${this.id}&type=tv&season=${seasonNumber}&episode=${ep.episode_number}&title=${titleEnc}`;
      return /* html */`
        <div class="episode-card" onclick="window.location.href='${url}'" role="button" tabindex="0" aria-label="Play Episode ${ep.episode_number}">
          <div class="episode-thumb">
            <img src="${img}" alt="${ep.name}" loading="lazy">
            <div class="play-icon"><i class="fas fa-play"></i></div>
          </div>
          <div class="episode-info">
            <div class="episode-num">Episode ${ep.episode_number}</div>
            <div class="episode-name">${ep.name}</div>
            <div class="episode-runtime">${ep.runtime ? `${ep.runtime} min` : ''}</div>
          </div>
        </div>
      `;
    }).join('');

    // Keyboard support
    grid.querySelectorAll('.episode-card').forEach(card => {
      card.addEventListener('keydown', e => { if (e.key === 'Enter') card.click(); });
    });
  }

  /* ── Movie Info Tab ───────────────────────────────────── */
  setupMovieInfoTab(data) {
    const seasonSection = document.getElementById('season-section');
    if (seasonSection) seasonSection.style.display = 'none';

    const movieInfoTab = document.getElementById('movie-info-tab');
    if (movieInfoTab) movieInfoTab.style.display = 'block';

    const director = data.credits?.crew?.find(c => c.job === 'Director');
    const dirEl = document.getElementById('director');
    if (dirEl) dirEl.textContent = director?.name || '–';

    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = data.status || '–';

    const runtimeEl = document.getElementById('runtime-info');
    if (runtimeEl) runtimeEl.textContent = data.runtime ? `${data.runtime} min` : '–';

    const langEl = document.getElementById('language');
    if (langEl) langEl.textContent = data.spoken_languages?.map(l => l.name).join(', ') || '–';
  }

  /* ── Cast ─────────────────────────────────────────────── */
  renderCast(cast) {
    const grid = document.getElementById('cast-grid');
    if (!grid) return;

    if (!cast.length) {
      grid.innerHTML = '<p style="color:var(--text-secondary)">Cast information not available.</p>';
      return;
    }

    grid.innerHTML = cast.slice(0, 20).map(person => {
      const img = tmdb.getImageUrl(person.profile_path, 'w185');
      return /* html */`
        <div class="cast-card">
          <img src="${img}" alt="${person.name}" loading="lazy"
               onerror="this.src='https://via.placeholder.com/90x90/141414/666?text=No+Photo'">
          <div class="cast-name">${person.name}</div>
          <div class="cast-char">${person.character || ''}</div>
        </div>
      `;
    }).join('');
  }

  /* ── Similar ──────────────────────────────────────────── */
  renderSimilar(similar) {
    const grid = document.getElementById('similar-grid');
    if (!grid) return;

    if (!similar.length) {
      grid.innerHTML = '<p style="color:var(--text-secondary)">No similar titles found.</p>';
      return;
    }

    grid.innerHTML = similar
      .filter(item => item.poster_path)
      .slice(0, 16)
      .map(item => {
        const type    = item.title ? 'movie' : 'tv';
        const title   = item.title || item.name;
        const img     = tmdb.getImageUrl(item.poster_path, 'w342');
        const rating  = (item.vote_average || 0).toFixed(1);
        const year    = (item.release_date || item.first_air_date || '').split('-')[0];
        return /* html */`
          <div class="movie-card" style="cursor:pointer;width:100%;height:0;padding-bottom:150%;position:relative;"
               onclick="window.location.href='detail.html?id=${item.id}&type=${type}'">
            <img src="${img}" alt="${title}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" loading="lazy">
            <div class="card-quality-badge">HD</div>
            <div class="card-rating-badge"><i class="fas fa-star"></i>${rating}</div>
            <div class="card-info-bar" style="position:absolute;">
              <div class="card-title">${title}</div>
              <div class="card-meta"><span>${year}</span></div>
            </div>
            <div class="card-hover-overlay" style="position:absolute;">
              <button class="card-play-btn" onclick="event.stopPropagation();window.location.href='player.html?id=${item.id}&type=${type}&title=${encodeURIComponent(title)}'"><i class="fas fa-play"></i></button>
              <div class="card-action-row">
                <button class="card-action-btn" title="Watchlist"><i class="fas fa-plus"></i></button>
                <button class="card-action-btn" title="Info" onclick="event.stopPropagation();window.location.href='detail.html?id=${item.id}&type=${type}'"><i class="fas fa-info"></i></button>
              </div>
              <div class="card-hover-title">${title}</div>
            </div>
          </div>
        `;
      }).join('');
  }

  /* ── Reviews ──────────────────────────────────────────── */
  renderReviews(reviews) {
    const list = document.getElementById('review-list');
    if (!list) return;

    if (!reviews.length) {
      list.innerHTML = '<p style="color:var(--text-secondary);margin-bottom:var(--sp-4)">No reviews yet. Be the first to write one!</p>';
      return;
    }

    list.innerHTML = reviews.map(r => /* html */`
      <div class="review-card">
        <div class="review-header">
          <img src="${r.userPhoto || 'https://i.pravatar.cc/40'}" class="review-avatar" alt="${r.userName}">
          <div>
            <div class="review-name">${r.userName}</div>
            <div class="review-date">${new Date(r.createdAt?.seconds * 1000).toLocaleDateString()}</div>
          </div>
        </div>
        <p class="review-text">${r.review}</p>
      </div>
    `).join('');
  }

  async loadReviews() {
    try {
      const reviews = await storage.getReviews(this.id);
      this.renderReviews(reviews);
    } catch(e) {
      console.error('Failed to load reviews:', e);
    }

    const submitBtn  = document.getElementById('submit-review-btn');
    const reviewText = document.getElementById('review-text');
    if (submitBtn && reviewText) {
      submitBtn.onclick = async () => {
        if (!auth.currentUser) { showToast('Please sign in to post a review', 'error'); return; }
        const text = reviewText.value.trim();
        if (!text) return;
        await storage.addReview(this.id, text);
        reviewText.value = '';
        showToast('Review posted!', 'success');
        this.loadReviews();
      };
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new DetailPage());
