const STORAGE_KEY = 'chaos-chess-leaderboard';
const MAX_ENTRIES = 10;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function addEntry({ name, result, moves, chaosEvents, eloAtEnd }) {
  const entries = load();
  entries.push({
    name: name || 'Anonymous',
    result,
    moves,
    chaosEvents,
    elo: eloAtEnd,
    score: calcScore(result, moves, chaosEvents),
    date: new Date().toLocaleDateString(),
  });
  entries.sort((a, b) => b.score - a.score);
  save(entries);
  return entries.slice(0, MAX_ENTRIES);
}

function calcScore(result, moves, chaosEvents) {
  let base = 0;
  if (result === 'win') base = 1000;
  else if (result === 'draw') base = 400;
  else base = 50;
  return base + moves * 5 + chaosEvents * 50;
}

export function getEntries() {
  return load().slice(0, MAX_ENTRIES);
}

export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
}

export function renderLeaderboard(container) {
  const entries = getEntries();
  container.innerHTML = '';

  // Click backdrop or press Escape to close
  container.onclick = (e) => {
    if (e.target === container) container.classList.add('hidden');
  };
  const onKey = (e) => {
    if (e.key === 'Escape') {
      container.classList.add('hidden');
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);

  const modal = document.createElement('div');
  modal.className = 'lb-modal';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lb-close';
  closeBtn.textContent = 'X';
  closeBtn.addEventListener('click', () => container.classList.add('hidden'));
  modal.appendChild(closeBtn);

  const title = document.createElement('div');
  title.className = 'lb-title';
  title.textContent = 'LEADERBOARD';
  modal.appendChild(title);

  if (entries.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'lb-empty';
    empty.textContent = 'No games yet. Play to get on the board!';
    modal.appendChild(empty);
    container.appendChild(modal);
    return;
  }

  const table = document.createElement('table');
  table.className = 'lb-table';

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>#</th><th>Name</th><th>Result</th><th>Moves</th><th>Chaos</th><th>Score</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  entries.forEach((e, i) => {
    const tr = document.createElement('tr');
    if (i === 0) tr.className = 'lb-gold';
    else if (i === 1) tr.className = 'lb-silver';
    else if (i === 2) tr.className = 'lb-bronze';

    const resultText = e.result === 'win' ? 'W' : e.result === 'draw' ? 'D' : 'L';
    tr.innerHTML = `<td>${i + 1}</td><td>${esc(e.name)}</td><td class="lb-${e.result}">${resultText}</td><td>${e.moves}</td><td>${e.chaosEvents}</td><td>${e.score}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  modal.appendChild(table);
  container.appendChild(modal);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
