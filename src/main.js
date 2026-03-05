import { Board } from './board.js';
import { Engine } from './engine.js';
import { findChaosPosition, loadPositionDB } from './chaos.js';
import { initArt } from './art.js';
import { setTheme } from './themes.js';
import { identifyFamous } from './famous.js';

const statusEl = document.getElementById('status');
const evalTextEl = document.getElementById('eval-text');
const evalWhiteEl = document.getElementById('eval-white');
const chaosWarningEl = document.getElementById('chaos-warning');
const chaosCountEl = document.getElementById('chaos-count');
const eloDisplayEl = document.getElementById('elo-display');
const eloValueEl = document.getElementById('elo-value');

let engine;
let board;
let chaosTimerId = null;
let chaosCountdownId = null;
let chaosSeconds = 0;
let chaosRunning = false;
let gameOver = false;
let passAndPlay = false;
let moveCount = 0;
let chaosEveryMoves = 3 + Math.floor(Math.random() * 4); // 3-6 moves

let currentSkill = 10;
let powerupActive = false;
let eloDriftTimer = null;
let evalBonus = 0; // centipawns bonus from speed
let bonusHideTimer = null;

function skillToElo(skill) {
  return Math.round(10 + 9990 * Math.pow(skill / 20, 2));
}

function startEloDrift() {
  stopEloDrift();
  function drift() {
    if (gameOver) return;
    currentSkill = Math.max(0, Math.min(20, currentSkill + Math.floor(Math.random() * 5) - 2));
    engine.setSkill(currentSkill);
    eloValueEl.textContent = skillToElo(currentSkill);
    eloDriftTimer = setTimeout(drift, 1000 + Math.random() * 4000);
  }
  eloDriftTimer = setTimeout(drift, 1000 + Math.random() * 4000);
}

function stopEloDrift() {
  if (eloDriftTimer) { clearTimeout(eloDriftTimer); eloDriftTimer = null; }
}

function updateFavorDisplay(evalResult) {
  if (!evalResult) return;
  let value = 0;
  if (evalResult.type === 'mate') {
    value = evalResult.value > 0 ? 9999 : -9999;
  } else {
    value = evalResult.value;
  }
  if (value > 50) {
    eloValueEl.textContent = 'White';
    eloDisplayEl.className = 'favor-white';
  } else if (value < -50) {
    eloValueEl.textContent = 'Black';
    eloDisplayEl.className = 'favor-black';
  } else {
    eloValueEl.textContent = 'Even';
    eloDisplayEl.className = 'favor-even';
  }
}

function rollChaosTimer() {
  clearChaosTimer();
  chaosRunning = false;
  chaosWarningEl.className = 'hidden';

  // Time-based chaos
  chaosSeconds = 10 + Math.floor(Math.random() * 11); // 10-20 seconds
  chaosCountdownId = setInterval(() => {
    if (gameOver || chaosRunning) return;
    chaosSeconds--;

    if (chaosSeconds <= 3 && chaosSeconds > 0) {
      updateChaosWarning();
    }

    if (chaosSeconds <= 0) {
      clearInterval(chaosCountdownId);
      chaosCountdownId = null;
      triggerChaos();
    }
  }, 1000);

  // Move-based chaos
  moveCount = 0;
  chaosEveryMoves = 3 + Math.floor(Math.random() * 4); // 3-6 moves
}

function clearChaosTimer() {
  if (chaosTimerId) { clearTimeout(chaosTimerId); chaosTimerId = null; }
  if (chaosCountdownId) { clearInterval(chaosCountdownId); chaosCountdownId = null; }
}

function updateChaosWarning() {
  if (gameOver) {
    chaosWarningEl.className = 'hidden';
    return;
  }
  if (chaosSeconds <= 0) { chaosWarningEl.className = 'hidden'; return; }
  chaosWarningEl.className = 'imminent';
  chaosCountEl.textContent = chaosSeconds + 's';
}

