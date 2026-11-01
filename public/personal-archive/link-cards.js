(async () => {
  const cards = [...document.querySelectorAll('[data-link-card]')];
  if (!cards.length) return;
  try {
    const response = await fetch('trace-links.json?v=profile-camera-01');
    if (!response.ok) return;
    const entries = await response.json();
    cards.forEach((card, i) => {
      const entry = entries[i];
      if (!entry) return;
      if (typeof entry.title === 'string') card.querySelector('h2').textContent = entry.title;
      if (typeof entry.description === 'string') card.querySelector('p').textContent = entry.description;
      if (typeof entry.url !== 'string' || !entry.url.trim()) return;
      const url = new URL(entry.url.trim(), location.href);
      if (!['https:', 'http:'].includes(url.protocol)) return;
      card.href = url.href;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.removeAttribute('aria-disabled');
      card.querySelector('.link-card-state').textContent = '打开链接 ↗';
    });
  } catch { /* Unconfigured or unavailable links remain honest placeholders. */ }
})();
