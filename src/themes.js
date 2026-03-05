export const THEMES = {
  arcade: {
    name: 'Arcade',
    // Environment
    bgBase: '#0a0518',
    frameBorder: '#bd93f9',
    frameGlow: 'rgba(189, 147, 249, 0.4)',
    titleColor: '#ff79c6',
    accent: '#bd93f9',
    statusColor: '#f1fa8c',
    evalColor: '#50fa7b',
    warningColor: '#ff5555',
    warningImminent: '#ff79c6',
    // Background art
    spiralHues: [280, 180, 40, 340, 120],
    particleSaturation: 85,
    particleLightness: 60,
    trailFade: 'rgba(10, 5, 24, 0.03)',
  },
  medieval: {
    name: 'Medieval',
    bgBase: '#1a1008',
    frameBorder: '#d4a843',
    frameGlow: 'rgba(212, 168, 67, 0.35)',
    titleColor: '#d4a843',
    accent: '#d4a843',
    statusColor: '#e8d5a8',
    evalColor: '#d4a843',
    warningColor: '#c0392b',
    warningImminent: '#e74c3c',
    spiralHues: [30, 40, 20, 45, 35],
    particleSaturation: 55,
    particleLightness: 42,
    trailFade: 'rgba(26, 16, 8, 0.03)',
  },
  roman: {
    name: 'Roman',
    bgBase: '#1a0f0a',
    frameBorder: '#cd7f32',
    frameGlow: 'rgba(205, 127, 50, 0.35)',
    titleColor: '#cd7f32',
    accent: '#cd7f32',
    statusColor: '#e8ddd0',
    evalColor: '#cd7f32',
    warningColor: '#8b0000',
    warningImminent: '#dc143c',
    spiralHues: [15, 25, 35, 10, 5],
    particleSaturation: 50,
    particleLightness: 40,
    trailFade: 'rgba(26, 15, 10, 0.03)',
  },
  tropical: {
    name: 'Tropical',
    bgBase: '#041820',
    frameBorder: '#00bcd4',
    frameGlow: 'rgba(0, 188, 212, 0.35)',
    titleColor: '#ffeb3b',
    accent: '#00bcd4',
    statusColor: '#a8e6cf',
    evalColor: '#ffeb3b',
    warningColor: '#ff6b35',
    warningImminent: '#ff3d00',
    spiralHues: [170, 50, 320, 140, 200],
    particleSaturation: 90,
    particleLightness: 55,
    trailFade: 'rgba(4, 24, 32, 0.03)',
  },
  neon: {
    name: 'Neon',
    bgBase: '#000000',
    frameBorder: '#39ff14',
    frameGlow: 'rgba(57, 255, 20, 0.4)',
    titleColor: '#ff073a',
    accent: '#39ff14',
    statusColor: '#39ff14',
    evalColor: '#00ffff',
    warningColor: '#ff073a',
    warningImminent: '#ff00ff',
    spiralHues: [0, 60, 120, 180, 300],
    particleSaturation: 100,
    particleLightness: 55,
    trailFade: 'rgba(0, 0, 0, 0.03)',
  },
};

export let currentTheme = THEMES.arcade;

export function setTheme(themeKey) {
  currentTheme = THEMES[themeKey];
  const t = currentTheme;
  const r = document.documentElement.style;

  r.setProperty('--bg-base', t.bgBase);
  r.setProperty('--frame-border', t.frameBorder);
  r.setProperty('--frame-glow', t.frameGlow);
  r.setProperty('--title-color', t.titleColor);
  r.setProperty('--accent', t.accent);
  r.setProperty('--status-color', t.statusColor);
  r.setProperty('--eval-color', t.evalColor);
  r.setProperty('--warning-color', t.warningColor);
  r.setProperty('--warning-imminent', t.warningImminent);
}
