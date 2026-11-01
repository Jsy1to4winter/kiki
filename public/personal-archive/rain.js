(() => {
  const svg = document.querySelector('#notes-rain');
  if (!svg || !window.gsap) return;
  const gsap = window.gsap;
  const panel = svg.closest('.scene');
  const art = svg.closest('.rain-art');
  const media = gsap.matchMedia();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let timeline = null, inView = false;
  function sync() {
    if (!timeline) { art.dataset.motion = reduced.matches ? 'reduced' : 'static'; return; }
    const playing = !panel.hidden && !document.hidden && inView;
    timeline.paused(!playing);
    art.dataset.motion = playing ? 'playing' : 'paused';
  }
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const drops = [...svg.querySelectorAll('.rain-drop')];
    // Read all path lengths once before writing animation styles.
    const lengths = drops.map(path => path.getTotalLength());
    const starts = [0, .45, 1.1, 1.7, 2.4, 3.2, 4];
    const durations = [1.55, 1.35, 1.85, 1.6, 1.3, 1.4, 1.15];
    timeline = gsap.timeline({paused:true, repeat:-1, defaults:{ease:'none'}});
    drops.forEach((drop, i) => {
      const dash = i === 6 ? 13 : 18;
      gsap.set(drop, {strokeDasharray:`${dash} ${lengths[i]+dash}`, strokeDashoffset:dash, autoAlpha:0});
      timeline.fromTo(drop,
        {strokeDashoffset:dash, autoAlpha:1},
        {strokeDashoffset:-lengths[i], autoAlpha:1, duration:durations[i], immediateRender:false}, starts[i]);
      timeline.set(drop, {autoAlpha:0}, starts[i]+durations[i]);
    });
    [...svg.querySelectorAll('.rain-ripple')].forEach((ripple, i) => {
      const sourceIndex = [0,2,3][i];
      gsap.set(ripple, {svgOrigin:ripple.dataset.origin, scale:.35, autoAlpha:0});
      timeline.fromTo(ripple, {scale:.35, autoAlpha:.65},
        {scale:1.25, autoAlpha:0, duration:1.35, ease:'power1.out', immediateRender:false},
        starts[sourceIndex]+durations[sourceIndex]-.05);
    });
    sync();
    return () => { timeline = null; art.dataset.motion = reduced.matches ? 'reduced' : 'static'; };
  }, svg);
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }, {threshold:.05});
  observer.observe(art);
  const panelObserver = new MutationObserver(sync);
  panelObserver.observe(panel, {attributes:true, attributeFilter:['hidden']});
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', event => {
    if (event.persisted) { timeline?.pause(); art.dataset.motion = 'paused'; return; }
    media.revert(); observer.disconnect(); panelObserver.disconnect();
    document.removeEventListener('visibilitychange', sync);
    window.removeEventListener('pageshow', sync);
  });
  sync();
})();
