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
    // Translate each complete line from above the field to its landing point.
    // No dash offset: the full illustrated line falls, then the ground glows.
    const geometry = drops.map(path => {
      const end = path.getPointAtLength(path.getTotalLength());
      const [groundX, groundY] = path.dataset.ground.split(' ').map(Number);
      const y = groundY - end.y;
      const x = groundX - end.x;
      const fromY = -end.y - 16;
      return {x, y, fromX:x-(y-fromY)*.325, fromY};
    });
    const starts = [0, .5, 1.1, 1.85, 2.4, 3.2, 4];
    const durations = [1.5, 1.35, 1.8, 1.6, 1.3, 1.45, 1.2];
    timeline = gsap.timeline({paused:true, repeat:-1, defaults:{ease:'none'}});
    drops.forEach((drop, i) => {
      const {x, y, fromX, fromY} = geometry[i];
      gsap.set(drop, {x:fromX, y:fromY, autoAlpha:0});
      timeline.fromTo(drop,
        {x:fromX, y:fromY, autoAlpha:.9},
        {x, y, autoAlpha:.9, duration:durations[i], immediateRender:false}, starts[i]);
      timeline.to(drop, {autoAlpha:0, duration:.1}, starts[i]+durations[i]);
    });
    [...svg.querySelectorAll('.rain-ripple')].forEach((ripple, i) => {
      gsap.set(ripple, {svgOrigin:ripple.dataset.origin, scale:.25, autoAlpha:0});
      timeline.fromTo(ripple, {scale:.25, autoAlpha:.7},
        {scale:1.3, autoAlpha:0, duration:1.4, ease:'power1.out', immediateRender:false},
        starts[i]+durations[i]);
    });
    [...svg.querySelectorAll('.rain-glow')].forEach((glow, i) => {
      gsap.set(glow, {svgOrigin:glow.dataset.origin, scale:.25, autoAlpha:0});
      const impact = starts[i]+durations[i];
      timeline.fromTo(glow, {scale:.25, autoAlpha:0},
        {scale:.9, autoAlpha:.9, duration:.13, immediateRender:false}, impact);
      timeline.to(glow, {scale:1.65, autoAlpha:0, duration:1.4, ease:'power1.out'}, impact+.13);
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
