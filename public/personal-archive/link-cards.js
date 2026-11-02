(async () => {
  const cards = [...document.querySelectorAll('[data-link-card]')];
  if (!cards.length) return;
  let overridden = false;
  function render(entries) {
    cards.forEach((card, i) => {
      const entry = entries[i];
      if (!entry) return;
      if (typeof entry.title === 'string') card.querySelector('h2').textContent = entry.title;
      if (typeof entry.description === 'string') card.querySelector('p').textContent = entry.description;
      card.removeAttribute('href'); card.removeAttribute('target'); card.removeAttribute('rel');
      card.setAttribute('aria-disabled', 'true');
      const state = card.querySelector('.link-card-state');
      state.textContent = '链接待添加';
      if (typeof entry.url !== 'string' || !entry.url.trim()) return;
      let url;
      try { url = new URL(entry.url.trim(), location.href); } catch { return; }
      if (!['https:', 'http:'].includes(url.protocol)) return;
      card.href = url.href; card.target = '_blank'; card.rel = 'noopener noreferrer';
      card.removeAttribute('aria-disabled');
      const icon = document.createElement('img');
      icon.className = 'ui-arrow'; icon.src = 'assets/arrow-right-glass.svg'; icon.alt = ''; icon.setAttribute('aria-hidden', 'true');
      state.replaceChildren(document.createTextNode('打开链接'), icon);
    });
  }
  window.archiveLinkCards = {set(entries) { overridden = true; render(entries); }};
  try {
    const response = await fetch('trace-links.json?v=profile-editor-01');
    if (response.ok) { const entries = await response.json(); if (!overridden) render(entries); }
  } catch { /* Unconfigured links remain honest placeholders. */ }
})();
