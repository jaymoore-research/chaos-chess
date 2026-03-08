import { Chess } from 'chess.js';

let positionDB = null;
let dbIndex = null; // keyed by piecesKey

export async function loadPositionDB() {
  const resp = await fetch('/positions.json');
  positionDB = await resp.json();

  // Pre-index by exact piece composition for fast lookup
  dbIndex = {};
  for (const fen of positionDB) {
    const key = piecesKey(fen);
    if (!dbIndex[key]) dbIndex[key] = [];
    dbIndex[key].push(fen);
  }

  console.log(`Loaded ${positionDB.length} positions, ${Object.keys(dbIndex).length} unique piece sets`);
}

// Creates a canonical string of exactly which pieces are on the board
// e.g. "bB2bK1bN2bP8bQ1bR2wB2wK1wN2wP8wQ1wR2"
function piecesKey(fen) {
  const placement = fen.split(' ')[0];
  const counts = {};
  for (const ch of placement) {
    if (ch === '/' || (ch >= '1' && ch <= '8')) continue;
    counts[ch] = (counts[ch] || 0) + 1;
  }
  return Object.keys(counts).sort().map(k => `${k}${counts[k]}`).join('');
}

function sampleFromDB(currentFen, sideToMove, count) {
  const key = piecesKey(currentFen);
  const exactMatches = dbIndex[key] || [];

  // Filter by side to move
  const matching = exactMatches.filter(fen => fen.split(' ')[1] === sideToMove);

  if (matching.length === 0) return [];

  // Random sample
  const shuffled = [...matching].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function mutatePosition(fen) {
  const chess = new Chess(fen);
  const board = chess.board();
  const pieces = [];
  const empty = [];

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = String.fromCharCode(97 + f) + (8 - r);
      const piece = board[r][f];
      if (piece && piece.type !== 'k') {
        pieces.push({ sq, piece });
      } else if (!piece) {
        empty.push(sq);
      }
    }
  }

  if (pieces.length === 0 || empty.length === 0) return null;

  const srcIdx = Math.floor(Math.random() * pieces.length);
  const { sq: srcSq, piece } = pieces[srcIdx];

  const validEmpty = empty.filter(sq => {
    if (piece.type === 'p') {
      const rank = parseInt(sq[1]);
      return rank > 1 && rank < 8;
    }
    return true;
  });

  if (validEmpty.length === 0) return null;
  const dstSq = validEmpty[Math.floor(Math.random() * validEmpty.length)];

  chess.remove(srcSq);
  chess.put(piece, dstSq);

  const newFen = chess.fen();

  try {
    const test = new Chess(newFen);
    if (test.isGameOver()) return null;
    return newFen;
  } catch {
    return null;
  }
}

const EVAL_DEPTH = 8;

export async function findChaosPosition(engine, targetEval, currentFen, onProgress) {
  if (targetEval.type === 'mate') return null;

  const target = targetEval.value;
  const sideToMove = currentFen.split(' ')[1];
  const TOLERANCE = 50; // centipawns

  let bestFen = null;
  let bestDiff = Infinity;
  let bestEval = null;
  let totalTried = 0;

  // Phase 1: Sample positions with exact same pieces from database
  const candidates = sampleFromDB(currentFen, sideToMove, 30);

  for (const fen of candidates) {
    totalTried++;
    if (onProgress) onProgress(totalTried, 'Searching classic games...');

    const evalResult = await engine.evaluate(fen, EVAL_DEPTH);
    if (evalResult.type === 'mate') continue;

    const diff = Math.abs(evalResult.value - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestFen = fen;
      bestEval = evalResult;
    }
    if (diff <= TOLERANCE) return { fen: bestFen, eval: bestEval };
  }

  // Phase 2: Mutation hill-climbing — moves pieces around (same piece set preserved)
  // If no DB match, start from the current position
  let currentFenMut = bestFen || currentFen;
  let currentDiff = bestFen ? bestDiff : Infinity;
  const iterations = bestFen ? 40 : 80; // more iterations when generating from scratch

  for (let i = 0; i < iterations; i++) {
    totalTried++;
    if (onProgress) onProgress(totalTried, bestFen ? 'Refining position...' : 'Generating position...');

    const mutated = mutatePosition(currentFenMut);
    if (!mutated) continue;

    const evalResult = await engine.evaluate(mutated, EVAL_DEPTH);
    if (evalResult.type === 'mate') continue;

    const diff = Math.abs(evalResult.value - target);

    const temperature = 1 - (i / iterations);
    const acceptWorse = Math.random() < temperature * 0.3;

    if (diff < currentDiff || (acceptWorse && diff < currentDiff + 100)) {
      currentFenMut = mutated;
      currentDiff = diff;

      if (diff < bestDiff) {
        bestDiff = diff;
        bestFen = currentFenMut;
        bestEval = evalResult;
      }
    }

    if (bestDiff <= TOLERANCE) return { fen: bestFen, eval: bestEval };
  }

  if (bestFen) return { fen: bestFen, eval: bestEval };

  // Phase 3: Last resort — return any valid mutated position
  for (let i = 0; i < 20; i++) {
    const mutated = mutatePosition(currentFen);
    if (!mutated) continue;
    const evalResult = await engine.evaluate(mutated, EVAL_DEPTH);
    if (evalResult.type !== 'mate') {
      return { fen: mutated, eval: evalResult };
    }
  }

  return null;
}
