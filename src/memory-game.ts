/**
 * memory-game.ts — Symbol Recall game logic
 * Handles: setup selection, card grid, flip/match logic, timer, end screen
 */
export {};

// ── Types ─────────────────────────────────────────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard';
type Theme = 'animals' | 'space' | 'food';

// ── Data ──────────────────────────────────────────────────────────────────────
const THEMES: Record<Theme, string[]> = {
  animals: ['🐶','🐱','🦊','🐰','🐻','🐼','🐯','🦁','🐸','🐨','🐧','🦆','🐴','🦉','🐵'],
  space:   ['🚀','🌙','⭐','🪐','☄️','🛸','👽','🔭','🌠','☀️','🌍','🌟','💫','🛰️','🌌'],
  food:    ['🍕','🍣','🎂','🍔','🌮','🍜','🍦','🍩','🍟','🍝','🍎','🍉','🥐','🌭','🍓'],
};

const LEVELS: Record<Difficulty, { cols: number; pairs: number }> = {
  easy:   { cols: 4, pairs: 6  },
  medium: { cols: 4, pairs: 8  },
  hard:   { cols: 6, pairs: 15 },
};

const STAR_THRESHOLDS: Record<Difficulty, [number, number]> = {
  easy:   [12, 18],
  medium: [16, 24],
  hard:   [30, 45],
};

const THEME_LABELS: Record<Theme, string> = {
  animals: 'Animals',
  space:   'Space',
  food:    'Food',
};

// ── Game state ────────────────────────────────────────────────────────────────
let difficulty: Difficulty = 'easy';
let theme: Theme = 'animals';
let flipped: HTMLElement[] = [];
let matchedCount = 0;
let moves = 0;
let seconds = 0;
let locked = false;
let timerInterval: ReturnType<typeof setInterval> | null = null;

// ── Utilities ─────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function getStars(d: Difficulty, m: number): number {
  const [hi, mid] = STAR_THRESHOLDS[d];
  return m <= hi ? 3 : m <= mid ? 2 : 1;
}