async function triggerChaos() {
  if (gameOver || chaosRunning) return;
  chaosRunning = true;
  board.interactive = false;
  chaosWarningEl.className = 'hidden';

  // Reset speed bonus on chaos
  if (bonusHideTimer) clearTimeout(bonusHideTimer);
  evalBonus = 0;
  const bonusEl = document.getElementById('speed-bonus');
  if (bonusEl) {
    document.getElementById('speed-bonus-value').textContent = '0.0';
    bonusEl.classList.add('hidden');
    bonusEl.classList.remove('flash');
  }

  // Evaluate current position
  setStatus('CHAOS!', true);
  const evalResult = await engine.evaluate(board.fen, 10);
  updateEvalDisplay(evalResult);

  // Find and swap to chaos position
  const result = await findChaosPosition(
    engine,
    evalResult,
    board.fen,
    (tried, phase) => setStatus(`${phase} (${tried} tested)`, true)
  );

  if (result) {
    updateEvalDisplay(result.eval);
    await new Promise(resolve => board.morphTo(result.fen, resolve));
    showFamousCallout(result.fen);
  }

  if (board.chess.isGameOver()) {
    handleGameOver();
    return;
  }

  chaosRunning = false;

  // If it's black's turn after chaos and we're vs engine, engine needs to move
  if (!passAndPlay && board.chess.turn() === 'b') {
    setStatus('Opponent thinking...', true);
    const bestMove = await engine.bestMove(board.fen, 10);
    if (bestMove) board.makeUciMove(bestMove);

    if (board.chess.isGameOver()) {
      handleGameOver();
      return;
    }

    const evalAfter = await engine.evaluate(board.fen, 10);
    updateEvalDisplay(evalAfter);
  }

  rollChaosTimer();
  const turn = passAndPlay ? (board.chess.turn() === 'w' ? "White's move" : "Black's move") : 'Your move';
  setStatus(turn);
  board.interactive = true;
}

let famousTimeout = null;

function showFamousCallout(fen) {
  const desc = identifyFamous(fen);
  if (!desc) return;
  const el = document.getElementById('famous-callout');
  if (!el) return;
  el.textContent = desc;
  el.classList.remove('hidden');
  el.classList.add('visible');
  if (famousTimeout) clearTimeout(famousTimeout);
  famousTimeout = setTimeout(() => {
    el.classList.remove('visible');
    el.classList.add('hidden');
  }, 6000);
}

function setStatus(text, thinking = false) {
  statusEl.textContent = text;
  statusEl.className = thinking ? 'thinking' : '';
}

function updateEvalDisplay(evalResult) {
  if (!evalResult) return;
  // Normalize to white's perspective (Stockfish returns from side-to-move's POV)
  const flip = board.chess.turn() === 'b' ? -1 : 1;
  const whiteVal = evalResult.value * flip;
  const whiteEval = { type: evalResult.type, value: whiteVal };

  if (whiteEval.type === 'mate') {
    const sign = whiteVal > 0 ? '+' : '';
    evalTextEl.textContent = `M${sign}${whiteVal}`;
    evalWhiteEl.style.width = whiteVal > 0 ? '95%' : '5%';
  } else {
    const adjusted = whiteVal + evalBonus;
    const pawns = adjusted / 100;
    const sign = pawns >= 0 ? '+' : '';
    const bonusTag = evalBonus > 0 ? ` (+${(evalBonus / 100).toFixed(1)})` : '';
    evalTextEl.textContent = `${sign}${pawns.toFixed(1)}${bonusTag}`;
    const pct = Math.max(5, Math.min(95, 50 + (adjusted / 10)));
    evalWhiteEl.style.width = `${pct}%`;
  }
  updateFavorDisplay(whiteEval);
}

