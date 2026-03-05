export class Engine {
  constructor() {
    this.worker = null;
    this.ready = false;
    this._resolveReady = null;
    this.readyPromise = new Promise(r => { this._resolveReady = r; });
    this._queue = [];
    this._busy = false;
    this._currentHandler = null;
  }

  async init() {
    this.worker = new Worker('/stockfish.js');
    this.worker.onmessage = (e) => this._onMessage(e.data);
    this._send('uci');
    await this.readyPromise;
    this._send('setoption name Skill Level value 10');
    this.skillLevel = 10;
    this._send('isready');
    await this._waitFor('readyok');
  }

  setSkill(level) {
    this.skillLevel = level;
    this._send(`setoption name Skill Level value ${level}`);
  }

  _send(cmd) {
    this.worker.postMessage(cmd);
  }

  _onMessage(line) {
    if (line === 'uciok') {
      this.ready = true;
      this._resolveReady();
    }
    if (this._currentHandler) {
      this._currentHandler(line);
    }
  }

  _waitFor(keyword) {
    return new Promise(resolve => {
      const prev = this._currentHandler;
      this._currentHandler = (line) => {
        if (prev) prev(line);
        if (line.includes(keyword)) {
          this._currentHandler = prev;
          resolve(line);
        }
      };
    });
  }

  // Queue ensures only one command runs at a time
  _enqueue(fn) {
    return new Promise((resolve, reject) => {
      this._queue.push({ fn, resolve, reject });
      this._processQueue();
    });
  }

  async _processQueue() {
    if (this._busy || this._queue.length === 0) return;
    this._busy = true;
    const { fn, resolve, reject } = this._queue.shift();
    try {
      const result = await fn();
      resolve(result);
    } catch (e) {
      reject(e);
    } finally {
      this._busy = false;
      this._processQueue();
    }
  }

  evaluate(fen, depth = 10) {
    return this._enqueue(() => this._doEvaluate(fen, depth));
  }

  bestMove(fen, depth = 10) {
    return this._enqueue(() => this._doBestMove(fen, depth));
  }

  _doEvaluate(fen, depth) {
    this._send('stop');
    this._send(`position fen ${fen}`);
    this._send(`go depth ${depth}`);

    let lastScore = null;
    let isMate = false;
    let mateIn = 0;

    return new Promise(resolve => {
      this._currentHandler = (line) => {
        if (line.includes('score cp')) {
          const match = line.match(/score cp (-?\d+)/);
          if (match) {
            lastScore = parseInt(match[1]);
            isMate = false;
          }
        }
        if (line.includes('score mate')) {
          const match = line.match(/score mate (-?\d+)/);
          if (match) {
            mateIn = parseInt(match[1]);
            isMate = true;
          }
        }
        if (line.startsWith('bestmove')) {
          this._currentHandler = null;
          if (isMate) {
            resolve({ type: 'mate', value: mateIn });
          } else {
            resolve({ type: 'cp', value: lastScore ?? 0 });
          }
        }
      };
    });
  }

  _doBestMove(fen, depth) {
    this._send('stop');
    this._send(`position fen ${fen}`);
    this._send(`go depth ${depth}`);

    return new Promise(resolve => {
      this._currentHandler = (line) => {
        if (line.startsWith('bestmove')) {
          const move = line.split(' ')[1];
          this._currentHandler = null;
          resolve(move);
        }
      };
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
