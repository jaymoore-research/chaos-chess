// Pixel art chess pieces — higher resolution grids for clarity
// Rendered to tiny canvases and scaled up with image-rendering: pixelated

const GRIDS = {
  p: [ // Pawn 9x12
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
  ],
  r: [ // Rook 9x12
    [0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
  ],
  n: [ // Knight 9x12
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0],
    [0,0,1,1,1,1,0,0,0],
    [0,1,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,1,1,0],
    [0,1,0,0,0,1,1,1,0],
    [0,0,0,0,1,1,1,0,0],
    [0,0,0,1,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
  ],
  b: [ // Bishop 9x12
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,0,1,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,0,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
  ],
  q: [ // Queen 9x12
    [0,0,1,0,1,0,1,0,0],
    [0,0,1,0,1,0,1,0,0],
    [0,1,1,0,1,0,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1],
  ],
  k: [ // King 9x12
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,0,0,1,0,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,0,1,0,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
  ],
};

const COLORS = {
  w: { fill: '#ffffff', outline: '#8be9fd', shadow: '#6272a4' },
  b: { fill: '#1a1a2e', outline: '#ff79c6', shadow: '#44475a' },
};

let cache = {};

export function clearPieceCache() {
  cache = {};
}

export function renderPiece(type, color, size) {
  const key = `${type}_${color}_${size}`;
  if (cache[key]) return cache[key];

  const grid = GRIDS[type];
  if (!grid) return null;

  const rows = grid.length;
  const cols = grid[0].length;

  const mini = document.createElement('canvas');
  mini.width = cols + 2;
  mini.height = rows + 2;
  const mctx = mini.getContext('2d');

  const c = COLORS[color];

  // Draw shadow
  for (let r = 0; r < rows; r++) {
    for (let f = 0; f < cols; f++) {
      if (!grid[r][f]) continue;
      mctx.fillStyle = c.shadow;
      mctx.fillRect(f + 2, r + 2, 1, 1);
    }
  }

  // Draw outline
  for (let r = 0; r < rows; r++) {
    for (let f = 0; f < cols; f++) {
      if (!grid[r][f]) continue;
      mctx.fillStyle = c.outline;
      for (let dr = -1; dr <= 1; dr++) {
        for (let df = -1; df <= 1; df++) {
          if (dr === 0 && df === 0) continue;
          const nr = r + dr, nf = f + df;
          if (nr < 0 || nr >= rows || nf < 0 || nf >= cols || !grid[nr]?.[nf]) {
            mctx.fillRect(f + 1 + df, r + 1 + dr, 1, 1);
          }
        }
      }
    }
  }

  // Draw fill
  for (let r = 0; r < rows; r++) {
    for (let f = 0; f < cols; f++) {
      if (!grid[r][f]) continue;
      mctx.fillStyle = c.fill;
      mctx.fillRect(f + 1, r + 1, 1, 1);
    }
  }

  const scaled = document.createElement('canvas');
  const scale = Math.floor(size / rows);
  scaled.width = (cols + 2) * scale;
  scaled.height = (rows + 2) * scale;
  const sctx = scaled.getContext('2d');
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(mini, 0, 0, scaled.width, scaled.height);

  cache[key] = scaled;
  return scaled;
}
