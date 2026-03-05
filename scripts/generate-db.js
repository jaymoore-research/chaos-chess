import { Chess } from 'chess.js';
import { writeFileSync } from 'fs';

const positions = new Set();

// Classic games as SAN move arrays
const CLASSIC_GAMES = [
  // Immortal Game - Anderssen vs Kieseritzky, 1851
  '1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5 9.Nf5 c6 10.g4 Nf6 11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng8 15.Bxf4 Qf6 16.Nc3 Bc5 17.Nd5 Qxb2 18.Bd6 Bxg1 19.e5 Qxa1+ 20.Ke2 Na6 21.Nxg7+ Kd8 22.Qf6+ Nxf6 23.Be7#',

  // Evergreen Game - Anderssen vs Dufresne, 1852
  '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24.Bxe7#',

  // Opera Game - Morphy vs Duke of Brunswick, 1858
  '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8#',

  // Game of the Century - Fischer vs Byrne, 1956
  '1.Nf3 Nf6 2.c4 g6 3.Nc3 Bg7 4.d4 O-O 5.Bf4 d5 6.Qb3 dxc4 7.Qxc4 c6 8.e4 Nbd7 9.Rd1 Nb6 10.Qc5 Bg4 11.Bg5 Na4 12.Qa3 Nxc3 13.bxc3 Nxe4 14.Bxe7 Qb6 15.Bc4 Nxc3 16.Bc5 Rfe8+ 17.Kf1 Be6 18.Bxb6 Bxc4+ 19.Kg1 Ne2+ 20.Kf1 Nxd4+ 21.Kg1 Ne2+ 22.Kf1 Nc3+ 23.Kg1 axb6 24.Qb4 Ra4 25.Qxb6 Nxd1 26.h3 Rxa2 27.Kh2 Nxf2 28.Re1 Rxe1 29.Qd8+ Bf8 30.Nxe1 Bd5 31.Nf3 Ne4 32.Qb8 b5 33.h4 h5 34.Ne5 Kg7 35.Kg1 Bc5+ 36.Kf1 Ng3+ 37.Ke1 Bb4+ 38.Kd1 Bb3+ 39.Kc1 Ne2+ 40.Kb1 Nc3+ 41.Kc1 Rc2#',

  // Kasparov vs Topalov, 1999 (Kasparov's Immortal)
  '1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Be3 Bg7 5.Qd2 c6 6.f3 b5 7.Nge2 Nbd7 8.Bh6 Bxh6 9.Qxh6 Bb7 10.a3 e5 11.O-O-O Qe7 12.Kb1 a6 13.Nc1 O-O-O 14.Nb3 exd4 15.Rxd4 c5 16.Rd1 Nb6 17.g3 Kb8 18.Na5 Ba8 19.Bh3 d5 20.Qf4+ Ka7 21.Re1 d4 22.Nd5 Nbxd5 23.exd5 Qd6 24.Rxd4 cxd4 25.Re7+ Kb6 26.Qxd4+ Kxa5 27.b4+ Ka4 28.Qc3 Qxd5 29.Ra7 Bb7 30.Rxb7 Qc4 31.Qxf6 Kxa3 32.Qxa6+ Kxb4 33.c3+ Kxc3 34.Qa1+ Kd2 35.Qb2+ Kd1 36.Bf1 Rd2 37.Rd7 Rxd7 38.Bxc4 bxc4 39.Qxh8 Rd3 40.Qa8 c3 41.Qa4+ Ke1 42.f4 f5 43.Kc1 Rd2 44.Qa7',

  // Byrne vs Fischer, 1963 (US Championship)
  '1.d4 Nf6 2.c4 g6 3.g3 c6 4.Bg2 d5 5.cxd5 cxd5 6.Nc3 Bg7 7.e3 O-O 8.Nge2 Nc6 9.O-O b6 10.b3 Ba6 11.Ba3 Re8 12.Qd2 e5 13.dxe5 Nxe5 14.Rfd1 Nd3 15.Qc2 Nxf2 16.Kxf2 Ng4+ 17.Kg1 Nxe3 18.Qd2 Nxg2 19.Kxg2 d4 20.Nxd4 Bb7+ 21.Kf1 Qd7',

  // Tal vs Botvinnik, 1960 World Championship Game 6
  '1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5 c5 5.a3 Bxc3+ 6.bxc3 Ne7 7.Qg4 Qc7 8.Qxg7 Rg8 9.Qxh7 cxd4 10.Ne2 Nbc6 11.f4 Bd7 12.Qd3 dxc3 13.Nxc3 a6 14.Ne2 Nf5 15.g4 Nh4 16.Rg1 O-O-O 17.Be3 Nxe5 18.Qd4 Ng6 19.fxe5 Qxe5',

  // Capablanca vs Marshall, 1918 (Marshall Attack)
  '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d5 9.exd5 Nxd5 10.Nxe5 Nxe5 11.Rxe5 Nf6 12.Re1 Bd6 13.h3 Ng4 14.Qf3 Qh4 15.d4 Nxf2 16.Re2 Bg4 17.hxg4 Bh2+ 18.Kf1 Bg3 19.Rxf2 Qh1+ 20.Ke2 Bxf2 21.Bd2 Bh4 22.Qh3 Rae8+ 23.Kd3 Qf1+ 24.Kc2 Bf2 25.Qf3 Qg1 26.Bd5 c5 27.dxc5 Qxc5 28.b4 Qe3 29.Qxe3 Rxe3 30.a4',

  // Karpov vs Kasparov, 1985 World Championship Game 16
  '1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6 5.Nb5 d6 6.c4 Nf6 7.N1c3 a6 8.Na3 d5 9.cxd5 exd5 10.exd5 Nb4 11.Be2 Bc5 12.O-O O-O 13.Bf3 Bf5 14.Bg5 Re8 15.Qd2 b5 16.Rad1 Nd3 17.Nab1 h6 18.Bh4 b4 19.Na4 Bd6 20.Bg3 Rc8 21.b3 g5 22.Bxd6 Qxd6 23.g3 Nd7 24.Bg2 Qf6 25.a3 a5 26.axb4 axb4 27.Qa2 Bg6 28.d6 g4 29.Qd2 Kg7 30.f3 Qxd6 31.fxg4 Qd4+ 32.Kh1 Nf6 33.Rf4 Ne4 34.Qxd3 Nf2+ 35.Rxf2 Bxd3 36.Rfd2 Qe3 37.Rxd3 Rc1 38.Nb2 Qf2 39.Nd2 Rxd1+ 40.Nxd1 Re1+',

  // Spassky vs Fischer, 1972 World Championship Game 6
  '1.c4 e6 2.Nf3 d5 3.d4 Nf6 4.Nc3 Be7 5.Bg5 O-O 6.e3 h6 7.Bh4 b6 8.cxd5 Nxd5 9.Bxe7 Qxe7 10.Nxd5 exd5 11.Rc1 Be6 12.Qa4 c5 13.Qa3 Rc8 14.Bb5 a6 15.dxc5 bxc5 16.O-O Ra7 17.Be2 Nd7 18.Nd4 Qf8 19.Nxe6 fxe6 20.e4 d4 21.f4 Qe7 22.e5 Rb8 23.Bc4 Kh8 24.Qh3 Nf8 25.b3 a5 26.f5 exf5 27.Rxf5 Nh7 28.Rcf1 Qd8 29.Qg3 Re7 30.h4 Rbb7 31.e6 Rbc7 32.Qe5 Qe8 33.a4 Qd8 34.R1f2 Qe8 35.R2f3 Qd8 36.Bd3 Qe8 37.Qe4 Nf6 38.Rxf6 gxf6 39.Rxf6 Kg8 40.Bc4 Kh8 41.Qf4',

  // Alekhine vs Capablanca, 1927 WC Game 34
  '1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.e3 Be7 6.Nf3 O-O 7.Rc1 a6 8.a3 h6 9.Bh4 dxc4 10.Bxc4 b5 11.Be2 Bb7 12.O-O c5 13.dxc5 Nxc5 14.Nd4 Rc8 15.b4 Nce4 16.Nxe4 Nxe4 17.Bxe7 Qxe7 18.f3 Nf6 19.Bf1',

  // Modern classic: Carlsen vs Anand, 2013 WC Game 5
  '1.c4 e6 2.d4 d5 3.Nc3 c6 4.e4 dxe4 5.Nxe4 Bb4+ 6.Nc3 c5 7.a3 Ba5 8.Nf3 Nf6 9.Be3 Nc6 10.Qd3 cxd4 11.Nxd4 Ng4 12.O-O-O Nxe3 13.fxe3 Bc7 14.Ncb5 Bb8 15.Qxd8+ Nxd8 16.Nxa7',

  // Kasparov vs Deep Blue, 1996 Game 1
  '1.e4 c5 2.Nf3 d6 3.Bb5+ Bd7 4.Bxd7+ Qxd7 5.c4 Nc6 6.Nc3 Nf6 7.O-O g6 8.d4 cxd4 9.Nxd4 Bg7 10.Nde2 Qe6 11.Nd5 Qxe4 12.Nc7+ Kd7 13.Nxa8 Qxc4 14.Nb6+ axb6 15.Nc3 Ra8 16.a4 Ne4 17.Nxe4 Qxe4 18.Qb3 f5 19.Bg5 Qb4 20.Qf7 Be5 21.h3 Rxa4 22.Rxa4 Qxa4 23.Qxh7 Bxb2 24.Qxg6 Qe4 25.Qf7 Bd4 26.Qb3 f4 27.Qf7 Be5 28.h4 b5 29.h5 Qc4 30.Qf5+ Qe6 31.Qxe6+ Kxe6 32.g3 fxg3 33.fxg3 b4 34.Bf4 Bd4+ 35.Kh1 b3 36.g4 Kd5 37.g5 e6',

  // Petrosian vs Fischer, 1971 Candidates Game 1
  '1.d4 Nf6 2.c4 e6 3.Nf3 d5 4.Nc3 c5 5.cxd5 Nxd5 6.e3 Nc6 7.Bd3 Be7 8.O-O O-O 9.a3 cxd4 10.exd4 Bf6 11.Be4 Nce7 12.Qd3 g6 13.Rd1 b6 14.Bh6 Re8 15.Rac1 Bb7 16.Bg5 Rc8',

  // Botvinnik vs Capablanca, 1938 AVRO
  '1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 d5 5.a3 Bxc3+ 6.bxc3 c5 7.cxd5 exd5 8.Bd3 O-O 9.Ne2 b6 10.O-O Ba6 11.Bxa6 Nxa6 12.Bb2 Qd7 13.a4 Rfe8 14.Qd3 c4 15.Qc2 Nb8 16.Rae1 Nc6 17.Ng3 Na5 18.f3 Nb3 19.e4 Qxa4 20.e5 Nd7 21.Qf2 g6 22.f4 f5 23.exf6 Nxf6 24.f5 Rxe1 25.Rxe1 Re8 26.Re6 Rxe6 27.fxe6 Kg7 28.Qf4 Qe8 29.Qe5 Qe7 30.Ba3 Qxa3 31.Nh5+ gxh5 32.Qg5+ Kf8 33.Qxf6+ Kg8 34.e7 Qc1+ 35.Kf2 Qc2+ 36.Kg3 Qd3+ 37.Kh4 Qe4+ 38.Kxh5 Qe2+ 39.Kh4 Qe4+ 40.g4 Qe1+ 41.Kh5',
];

