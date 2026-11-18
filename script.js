// Плеєр прев'ю: один аудіофайл-семплер, у ньому 8 фрагментів по 10 секунд (по одному на трек).
const SEGMENT = 10;
const page = document.querySelector('.page');
const audio = document.querySelector('[data-part="audio"]');
const nowTitle = document.querySelector('[data-part="now-title"]');
const actionStatus = document.querySelector('[data-part="action-status"]');
const rows = [...document.querySelectorAll('.tracks tr[data-track]')];

const titleOf = (row) => `${row.cells[row.cells.length - 4].textContent}. ${row.querySelector('.tracks__name').textContent}`;

function markCurrent(index) {
  rows.forEach((row, i) => {
    if (i === index) row.setAttribute('aria-current', 'true');
    else row.removeAttribute('aria-current');
  });
  nowTitle.textContent = titleOf(rows[index]);
}

function playTrack(index) {
  audio.currentTime = index * SEGMENT;
  markCurrent(index);
  audio.play().catch(() => {}); // браузер може заблокувати автозапуск — тоді користувач натисне Play сам
}

rows.forEach((row, i) => {
  row.querySelector('.play').addEventListener('click', () => playTrack(i));
});

document.querySelector('[data-action="play-all"]').addEventListener('click', () => playTrack(0));

// Під час відтворення підсвічуємо трек, якому належить поточна секунда семплера
audio.addEventListener('timeupdate', () => {
  const index = Math.min(rows.length - 1, Math.floor(audio.currentTime / SEGMENT));
  if (rows[index].getAttribute('aria-current') !== 'true') markCurrent(index);
});

audio.addEventListener('play', () => page.classList.add('is-playing'));
audio.addEventListener('pause', () => page.classList.remove('is-playing'));
audio.addEventListener('ended', () => page.classList.remove('is-playing'));

// Обране (перемикач з aria-pressed)
const likeBtn = document.querySelector('[data-action="like"]');
likeBtn.addEventListener('click', () => {
  const on = likeBtn.getAttribute('aria-pressed') !== 'true';
  likeBtn.setAttribute('aria-pressed', String(on));
  likeBtn.setAttribute('aria-label', on ? 'Прибрати альбом з обраного' : 'Додати альбом в обране');
  actionStatus.textContent = on ? 'Альбом додано в обране.' : 'Альбом прибрано з обраного.';
});

// Поділитися: системне меню, якщо воно є, інакше копіювання посилання
document.querySelector('[data-action="share"]').addEventListener('click', async () => {
  const data = { title: '«Полонина» — Гірський туман', url: location.href };
  try {
    if (navigator.share) {
      await navigator.share(data);
      actionStatus.textContent = 'Посилання надіслано.';
    } else {
      await navigator.clipboard.writeText(data.url);
      actionStatus.textContent = 'Посилання скопійовано.';
    }
  } catch {
    actionStatus.textContent = 'Не вдалося поділитися. Скопіюйте адресу сторінки вручну.';
  }
});

markCurrent(0);
