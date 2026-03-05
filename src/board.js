import { Chess } from 'chess.js';
import { renderPiece } from './pieces.js';

export class Board {
  constructor(container, onMove) {
    this.container = container;
    this.onMove = onMove;
    this.chess = new Chess();
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.interactive = true;
    this.allowBothSides = false;
    this.render();
  }

  get fen() {
    return this.chess.fen();
  }

  loadFen(fen) {
    this.chess = new Chess(fen);
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.render();
  }

  makeMove(from, to, promotion) {
    const move = this.chess.move({ from, to, promotion: promotion || 'q' });
    if (move) {
      this.lastMove = { from, to };
      this.selectedSquare = null;
      this.legalMoves = [];
      this.render();
    }
    return move;
  }

  makeUciMove(uci) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;
    return this.makeMove(from, to, promotion);
  }

  morphTo(fen, callback) {
    const boardRect = this.container.getBoundingClientRect();
    const centerX = boardRect.width / 2;
    const centerY = boardRect.height / 2;

    // Phase 1: Pull all pieces into the center
    const pieces = this.container.querySelectorAll('.piece');
    const pullAnimations = [];

    pieces.forEach((img, i) => {
      const square = img.parentElement;
      const sqRect = square.getBoundingClientRect();
      const pieceX = sqRect.left - boardRect.left + sqRect.width / 2;
      const pieceY = sqRect.top - boardRect.top + sqRect.height / 2;
      const dx = centerX - pieceX;
      const dy = centerY - pieceY;

      const anim = img.animate([
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.1) rotate(${360 + i * 30}deg)`, opacity: 0.3 },
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.6, 0, 0.7, 0.2)',
        fill: 'forwards',
      });

      pullAnimations.push(anim.finished);
    });

    // Also dim the squares
    const squares = this.container.querySelectorAll('.square');
    squares.forEach(sq => {
      sq.animate([
        { filter: 'brightness(1)' },
        { filter: 'brightness(0.3)' },
      ], { duration: 400, fill: 'forwards' });
    });

    Promise.all(pullAnimations).then(() => {
      // Phase 2: Flash and swap
      this.loadFen(fen);

      // Phase 3: Explode pieces outward from center
      const newPieces = this.container.querySelectorAll('.piece');
      newPieces.forEach((img, i) => {
        const square = img.parentElement;
        const sqRect = square.getBoundingClientRect();
        const pieceX = sqRect.left - boardRect.left + sqRect.width / 2;
        const pieceY = sqRect.top - boardRect.top + sqRect.height / 2;
        const dx = centerX - pieceX;
        const dy = centerY - pieceY;

        img.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(0.1) rotate(-${360 + i * 30}deg)`, opacity: 0 },
          { transform: `translate(${dx * 0.3}px, ${dy * 0.3}px) scale(1.3) rotate(-30deg)`, opacity: 1, offset: 0.6 },
          { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        ], {
          duration: 600,
          easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
        });
      });

      // Flash the squares
      const newSquares = this.container.querySelectorAll('.square');
      newSquares.forEach(sq => sq.classList.add('chaos-highlight'));
      setTimeout(() => {
        newSquares.forEach(sq => sq.classList.remove('chaos-highlight'));
        if (callback) callback();
      }, 600);
    });
  }

  render() {
    this.container.innerHTML = '';
    const boardSize = this.container.clientWidth || 480;
    const sqSize = Math.floor(boardSize / 8);
    const pieceSize = Math.floor(sqSize * 0.8);

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const sq = String.fromCharCode(97 + file) + (8 - rank);
        const isLight = (rank + file) % 2 === 0;
        const piece = this.chess.get(sq);

        const div = document.createElement('div');
        div.className = `square ${isLight ? 'light' : 'dark'}`;
        div.dataset.square = sq;

        if (this.lastMove && (sq === this.lastMove.from || sq === this.lastMove.to)) {
          div.classList.add('last-move');
        }

        if (sq === this.selectedSquare) {
          div.classList.add('selected');
        }

        const isLegalTarget = this.legalMoves.some(m => m.to === sq);
        if (isLegalTarget) {
          const targetPiece = this.chess.get(sq);
          div.classList.add(targetPiece ? 'legal-capture' : 'legal-move');
        }

        if (piece) {
          const pieceCanvas = renderPiece(piece.type, piece.color, pieceSize);
          if (pieceCanvas) {
            const img = document.createElement('img');
            img.src = pieceCanvas.toDataURL();
            img.className = 'piece';
            img.draggable = false;
            div.appendChild(img);
          }
        }

        div.addEventListener('click', () => this._onClick(sq));
        this.container.appendChild(div);
      }
    }
  }

  _onClick(sq) {
    if (!this.interactive) return;
    if (!this.allowBothSides && this.chess.turn() !== 'w') return;

    if (this.selectedSquare) {
      const legalMove = this.legalMoves.find(m => m.to === sq);
      if (legalMove) {
        const move = this.makeMove(this.selectedSquare, sq, legalMove.promotion);
        if (move && this.onMove) {
          this.onMove(move);
        }
        return;
      }
    }

    const piece = this.chess.get(sq);
    if (piece && piece.color === this.chess.turn()) {
      this.selectedSquare = sq;
      this.legalMoves = this.chess.moves({ square: sq, verbose: true });
      this.render();
    } else {
      this.selectedSquare = null;
      this.legalMoves = [];
      this.render();
    }
  }
}
