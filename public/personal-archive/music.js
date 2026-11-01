// One audio element and lyric reel live outside the five page sections.
const audio = document.querySelector('#archive-audio');
const control = document.querySelector('#music-control');
const button = document.querySelector('#music-button');
const pauseButton = document.querySelector('#music-pause');
const reel = document.querySelector('#lyric-reel');
const song = document.querySelector('#lyric-song');
const status = document.querySelector('#music-status');
let tracks = [], index = 0, lineIndex = -1, expanded = false;
let interactionBeforeLoad = false;

function showTrack() {
  const track = tracks[index];
  audio.src = track.src;
  song.textContent = track.label || track.title;
  document.querySelectorAll('#music-title-loop span').forEach(el => { el.textContent = track.title; });
  reel.style.transition = 'none';
  reel.style.transform = 'translateY(24px)';
  reel.replaceChildren(...track.lyrics.map(line => {
    const el = document.createElement('div'); el.textContent = line.text; return el;
  }));
  document.querySelector('#lyric-window').hidden = track.lyrics.length === 0;
  lineIndex = -1;
  updateLyrics();
  void reel.offsetHeight;
  reel.style.removeProperty('transition');
  button.setAttribute('aria-label', expanded ? `下一首，当前：${track.title}` : `展开音乐播放器，当前：${track.title}`);
  if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({title:track.title,artist:track.artist || ''});
}
async function play() {
  if (!tracks.length) { interactionBeforeLoad = true; return; }
  try { await audio.play(); status.textContent = ''; }
  catch (error) {
    if (error.name === 'NotAllowedError') status.textContent = '点击封面或音乐图标开始播放';
    else if (error.name !== 'AbortError') status.textContent = '音乐暂时无法播放，点击音乐图标重试';
  }
}
function next() { if (!tracks.length) return; index = (index + 1) % tracks.length; showTrack(); void play(); }
function updateLyrics() {
  if (!tracks.length) return;
  const lines = tracks[index].lyrics;
  if (!lines.length) return;
  // Timed lines use seconds; untimed text is spread evenly over the song duration.
  let current = lines[0].time == null ? Math.min(lines.length - 1, Math.floor(audio.currentTime / (Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration / lines.length : 6))) : 0;
  if (lines[0].time != null) lines.forEach((line, i) => { if (line.time <= audio.currentTime) current = i; });
  if (current === lineIndex) return;
  lineIndex = current;
  reel.style.transform = `translateY(${(1-current)*24}px)`;
  [...reel.children].forEach((el, i) => el.classList.toggle('current', i === current));
}
function playbackState() {
  const playing = !audio.paused;
  control.classList.toggle('playing', playing);
  document.querySelector('#now-playing').classList.toggle('playing', playing);
  pauseButton.textContent = playing ? 'Ⅱ' : '▷';
  pauseButton.setAttribute('aria-label', playing ? '暂停音乐' : '继续播放');
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
}
button.addEventListener('click', () => {
  if (!expanded) {
    expanded = true; control.classList.add('expanded');
    button.setAttribute('aria-expanded', 'true'); pauseButton.hidden = false;
    if (tracks.length) button.setAttribute('aria-label', `下一首，当前：${tracks[index].title}`);
    void play();
  } else next();
});
pauseButton.addEventListener('click', () => { if (audio.paused) void play(); else audio.pause(); });
audio.addEventListener('ended', next);
audio.addEventListener('timeupdate', updateLyrics);
audio.addEventListener('loadedmetadata', updateLyrics);
audio.addEventListener('seeked', updateLyrics);
audio.addEventListener('play', playbackState);
audio.addEventListener('pause', playbackState);
audio.addEventListener('error', () => { status.textContent = '音乐暂时无法播放，点击音乐图标重试'; });
// A user gesture on the cover unlocks sound on browsers that disallow autoplay.
const unlock = event => {
  if (event.target.closest('#music-control')) return;
  if (audio.paused) void play();
  document.removeEventListener('click', unlock, true);
};
document.addEventListener('click', unlock, true);
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => void play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('nexttrack', next);
  navigator.mediaSession.setActionHandler('previoustrack', () => { if (!tracks.length) return; index = (index + tracks.length - 1) % tracks.length; showTrack(); void play(); });
}
try {
  const response = await fetch('music-tracks.json?v=music-02');
  if (!response.ok) throw new Error('Playlist unavailable');
  tracks = await response.json();
  if (tracks.length) { showTrack(); void play(); }
  if (interactionBeforeLoad) status.textContent = audio.paused ? '点击音乐图标开始播放' : '';
} catch { status.textContent = '音乐列表暂时无法加载'; }
