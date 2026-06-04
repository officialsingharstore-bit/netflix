class PremiumPlayer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options; // { type, id, season, episode, title }
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const servers = {
            'Server 1 (Global)': this.options.type === 'movie' 
                ? `https://vidsrc.me/embed/movie?tmdb=${this.options.id}` 
                : `https://vidsrc.me/embed/tv?tmdb=${this.options.id}&sea=${this.options.season || 1}&epi=${this.options.episode || 1}`,
            'Server 2 (Hindi)': this.options.type === 'movie'
                ? `https://vidsrc.in/embed/movie/${this.options.id}`
                : `https://vidsrc.in/embed/tv/${this.options.id}/${this.options.season || 1}/${this.options.episode || 1}`,
            'Server 3 (Alternate)': `https://vidsrc.pm/embed/${this.options.type}/${this.options.id}`
        };

        this.container.innerHTML = `
            <div class="video-player-complex" style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                <div class="player-top-bar-safe" style="padding: 10px; background: #111; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; border-radius: 12px 12px 0 0;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button id="refreshPlayer" class="btn btn-secondary btn-sm" style="font-size: 0.6rem; background: #333;"><i class="fas fa-sync-alt"></i> REFRESH / CLEAR ADS</button>
                    </div>
                    <div class="server-switcher" style="display: flex; gap: 8px;">
                        ${Object.keys(servers).map(name => `
                            <button class="btn btn-secondary btn-sm server-btn" data-url="${servers[name]}" style="font-size: 0.65rem; padding: 4px 10px; border: 1px solid var(--primary-color);">
                                ${name.split(' (')[0]}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div style="flex: 1; position: relative; background: #000; border-radius: 0 0 12px 12px; overflow: hidden;">
                    <div id="playerLoading" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 5;">
                        <div class="play-btn-main" id="startPlayerBtn" style="width: 80px; height: 80px; background: var(--primary-color); border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 0 30px rgba(229,9,20,0.5);">
                            <i class="fas fa-play" style="font-size: 2rem; color: #fff;"></i>
                        </div>
                        <p style="margin-top: 1.5rem; letter-spacing: 1px; font-weight: 600; font-size: 0.8rem;">CLICK TO PLAY</p>
                    </div>
                    
                    <iframe id="mainPlayerFrame" 
                            src="${servers['Server 1 (Clean)']}" 
                            style="width: 100%; height: 100%; border: none; position: relative;" 
                            allowfullscreen 
                            allow="autoplay; encrypted-media">
                    </iframe>
                </div>
            </div>
        `;

        const frame = this.container.querySelector('#mainPlayerFrame');
        const loading = this.container.querySelector('#playerLoading');
        const startBtn = this.container.querySelector('#startPlayerBtn');
        const refreshBtn = this.container.querySelector('#refreshPlayer');

        startBtn.onclick = () => {
            loading.style.display = 'none';
        };

        refreshBtn.onclick = () => {
            loading.style.display = 'flex';
            const currentSrc = frame.src;
            frame.src = '';
            setTimeout(() => { frame.src = currentSrc; }, 100);
        };

        this.container.querySelectorAll('.server-btn').forEach(btn => {
            btn.onclick = () => {
                loading.style.display = 'flex';
                frame.src = btn.dataset.url;
            };
        });
    }
}

export default PremiumPlayer;