async function onPlayerMove(move) {
  board.interactive = false;

  // Move-based chaos check
  if (!chaosRunning) {
    moveCount++;

    // Increment speed bonus on each move (+0.5 per move)
    if (bonusHideTimer) { clearTimeout(bonusHideTimer); bonusHideTimer = null; }
    evalBonus += 50;
    const bonusEl = document.getElementById('speed-bonus');
    if (bonusEl) {
      document.getElementById('speed-bonus-value').textContent = (evalBonus / 100).toFixed(1);
      bonusEl.classList.remove('hidden', 'flash');
      void bonusEl.offsetWidth;
      bonusEl.classList.add('flash');
    }

    if (moveCount >= chaosEveryMoves) {
      await triggerChaos();
      return;
    }
  }

  setStatus('Evaluating...', true);
  showFamousCallout(board.fen);
  const evalResult = await engine.evaluate(board.fen, 10);
  updateEvalDisplay(evalResult);

  if (board.chess.isGameOver()) {
    handleGameOver();
    return;
  }

  if (passAndPlay) {
    const turn = board.chess.turn() === 'w' ? 'White' : 'Black';
    setStatus(`${turn}'s move`);
    board.interactive = true;
    return;
  }

  // Engine plays black
  setStatus('Opponent thinking...', true);
  const bestMove = await engine.bestMove(board.fen, 10);
  if (bestMove) {
    board.makeUciMove(bestMove);
    showFamousCallout(board.fen);
  }

  if (board.chess.isGameOver()) {
    handleGameOver();
    return;
  }

  const evalAfter = await engine.evaluate(board.fen, 10);
  updateEvalDisplay(evalAfter);

  setStatus('Your move (White)');
  board.interactive = true;
}

function handleGameOver() {
  gameOver = true;
  board.interactive = false;
  clearChaosTimer();
  chaosWarningEl.className = 'hidden';
  if (board.chess.isCheckmate()) {
    const winner = board.chess.turn() === 'w' ? 'Black' : 'White';
    setStatus(`Checkmate! ${winner} wins!`);
  } else if (board.chess.isDraw()) {
    setStatus('Draw!');
  } else if (board.chess.isStalemate()) {
    setStatus('Stalemate!');
  } else {
    setStatus('Game over!');
  }
}

function resetGame() {
  gameOver = false;
  board.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  board.interactive = true;
  currentSkill = 10;
  engine.setSkill(10);
  evalBonus = 0;
  if (bonusHideTimer) { clearTimeout(bonusHideTimer); bonusHideTimer = null; }
  const bonusEl = document.getElementById('speed-bonus');
  if (bonusEl) { bonusEl.classList.add('hidden'); bonusEl.classList.remove('flash'); }
  updateEvalDisplay({ type: 'cp', value: 0 });
  board.allowBothSides = passAndPlay;
  rollChaosTimer();
  setStatus(passAndPlay ? "White's move" : 'Your move (White)');
}

function toggleMode() {
  passAndPlay = !passAndPlay;
  board.allowBothSides = passAndPlay;
  const modeBtn = document.getElementById('mode-toggle');
  modeBtn.textContent = passAndPlay ? 'vs Engine' : 'Pass & Play';
  resetGame();
}

function setupThemeButtons() {
  const buttons = document.querySelectorAll('#theme-selector button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeKey = btn.dataset.theme;
      setTheme(themeKey);
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

async function init() {
  setTheme('arcade');
  initArt(document.getElementById('bg-canvas'));
  setupThemeButtons();
  setStatus('Loading engine...', true);

  engine = new Engine();
  await Promise.all([engine.init(), loadPositionDB()]);

  board = new Board(document.getElementById('board'), onPlayerMove);
  document.getElementById('new-game').addEventListener('click', resetGame);
  document.getElementById('mode-toggle').addEventListener('click', toggleMode);
  const eloSlider = document.getElementById('elo-slider');
  const eloSliderValue = document.getElementById('elo-slider-value');
  eloSlider.addEventListener('input', () => {
    const skill = parseInt(eloSlider.value);
    currentSkill = skill;
    engine.setSkill(skill);
    eloSliderValue.textContent = skillToElo(skill);
  });

  gameOver = false;
  rollChaosTimer();
  updateFavorDisplay({ type: 'cp', value: 0 });
  setStatus('Your move (White)');
}

init();
