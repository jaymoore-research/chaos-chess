import { Board } from './board.js';
import { Engine } from './engine.js';
import { findChaosPosition, loadPositionDB } from './chaos.js';
import { initArt } from './art.js';
import { setTheme } from './themes.js';

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

// Skill 0-20 → approximate elo (range 10-10000)
function skillToElo(skill) {
  return Math.round(10 + 9990 * Math.pow(skill / 20, 2));
}

let currentSkill = 10;
let eloShiftInterval = null;

function startEloDrift() {
  if (eloShiftInterval) clearTimeout(eloShiftInterval);
  function drift() {
    if (gameOver) return;
    if (!chaosRunning) {
      const delta = Math.floor(Math.random() * 5) - 2;
      currentSkill = Math.max(0, Math.min(20, currentSkill + delta));
      engine.setSkill(currentSkill);
      eloValueEl.textContent = skillToElo(currentSkill);
    }
    const nextDelay = 1000 + Math.floor(Math.random() * 4000); // 1-5 seconds
    eloShiftInterval = setTimeout(drift, nextDelay);
  }
  const nextDelay = 1000 + Math.floor(Math.random() * 4000);
  eloShiftInterval = setTimeout(drift, nextDelay);
}

function stopEloDrift() {
  if (eloShiftInterval) { clearTimeout(eloShiftInterval); eloShiftInterval = null; }
}

function rollChaosTimer() {
  clearChaosTimer();
  chaosSeconds = 10 + Math.floor(Math.random() * 11); // 10-20 seconds
  chaosRunning = false;
  chaosWarningEl.className = 'hidden';

  chaosCountdownId = setInterval(() => {
    if (gameOver || chaosRunning) return;
    chaosSeconds--;

    // Only show warning in the last 3 seconds
    if (chaosSeconds <= 3 && chaosSeconds > 0) {
      updateChaosWarning();
    }

    if (chaosSeconds <= 0) {
      clearInterval(chaosCountdownId);
      chaosCountdownId = null;
      triggerChaos();
    }
  }, 1000);
}

function clearChaosTimer() {
  if (chaosTimerId) { clearTimeout(chaosTimerId); chaosTimerId = null; }
  if (chaosCountdownId) { clearInterval(chaosCountdownId); chaosCountdownId = null; }
}

function updateChaosWarning() {
  if (chaosSeconds <= 0 || gameOver) {
    chaosWarningEl.className = 'hidden';
    return;
  }
  chaosWarningEl.className = 'imminent';
  chaosCountEl.textContent = chaosSeconds + 's';
}

async function triggerChaos() {
  if (gameOver || chaosRunning) return;
  chaosRunning = true;
  board.interactive = false;
  chaosWarningEl.className = 'hidden';

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
  }

  if (board.chess.isGameOver()) {
    handleGameOver();
    return;
  }

  // Big random skill jump on chaos
  currentSkill = Math.floor(Math.random() * 21);
  engine.setSkill(currentSkill);
  eloValueEl.textContent = skillToElo(currentSkill);
  eloDisplayEl.classList.remove('elo-changed');
  void eloDisplayEl.offsetWidth;
  eloDisplayEl.classList.add('elo-changed');

  chaosRunning = false;

  // If it's black's turn after chaos, engine needs to move
  if (board.chess.turn() === 'b') {
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
  setStatus(`Your move — opponent ELO shifted!`);
  board.interactive = true;
}

function setStatus(text, thinking = false) {
  statusEl.textContent = text;
  statusEl.className = thinking ? 'thinking' : '';
}

function updateEvalDisplay(evalResult) {
  if (!evalResult) return;
  if (evalResult.type === 'mate') {
    const sign = evalResult.value > 0 ? '+' : '';
    evalTextEl.textContent = `M${sign}${evalResult.value}`;
    evalWhiteEl.style.width = evalResult.value > 0 ? '95%' : '5%';
  } else {
    const pawns = evalResult.value / 100;
    const sign = pawns >= 0 ? '+' : '';
    evalTextEl.textContent = `${sign}${pawns.toFixed(1)}`;
    const pct = Math.max(5, Math.min(95, 50 + (evalResult.value / 10)));
    evalWhiteEl.style.width = `${pct}%`;
  }
}

async function onPlayerMove(move) {
  board.interactive = false;

  setStatus('Evaluating...', true);
  const evalResult = await engine.evaluate(board.fen, 10);
  updateEvalDisplay(evalResult);

  if (board.chess.isGameOver()) {
    handleGameOver();
    return;
  }

  // Engine plays black
  setStatus('Opponent thinking...', true);
  const bestMove = await engine.bestMove(board.fen, 10);
  if (bestMove) board.makeUciMove(bestMove);

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
  stopEloDrift();
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
  eloValueEl.textContent = skillToElo(10);
  startEloDrift();
  updateEvalDisplay({ type: 'cp', value: 0 });
  rollChaosTimer();
  setStatus('Your move (White)');
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

  gameOver = false;
  rollChaosTimer();
  startEloDrift();
  setStatus('Your move (White)');
}

init();
