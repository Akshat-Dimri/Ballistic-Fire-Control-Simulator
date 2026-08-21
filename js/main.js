// application state

import { SHELLS } from './shellsData.js';
import { TERM_DEFINITIONS } from './termData.js';
import { solveBallistics } from './solver.js';
import { renderTrajectory2D, renderAzimuth3D } from './uiRenderer.js';

const state = {
  degreeMode: 3, // complete formulation
  selectedAmmo: 'SABOT_1',
  inputs: {
    D1: 2000,
    D2: 2000,
    dt_LRF: 0,
    dT3: 0,
    dTB: 0,
    dH: 0,
    dV0: 0,
    dd: 0,
    V_T: 0,
    q: 0,
    gamma: 0,
    phi: 0,
    omega_BH: 0,
    omega_TH: 0,
    W_z: 0
  }
};

// startup
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLoader();
  initModal();
  initSheetModal();
  bindDegreeModeToggles();
  bindInputs();
  bindAmmoSelector();
  bindDefaultValuesBtn();
  bindPanelResizers();
  updateApp();
});

// panel sizing
function bindPanelResizers() {
  const workspace = document.querySelector('.workspace');
  const rootStyle = document.documentElement.style;
  if (!workspace) return;

  const panels = [
    { panel: document.getElementById('panel-left'), handle: document.getElementById('resizer-left'), variable: '--col-controls', base: 280, min: 220, max: 430, side: 'left' },
    { panel: document.getElementById('panel-right'), handle: document.getElementById('resizer-right'), variable: '--col-info', base: 320, min: 260, max: 480, side: 'right' }
  ];

  panels.forEach(({ panel }) => {
    if (!panel) return;
    const content = document.createElement('div');
    content.className = 'panel-content-scale';
    while (panel.firstChild) content.appendChild(panel.firstChild);
    panel.appendChild(content);
  });

  function setWidth(config, width) {
    const otherVar = config.side === 'left' ? '--col-info' : '--col-controls';
    const otherWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(otherVar));
    const available = workspace.getBoundingClientRect().width - otherWidth - 380;
    const nextWidth = Math.max(config.min, Math.min(config.max, available, width));
    rootStyle.setProperty(config.variable, `${nextWidth}px`);
    config.panel.style.setProperty('--content-scale', nextWidth / config.base);
    updateApp();
  }

  panels.forEach(config => {
    if (!config.panel || !config.handle) return;
    config.handle.addEventListener('pointerdown', event => {
      if (window.innerWidth < 900) return;
      event.preventDefault();
      config.handle.classList.add('dragging');
      config.handle.setPointerCapture(event.pointerId);

      const move = moveEvent => {
        const bounds = workspace.getBoundingClientRect();
        const width = config.side === 'left'
          ? moveEvent.clientX - bounds.left
          : bounds.right - moveEvent.clientX;
        setWidth(config, width);
      };
      const stop = () => {
        config.handle.classList.remove('dragging');
        config.handle.removeEventListener('pointermove', move);
        config.handle.removeEventListener('pointerup', stop);
        config.handle.removeEventListener('pointercancel', stop);
      };
      config.handle.addEventListener('pointermove', move);
      config.handle.addEventListener('pointerup', stop);
      config.handle.addEventListener('pointercancel', stop);
    });
  });
}

// theme
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const iconMoon = document.getElementById('icon-moon');
  const iconSun = document.getElementById('icon-sun');

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcons(next);
    updateApp();
  });

  function updateThemeIcons(theme) {
    if (theme === 'dark') {
      iconMoon.style.display = 'none';
      iconSun.style.display = 'block';
    } else {
      iconMoon.style.display = 'block';
      iconSun.style.display = 'none';
    }
  }
}

// loader
function initLoader() {
  const overlay = document.getElementById('loader-overlay');
  const barFill = document.getElementById('bar-fill');
  const barPct = document.getElementById('bar-pct');
  let pct = 0;

  const interval = setInterval(() => {
    pct += Math.floor(Math.random() * 15) + 10;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
        showWelcomeModal();
      }, 300);
    }
    barFill.style.width = pct + '%';
    barPct.textContent = pct + '%';
  }, 80);
}

// welcome
function initModal() {
  const backdrop = document.getElementById('welcome-backdrop');
  const dismissBtn = document.getElementById('welcome-dismiss');

  dismissBtn.addEventListener('click', () => {
    backdrop.classList.remove('visible');
  });
}

function showWelcomeModal() {
  const backdrop = document.getElementById('welcome-backdrop');
  if (backdrop) backdrop.classList.add('visible');
}

