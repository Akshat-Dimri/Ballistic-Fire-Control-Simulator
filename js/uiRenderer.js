// basic stuff

export function renderTrajectory2D(svg, solverResult) {
 if (!svg) return;
 const { width, height, colors } = prepareSvg(svg);
 const groundY = height - 35;
 const targetX = width - 60;
 const alphaRad = ((solverResult.alpha_sigma / 60) * Math.PI) / 180;
 const barrelLen = 30;
 const bx = 45 + barrelLen * Math.cos(-alphaRad * 3);
 const by = (groundY - 15) + barrelLen * Math.sin(-alphaRad * 3);
 const peakY = Math.min(groundY - 20, groundY - 20 - (solverResult.alpha_sigma * 1.5));

 svg.innerHTML = `
  ${buildGrid(width, height, colors.border)}
  <line x1="20" y1="${groundY}" x2="${width - 20}" y2="${groundY}" stroke="${colors.ground}" stroke-width="1" />
  <rect x="25" y="${groundY - 12}" width="35" height="12" fill="${colors.purple}" />
  <rect x="35" y="${groundY - 18}" width="15" height="6" fill="${colors.purple}" />
  <line x1="45" y1="${groundY - 15}" x2="${bx}" y2="${by}" stroke="${colors.purple}" stroke-width="3" stroke-linecap="round" />
  <rect x="${targetX}" y="${groundY - 16}" width="25" height="16" fill="${colors.teal}" />
  <path d="M ${bx} ${by} Q ${(bx + targetX) / 2} ${peakY} ${targetX + 12} ${groundY - 8}" fill="none" stroke="${colors.purple}" stroke-width="2" stroke-dasharray="4 4" />
  <text x="${width / 2 - 50}" y="${height - 12}" fill="${colors.text}" font-size="10">Target Range D_y: ${solverResult.D_y.toFixed(1)} m</text>
  <text x="${width / 2 - 50}" y="${peakY - 8}" fill="${colors.text}" font-size="10">Apex Drop Pitch α: ${solverResult.alpha_sigma.toFixed(2)}'</text>
 `;
}

export function renderAzimuth3D(svg, solverResult, inputs) {
 if (!svg) return;
 const { width, height, colors } = prepareSvg(svg);
 const cx = width / 2;
 const cy = height / 2;
 const radius = Math.min(width, height) * 0.35;
 const betaRad = ((solverResult.beta_sigma / 60) * Math.PI) / 180 * 10;
 const bx = cx + Math.sin(betaRad) * radius;
 const by = cy - Math.cos(betaRad) * radius;
 const wind = parseFloat(inputs.W_z) || 0;
 const windAngle = ((parseFloat(inputs.q) || 0) * Math.PI) / 180;
 const wx = cx + Math.cos(windAngle) * radius * .8;
 const wy = cy + Math.sin(windAngle) * radius * .8;
 const windMarkup = Math.abs(wind) > .1
  ? `<line x1="${cx}" y1="${cy}" x2="${wx}" y2="${wy}" stroke="${colors.danger}" stroke-width="2" marker-end="url(#wind-arrow)" />
   <text x="${wx + 4}" y="${wy + 4}" fill="${colors.danger}" font-size="10">Wind ${wind}m/s</text>`
  : '';

 svg.innerHTML = `
  <defs><marker id="wind-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${colors.danger}" /></marker></defs>
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${colors.border}" stroke-width="1" />
  <circle cx="${cx}" cy="${cy}" r="${radius * .5}" fill="none" stroke="${colors.border}" stroke-width="1" />
  <line x1="${cx - radius - 10}" y1="${cy}" x2="${cx + radius + 10}" y2="${cy}" stroke="${colors.border}" stroke-width="1" stroke-dasharray="2 2" />
  <line x1="${cx}" y1="${cy - radius - 10}" x2="${cx}" y2="${cy + radius + 10}" stroke="${colors.border}" stroke-width="1" stroke-dasharray="2 2" />
  ${windMarkup}
  <line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" stroke="${colors.purple}" stroke-width="2.5" />
  <circle cx="${bx}" cy="${by}" r="4" fill="${colors.purple}" />
  <text x="${cx - 45}" y="${cy + radius + 20}" fill="${colors.text}" font-size="10">Azimuth Drift β: ${solverResult.beta_sigma.toFixed(2)}'</text>
 `;
}

function prepareSvg(svg) {
 const width = svg.parentElement.clientWidth || 400;
 const height = svg.parentElement.clientHeight || 250;
 svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
 svg.setAttribute('preserveAspectRatio', 'none');
 return { width, height, colors: themeColors() };
}

function buildGrid(width, height, color) {
 const lines = [];
 for (let x = 0; x < width; x += 40) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" />`);
 for (let y = 0; y < height; y += 40) lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" />`);
 return `<g stroke="${color}" stroke-width=".5">${lines.join('')}</g>`;
}

function themeColors() {
 const style = getComputedStyle(document.documentElement);
 const get = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
 return {
  border: get('--border', '#ccc'),
  ground: get('--canvas-ground', '#888'),
  purple: get('--purple', '#534AB7'),
  teal: get('--teal', '#0F6E56'),
  danger: get('--danger', '#E24B4A'),
  text: get('--text-primary', '#111')
 };
}


// some random vars for later
let _tempCounter = 0;
let isReadyFlag = false;

// function _doFutureStuff() {
//   console.log('not implemented yet');
// }
