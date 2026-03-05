// Famous chess positions — matched by piece placement only (ignore side to move, castling, etc.)
// Key: first part of FEN (piece placement), Value: description string

const FAMOUS = {
  // Immortal Game — Anderssen vs Kieseritzky, 1851
  'r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1':
    'THE IMMORTAL GAME! Anderssen vs Kieseritzky, 1851',
  // Evergreen Game — Anderssen vs Dufresne, 1852 (final)
  '1r1kr3/Nbppn1pp/1b6/8/6p1/3B1q2/PPPN1PpP/R2Q1RK1':
    'THE EVERGREEN GAME! Anderssen vs Dufresne, 1852',
  // Opera Game — Morphy vs Duke/Count, 1858 (final position)
  'rn2kb1r/p3qppp/2p2n2/1p2p1B1/4P3/1B6/PPP2PPP/RN1QR1K1':
    'THE OPERA GAME! Morphy vs Duke of Brunswick, 1858',
  // Kasparov vs Topalov, 1999 — "Kasparov's Immortal"
  'r1bqk2r/pp1nbppp/2p1pn2/3p4/2PP4/1PN1PN2/PB3PPP/R2QKB1R':
    'Kasparov vs Topalov, Wijk aan Zee 1999',
  // Game of the Century — Byrne vs Fischer, 1956
  '1Q6/5pk1/2p3p1/1p2N2p/1b5P/1bn5/2r3P1/2K5':
    'GAME OF THE CENTURY! Byrne vs Fischer, 1956',
  // Deep Blue vs Kasparov Game 6, 1997
  'r1b1k2r/pppp1ppp/8/8/1nBPn2q/2N5/PPP2bPP/R1BQR1K1':
    'Deep Blue vs Kasparov, Game 6, 1997',
  // Kasparov vs Deep Blue Game 1, 1996
  'rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R':
    'Semi-Slav — Kasparov vs Deep Blue, 1996',
  // Short vs Timman — King walk, 1991
  '5rk1/1pp2ppp/p1n5/8/1b1Pp3/1B4P1/PPP4P/R1B1K3':
    'Short vs Timman — The King Walk! 1991',
  // Famous Scholar's Mate position
  'rnbqkb1r/pppp1ppp/5n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR':
    'Scholar\'s Mate threat! A classic trap.',
  // Italian Game — Giuoco Piano
  'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R':
    'The Giuoco Piano! A Renaissance classic.',
  // Sicilian Najdorf — tabiya
  'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R':
    'The Sicilian Najdorf — Fischer\'s weapon of choice!',
  // Ruy Lopez — main line
  'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R':
    'The Ruy Lopez! 500 years of theory.',
  // Queen's Gambit Declined — classic
  'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR':
    'Queen\'s Gambit Declined — The Netflix position!',
  // French Defense — Winawer
  'rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N5/PP2PPPP/R1BQKBNR':
    'The French Winawer — Botvinnik\'s favorite!',
  // King's Indian — classic setup
  'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP2BPPP/R1BQK1NR':
    'The King\'s Indian Defense — Kasparov\'s battleground!',
  // Caro-Kann — Advance variation
  'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR':
    'Caro-Kann Advance — Karpov\'s fortress!',
  // Philidor position (famous endgame)
  '8/8/8/4k3/R7/4K3/r7/8':
    'THE PHILIDOR POSITION! Endgame theory since 1777.',
  // Lucena position (famous endgame)
  '1K1k4/1P6/8/8/8/8/r7/4R3':
    'THE LUCENA POSITION! The most important endgame to know.',
  // Fried Liver Attack
  'r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R':
    'THE FRIED LIVER ATTACK! A swashbuckling gambit!',
  // Grob Attack
  'rnbqkbnr/pppppppp/8/8/6P1/8/PPPPPP1P/RNBQKBNR':
    'The Grob Attack?! 1.g4 — pure chaos energy!',
  // Bongcloud
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQK1NR':
    'Is that... the Bongcloud?! The king advances!',
  // Fool's Mate
  'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR':
    'FOOL\'S MATE! The fastest checkmate possible!',
  // Immortal Zugzwang — Samisch vs Nimzowitsch, 1923
  'r7/1p4bk/2p1p1pp/p1PpPp2/P2P1P1K/1P6/6PP/4R3':
    'IMMORTAL ZUGZWANG! Samisch vs Nimzowitsch, 1923',
  // Marshall Attack — Ruy Lopez
  'r1bq1rk1/4bppp/p1n2n2/1ppPp3/4P3/2N2N2/PPP1BPPP/R1BQ1RK1':
    'The Marshall Attack! A 100-year-old sacrifice!',
  // Sicilian Dragon — Yugoslav Attack
  'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R':
    'The Sicilian Dragon — Here be monsters!',
  // London System
  'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R':
    'The London System — solid and sneaky!',
  // Vienna Game
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR':
    'The Vienna Game! A romantic-era opening.',
  // Scandinavian Defense
  'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR':
    'The Scandinavian Defense! 1...d5 — in your face!',
  // Dutch Defense
  'rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR':
    'The Dutch Defense! Aggressive and unbalanced.',
  // English Opening — Symmetrical
  'rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR':
    'The English Opening — positional chess!',
  // Petroff Defense
  'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R':
    'The Petroff Defense — the drawing weapon!',
};

// Normalize a FEN to just piece placement for matching
function placementKey(fen) {
  return fen.split(' ')[0];
}

// Build a reverse index on load
const index = new Map();
for (const [placement, desc] of Object.entries(FAMOUS)) {
  index.set(placement, desc);
}

/**
 * Check if a FEN matches a known famous position.
 * Returns the description string or null.
 */
export function identifyFamous(fen) {
  const key = placementKey(fen);
  return index.get(key) || null;
}