function setText(id: string, val: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Screen management ─────────────────────────────────────────────────────────
function showScreen(id: 'screen-setup' | 'screen-game' | 'screen-complete'): void {
  (['screen-setup', 'screen-game', 'screen-complete'] as const).forEach((s) => {
    document.getElementById(s)?.classList.toggle('hidden', s !== id);
  });
}

// ── Setup interactions ────────────────────────────────────────────────────────
function selectDifficulty(d: Difficulty): void {
  difficulty = d;
  document.querySelectorAll<HTMLElement>('[data-difficulty]').forEach((el) => {
    el.classList.toggle('is-selected', el.dataset.difficulty === d);
  });
  updateSummary();
}

function selectTheme(t: Theme): void {
  theme = t;
  document.querySelectorAll<HTMLElement>('[data-theme]').forEach((el) => {
    el.classList.toggle('is-selected', el.dataset.theme === t);
  });
  updateSummary();
}

function updateSummary(): void {
  setText('setup-summary', `${LEVELS[difficulty].pairs} pairs · ${THEME_LABELS[theme]} theme`);
}

document.querySelectorAll<HTMLElement>('[data-difficulty]').forEach((el) => {
  el.addEventListener('click', () => selectDifficulty(el.dataset.difficulty as Difficulty));
});

document.querySelectorAll<HTMLElement>('[data-theme]').forEach((el) => {
  el.addEventListener('click', () => selectTheme(el.dataset.theme as Theme));
});

// ── Start / restart ───────────────────────────────────────────────────────────
function startGame(): void {
  flipped = [];
  matchedCount = 0;
  moves = 0;
  seconds = 0;
  locked = false;

  if (timerInterval) clearInterval(timerInterval);

  buildGrid();
  updateHUD();
  showScreen('screen-game');

  timerInterval = setInterval(() => {
    seconds++;
    setText('hud-time', formatTime(seconds));
  }, 1000);
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function buildGrid(): void {
  const grid = document.getElementById('card-grid');
  if (!grid) return;

  const lvl = LEVELS[difficulty];
  const symbols = shuffle(THEMES[theme]).slice(0, lvl.pairs);
  const deck = shuffle([...symbols, ...symbols]);

  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${lvl.cols}, minmax(0, 1fr))`;
  grid.className = `grid w-full max-w-2xl mx-auto ${lvl.cols === 6 ? 'gap-1.5' : 'gap-2 sm:gap-3'}`;

  deck.forEach((symbol) => {
    const pairId = symbols.indexOf(symbol);
    const btn = document.createElement('button');
    btn.className = 'memory-card aspect-square';
    btn.dataset.pairId = String(pairId);
    btn.setAttribute('aria-label', 'Card face down');
    btn.innerHTML = `
      <div class="card-inner">
        <div class="card-back">
          <span class="card-back-symbol" aria-hidden="true">✦</span>
        </div>
        <div class="card-front">
          <span class="card-emoji" aria-hidden="true">${symbol}</span>
        </div>
      </div>`;
    btn.addEventListener('click', () => onCardClick(btn));
    grid.appendChild(btn);
  });
}

// ── Flip logic ────────────────────────────────────────────────────────────────
function onCardClick(card: HTMLElement): void {
  if (locked) return;
  if (card.classList.contains('flipped')) return;
  if (card.classList.contains('matched')) return;
  if (flipped.length >= 2) return;

  card.classList.add('flipped');
  card.setAttribute('aria-label', 'Card face up');
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    updateHUD();
    checkMatch();
  }
}

function checkMatch(): void {
  const [a, b] = flipped;
  if (a.dataset.pairId === b.dataset.pairId) {
    a.classList.add('matched');
    b.classList.add('matched');
    flipped = [];
    matchedCount++;
    updateHUD();
    if (matchedCount === LEVELS[difficulty].pairs) {
      setTimeout(endGame, 700);
    }
  } else {
    locked = true;
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      a.setAttribute('aria-label', 'Card face down');
      b.setAttribute('aria-label', 'Card face down');
      flipped = [];
      locked = false;
    }, 900);
  }
}

function updateHUD(): void {
  setText('hud-moves', String(moves));
  setText('hud-pairs', `${matchedCount}/${LEVELS[difficulty].pairs}`);
}

// ── End screen ────────────────────────────────────────────────────────────────
function endGame(): void {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  const s = getStars(difficulty, moves);
  const ratingLabels = ['', 'Keep practising!', 'Well done!', 'Perfect! 🎉'];

  setText('result-time', formatTime(seconds));
  setText('result-moves', String(moves));
  setText('result-pairs', `${LEVELS[difficulty].pairs}/${LEVELS[difficulty].pairs}`);
  setText('result-rating', ratingLabels[s]);

  const starsEl = document.getElementById('result-stars');
  if (starsEl) {
    starsEl.innerHTML = [0, 1, 2]
      .map((i) => `<span class="text-4xl ${i < s ? 'text-yellow-400' : 'text-slate-600'}">★</span>`)
      .join('');
  }

  showScreen('screen-complete');
}

// ── Button handlers ───────────────────────────────────────────────────────────
document.getElementById('btn-start')?.addEventListener('click', startGame);
document.getElementById('btn-play-again')?.addEventListener('click', startGame);

document.getElementById('btn-change-settings')?.addEventListener('click', () => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  showScreen('screen-setup');
});

document.getElementById('btn-quit')?.addEventListener('click', () => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  showScreen('screen-setup');
});

// ── Footer year ───────────────────────────────────────────────────────────────
document.querySelectorAll<HTMLSpanElement>('#footer-year').forEach((el) => {
  el.textContent = new Date().getFullYear().toString();
});

// ── Init ──────────────────────────────────────────────────────────────────────
selectDifficulty('easy');
selectTheme('animals');
showScreen('screen-setup');
