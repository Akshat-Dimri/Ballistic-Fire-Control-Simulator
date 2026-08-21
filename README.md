# Ballistic Equation Solution Simulator (IOL Project 2026)

An interactive, high-precision web dashboard for simulating non-linear fire control ballistic solutions, non-linear projectile drop curves (PySR fits), environmental factors, and degrees-of-calculation formulation modes.

## Quick Start

Run any standard local HTTP static server inside this directory:

```bash
# Using Python
python -m http.server 8090

# Or using Node.js npx serve
npx serve .
```

Open `http://localhost:8090/index.html` in Chrome or Firefox.

## Project Structure

```
IOL_Project_2026/
├── index.html            # Main dashboard interface
├── css/
│   ├── layout.css        # Responsive grid, dark/light theme tokens
│   ├── panels.css        # Center canvas, formula bar, term accordions
│   └── components.css    # Sliders, buttons, modals, worksheets
└── js/
    ├── main.js           # Event wiring, UI state controller
    ├── solver.js         # PySR symbolic regression & 2-pass range iteration
    ├── shellsData.js     # Ammunition specification matrix & coefficient vectors
    ├── termData.js       # Mathematical documentation for correction terms
    └── uiRenderer.js     # 2D pitch trajectory & 3D azimuth wind crosshair
```