// worksheet
function initSheetModal() {
  const triggerBtn = document.getElementById('sheet-trigger');
  const backdrop = document.getElementById('sheet-backdrop');
  const closeBtn = document.getElementById('sheet-close');
  const tbody = document.getElementById('sheet-table-body');

  tbody.innerHTML = '';
  Object.values(SHELLS).forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.name}</strong></td>
      <td>${s.category}</td>
      <td>${s.V0} m/s</td>
      <td>${s.mass}</td>
      <td>${s.effectiveRange}</td>
      <td>K_H: ${s.K_H}, K_TB: ${s.K_TB}, K_V0: ${s.K_V0}</td>
    `;
    tbody.appendChild(tr);
  });

  triggerBtn.addEventListener('click', () => backdrop.classList.add('visible'));
  closeBtn.addEventListener('click', () => backdrop.classList.remove('visible'));
}

// calculation mode
function bindDegreeModeToggles() {
  const btns = document.querySelectorAll('.mode-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.degreeMode = parseInt(btn.dataset.mode);

      toggleControlSections(state.degreeMode);
      updateApp();
    });
  });
}

function toggleControlSections(mode) {
  const tier2Elements = document.querySelectorAll('.tier-2');
  const tier3Elements = document.querySelectorAll('.tier-3');

  tier2Elements.forEach(el => el.style.display = mode >= 2 ? 'flex' : 'none');
  tier3Elements.forEach(el => el.style.display = mode >= 3 ? 'flex' : 'none');
}

// inputs
function bindInputs() {
  const sliders = document.querySelectorAll('.slider, .select-input, .text-input');
  sliders.forEach(input => {
    const key = input.id.replace('input-', '');
    input.addEventListener('input', () => {
      state.inputs[key] = input.value;
      const valDisplay = document.getElementById(`val-${key}`);
      if (valDisplay) valDisplay.textContent = input.value;
      updateApp();
    });
  });
}

// ammunition
function bindAmmoSelector() {
  const select = document.getElementById('ammo-select');
  select.addEventListener('change', () => {
    state.selectedAmmo = select.value;
    updateApp();
  });
}

// defaults
function bindDefaultValuesBtn() {
  const defaultBtn = document.getElementById('reset-defaults-btn');
  defaultBtn.addEventListener('click', () => {
    state.inputs = {
      D1: 2000, D2: 2000, dt_LRF: 0, dT3: 0, dTB: 0,
      dH: 0, dV0: 0, dd: 0, V_T: 0, q: 0, gamma: 0,
      phi: 0, omega_BH: 0, omega_TH: 0, W_z: 0
    };

    Object.keys(state.inputs).forEach(k => {
      const input = document.getElementById(`input-${k}`);
      if (input) input.value = state.inputs[k];
      const valDisplay = document.getElementById(`val-${k}`);
      if (valDisplay) valDisplay.textContent = state.inputs[k];
    });

    updateApp();
  });
}

// refresh
function updateApp() {
  const result = solveBallistics(state.inputs, state.selectedAmmo, state.degreeMode);

  const c2d = document.getElementById('canvas-2d');
  const c3d = document.getElementById('canvas-3d');
  renderTrajectory2D(c2d, result, state.inputs);
  renderAzimuth3D(c3d, result, state.inputs);

  renderFormulaBuilder(result);

  renderOutputBrief(result);

  renderTermAccordions(result);
}

function renderFormulaBuilder(res) {
  const formulaBox = document.getElementById('formula-expression');
  let expr = `\\alpha_\\sigma = \\alpha_0(${res.D_y.toFixed(1)}m) \\cdot (1 - \\frac{\\sin^2\\gamma}{2})`;

  if (state.degreeMode >= 2) {
    expr += ` + S_{fp}(dT_3, dTB, dV_0)`;
  }
  if (state.degreeMode >= 3) {
    expr += ` + W_z \\cdot K_W \\cdot \\gamma + \\Delta \\alpha_{\\omega_{BH}}`;
  }

  expr += ` = ${res.alpha_sigma.toFixed(2)}' (${res.alpha_mrad.toFixed(2)} mrad)`;
  renderTex(formulaBox, expr, true);
}

// equation output
function renderTex(element, tex, displayMode = false) {
  if (!element) return;
  if (window.katex) {
    window.katex.render(tex, element, {
      displayMode,
      throwOnError: false,
      strict: 'ignore'
    });
  } else {
    // plain text fallback
    element.textContent = tex;
  }
}

function renderOutputBrief(res) {
  document.getElementById('out-alpha-val').textContent = `${res.alpha_sigma.toFixed(2)}' (${res.alpha_mrad.toFixed(2)} mrad)`;
  document.getElementById('out-beta-val').textContent = `${res.beta_sigma.toFixed(2)}' (${res.beta_mrad.toFixed(2)} mrad)`;

  document.getElementById('out-desc').textContent = 
    `Pitch elevation angle Alpha compensates for gravity drop & pitch motion. Azimuth correction Beta resolves lateral crosswind drift (${state.inputs.W_z}m/s) and turret traverse rotation.`;
}

function renderTermAccordions(res) {
  const container = document.getElementById('term-accordion-container');
  container.innerHTML = '';

  const activeKeys = ['a_base', 'V_xi', 'sight_offset'];
  if (state.degreeMode >= 2) activeKeys.push('dT3', 'dTB', 'dV0');
  if (state.degreeMode >= 3) activeKeys.push('dH', 'W_z', 'omega_BH', 'omega_TH');

  activeKeys.forEach(key => {
    const def = TERM_DEFINITIONS[key];
    if (!def) return;

    const card = document.createElement('div');
    card.className = 'term-card';
    card.innerHTML = `
      <div class="term-card-header">
        <span class="term-card-title">${def.title}</span>
        <span style="font-size:10px;color:var(--purple);">${def.category}</span>
      </div>
      <div class="term-card-body">
        <div class="term-math">${def.formula}</div>
        <div>${def.desc}</div>
      </div>
    `;
    renderTex(card.querySelector('.term-math'), def.formula, true);
    container.appendChild(card);
  });
}
