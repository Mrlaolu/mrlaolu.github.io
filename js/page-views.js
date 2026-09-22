(() => {
  'use strict';

  const script = document.currentScript;
  const mode = script && script.dataset.pageviewMode;
  const endpoint = 'https://mrlaolu-waline.vercel.app/api/article';

  function addCounter(article) {
    const meta = article.querySelector('.article-meta .level-left');
    if (!meta) return null;

    const item = document.createElement('span');
    item.className = 'level-item article-view-count';
    item.append('浏览量 ');

    const value = document.createElement('span');
    value.className = 'article-view-count-value';
    value.textContent = '…';
    item.append(value);
    meta.append(item);
    return value;
  }

  function articlePath(link) {
    try {
      return new URL(link.href, location.href).pathname;
    } catch {
      return null;
    }
  }

  async function readCounts(paths) {
    const url = new URL(endpoint);
    url.searchParams.set('path', paths.join(','));
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Waline pageviews: HTTP ${response.status}`);
    const result = await response.json();
    if (result.errno !== 0 || !Array.isArray(result.data)) {
      throw new Error('Waline pageviews: invalid response');
    }
    return result.data;
  }

  async function showListingCounts() {
    const counters = [...document.querySelectorAll('.column-main > .card article')]
      .map(article => {
        const link = article.querySelector('.title a[href]');
        return link ? { path: articlePath(link), value: addCounter(article) } : null;
      })
      .filter(item => item && item.path && item.value);
    if (!counters.length) return;

    try {
      const counts = await readCounts(counters.map(item => item.path));
      counters.forEach((item, index) => {
        const count = counts[index] && Number(counts[index].time);
        item.value.textContent = Number.isFinite(count) ? count.toLocaleString('zh-CN') : '—';
      });
    } catch (error) {
      counters.forEach(item => { item.value.textContent = '—'; });
      console.warn(error);
    }
  }

  async function showPostCount() {
    const article = document.querySelector('.column-main > .card article');
    if (!article) return;

    const value = addCounter(article);
    if (!value) return;

    // The old Busuanzi article count is a different data source. Keep its
    // site visitor counter, but show the same Waline count as the listing.
    const oldCounter = article.querySelector('#busuanzi_container_page_pv');
    if (oldCounter) oldCounter.classList.add('article-view-count-old-hidden');

    const path = location.pathname;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      if (!response.ok) throw new Error(`Waline pageview update: HTTP ${response.status}`);
      const result = await response.json();
      if (result.errno !== 0) throw new Error('Waline pageview update failed');
      const counts = await readCounts([path]);
      const count = counts[0] && Number(counts[0].time);
      value.textContent = Number.isFinite(count) ? count.toLocaleString('zh-CN') : '—';
    } catch (error) {
      if (oldCounter) oldCounter.classList.remove('article-view-count-old-hidden');
      value.parentElement.remove();
      console.warn(error);
    }
  }

  if (mode === 'post') showPostCount();
  else if (mode === 'listing') showListingCounts();
})();
