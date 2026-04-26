/**
 * GKMRHK YouTube Feed Widget
 * Fetches YouTube channel RSS feed via a public CORS proxy,
 * parses it, and renders a responsive video grid.
 * No API key required. No third-party widget accounts needed.
 *
 * Usage: add <div class="yt-feed-widget" data-max="12"></div>
 * to any page, then include this script.
 */
(function () {
  'use strict';

  const CHANNEL_ID = 'UC0enwIvQoVHXHA6SG8_VHyA';
  const FEED_URL   = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  // Public CORS proxies - we try each in order until one works
  const PROXIES = [
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://cors-anywhere.herokuapp.com/${url}`,
  ];

  function getThumb(videoId) {
    // hqdefault is universally available; maxresdefault may 404 on older videos
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months= Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years  > 0) return `${years} year${years  > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months> 1 ? 's' : ''} ago`;
    if (weeks  > 0) return `${weeks} week${weeks  > 1 ? 's' : ''} ago`;
    if (days   > 0) return `${days} day${days    > 1 ? 's' : ''} ago`;
    if (hours  > 0) return `${hours} hour${hours  > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  function parseXML(xmlStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    const entries = Array.from(doc.querySelectorAll('entry'));
    return entries.map(entry => {
      const id    = entry.querySelector('videoId')?.textContent || '';
      const title = entry.querySelector('title')?.textContent  || '';
      const date  = entry.querySelector('published')?.textContent || '';
      const link  = `https://www.youtube.com/watch?v=${id}`;
      return { id, title, date, link };
    });
  }

  function renderCards(videos, container, max, layout) {
    if (!videos.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:3rem;color:var(--text-light)">
          <i class="fab fa-youtube" style="font-size:3rem;color:var(--gold);display:block;margin-bottom:1rem"></i>
          <p>Could not load videos right now. <a href="https://www.youtube.com/user/GKMRHK" target="_blank" rel="noopener">Visit our YouTube channel directly.</a></p>
        </div>`;
      return;
    }

    const shown = videos.slice(0, max);

    if (layout === 'list') {
      // List layout for sangat katha page
      container.innerHTML = `<div class="yt-list">
        ${shown.map(v => `
          <a href="${v.link}" target="_blank" rel="noopener" class="yt-list-item">
            <div class="yt-list-thumb">
              <img src="${getThumb(v.id)}" alt="${v.title}" loading="lazy">
              <span class="yt-play-icon"><i class="fab fa-youtube"></i></span>
            </div>
            <div class="yt-list-info">
              <div class="yt-list-title">${v.title}</div>
              <div class="yt-list-meta">${timeAgo(v.date)}</div>
            </div>
          </a>`).join('')}
      </div>`;
    } else {
      // Grid layout (default)
      const cols = layout === 'wide' ? 'col-sm-6 col-lg-4' : 'col-sm-6 col-md-4 col-lg-3';
      container.innerHTML = `<div class="row g-3 yt-grid">
        ${shown.map(v => `
          <div class="${cols}">
            <a href="${v.link}" target="_blank" rel="noopener" class="yt-card">
              <div class="yt-thumb">
                <img src="${getThumb(v.id)}" alt="${v.title}" loading="lazy">
                <span class="yt-play-btn"><i class="fab fa-youtube"></i></span>
              </div>
              <div class="yt-card-body">
                <div class="yt-card-title">${v.title}</div>
                <div class="yt-card-meta">${timeAgo(v.date)}</div>
              </div>
            </a>
          </div>`).join('')}
      </div>`;
    }

    // Subscribe CTA
    const cta = document.createElement('div');
    cta.className = 'text-center mt-4';
    cta.innerHTML = `<a href="https://www.youtube.com/@GKMRHK" target="_blank" rel="noopener" class="btn-gold">
      <i class="fab fa-youtube me-2"></i>View All Videos on YouTube
    </a>`;
    container.appendChild(cta);
  }

  function showLoading(container) {
    container.innerHTML = `
      <div class="yt-loading">
        <div class="yt-spinner"></div>
        <p>Loading videos…</p>
      </div>`;
  }

  async function fetchFeed(proxyIndex = 0) {
    if (proxyIndex >= PROXIES.length) return null;
    try {
      const proxyUrl = PROXIES[proxyIndex](FEED_URL);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return fetchFeed(proxyIndex + 1);
      const json = await res.json();
      // allorigins wraps in {contents: "..."}
      const xmlStr = json.contents || json;
      if (typeof xmlStr !== 'string') return fetchFeed(proxyIndex + 1);
      return xmlStr;
    } catch {
      return fetchFeed(proxyIndex + 1);
    }
  }

  async function init() {
    const containers = document.querySelectorAll('.yt-feed-widget');
    if (!containers.length) return;

    containers.forEach(c => showLoading(c));

    const xml = await fetchFeed();
    const videos = xml ? parseXML(xml) : [];

    containers.forEach(container => {
      const max    = parseInt(container.dataset.max    || '12', 10);
      const layout = container.dataset.layout || 'grid';
      renderCards(videos, container, max, layout);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