function collectPositionsFromPGN(pgn) {
  const chess = new Chess();
  // Parse the move text - strip move numbers and result
  const moves = pgn
    .replace(/\d+\./g, '')
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '')
    .trim()
    .split(/\s+/)
    .filter(m => m.length > 0);

  for (const move of moves) {
    try {
      chess.move(move);
      positions.add(chess.fen());
    } catch {
      break;
    }
  }
}

// Collect positions from classic games
for (const pgn of CLASSIC_GAMES) {
  collectPositionsFromPGN(pgn);
}

// Also generate positions from random games for broader eval coverage
const NUM_RANDOM_GAMES = 300;
const MAX_MOVES = 80;

for (let g = 0; g < NUM_RANDOM_GAMES; g++) {
  const chess = new Chess();
  for (let m = 0; m < MAX_MOVES; m++) {
    const moves = chess.moves();
    if (moves.length === 0) break;
    chess.move(moves[Math.floor(Math.random() * moves.length)]);
    // Save every other position to keep size reasonable
    if (m >= 4 && m % 2 === 0) {
      positions.add(chess.fen());
    }
  }
}

// Also generate some positions from common openings played more naturally
// (play top 3 random moves for first 10 moves, then random after)
for (let g = 0; g < 100; g++) {
  const chess = new Chess();
  for (let m = 0; m < 60; m++) {
    const moves = chess.moves();
    if (moves.length === 0) break;
    // For first 10 moves, pick from top 5 moves (alphabetically, as a rough heuristic)
    const pool = m < 10 ? moves.slice(0, Math.min(5, moves.length)) : moves;
    chess.move(pool[Math.floor(Math.random() * pool.length)]);
    if (m >= 4) {
      positions.add(chess.fen());
    }
  }
}

const result = [...positions];
console.log(`Generated ${result.length} positions`);
writeFileSync('public/positions.json', JSON.stringify(result));
