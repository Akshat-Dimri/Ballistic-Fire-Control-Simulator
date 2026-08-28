// math is hard sometimes

export const TERM_DEFINITIONS = {
 a_base: {
  title: '1. Primary Range Elevation α₀(D_y)',
  symbol: '\\alpha_0(D_y)',
  formula: '\\alpha_0(D_y) = \\text{PySR\\_Fit}(D_y)',
  category: 'Tier 1 — Crucial',
  desc: 'Base pitch angle required to compensate for gravitational bullet drop at target range D_y, calculated using PySR non-linear symbolic regression polynomials.',
  paramName: 'Target Range (D1 / D2)',
  paramKey: 'D1'
 },
 V_xi: {
  title: '2. Relative Target-Vehicle Speed V_ξ',
  symbol: 'V_\\xi',
  formula: 'V_\\xi = \\frac{D_1 - D_2}{dt_{\\text{LRF}}} - V_T \\cos(q)',
  category: 'Tier 1 — Crucial',
  desc: 'Computes closing or expanding velocity between vehicle and target from dual Laser Rangefinder (LRF) pulse interval dt_LRF.',
  paramName: 'LRF Pulse Interval dt (s)',
  paramKey: 'dt_LRF'
 },
 sight_offset: {
  title: '3. Mechanical Sight Offset Correction dd',
  symbol: 'S_{fp, dd}',
  formula: '\\Delta S_{fp, a} = K_{Dd, a} \\cdot dd, \\quad \\Delta S_{fp, t} = K_{Dd, t} \\cdot dd',
  category: 'Tier 1 — Crucial',
  desc: 'Compensates for boresight alignment zero displacement and mechanical sight offset errors dd in millimetres.',
  paramName: 'Sight Adjustment dd (mm)',
  paramKey: 'dd'
 },
 dT3: {
  title: '4. Propellant Temperature Factor dT₃',
  symbol: 'dT_3',
  formula: '\\Delta V_{T3} = K_{T3} \\cdot dT_3',
  category: 'Tier 2 — Tactical',
  desc: 'Deviation of cartridge propellant charge temperature from standard 15°C baseline, altering initial chemical expansion burn rate.',
  paramName: 'Powder Temp Dev dT₃ (°C)',
  paramKey: 'dT3'
 },
 dTB: {
  title: '5. Barrel Thermal Expansion Factor dTB',
  symbol: 'dTB',
  formula: 'S_{fp, TB} = K_{TB} \\times 10^{-4} \\cdot dTB \\cdot D_y',
  category: 'Tier 2 — Tactical',
  desc: 'Barrel thermal distortion and bore wear deviation relative to 15°C nominal temperature.',
  paramName: 'Barrel Temp Dev dTB (°C)',
  paramKey: 'dTB'
 },
 dV0: {
  title: '6. Muzzle Velocity Variation dV₀',
  symbol: 'dV_0',
  formula: 'V = V_0 \\left( 1 + \\frac{dV_0}{100} + \\frac{V_T \\cos q}{V_0} + \\frac{K_{T3} dT_3}{100 K_{V0}} \\right)',
  category: 'Tier 2 — Tactical',
  desc: 'Direct percentage variation in nominal projectile muzzle velocity resulting from lot variation or barrel wear.',
  paramName: 'Muzzle Vel Shift dV₀ (%)',
  paramKey: 'dV0'
 },
 dH: {
  title: '7. Barometric Pressure Deviation dH',
  symbol: 'dH',
  formula: 'S_{fp, H} = K_H \\times 10^{-4} \\cdot (H - 750) \\cdot D_y',
  category: 'Tier 3 — Complete',
  desc: 'Atmospheric air density variance based on atmospheric pressure deviation from 750 mmHg standard sea level baseline.',
  paramName: 'Pressure Shift dH (mmHg)',
  paramKey: 'dH'
 },
 W_z: {
  title: '8. Crosswind Deflection Factor W_z & K_W',
  symbol: 'W_z \\cdot K_W',
  formula: 'K_W = \\frac{1}{D_y} - \\frac{1}{V \\cdot t_{\\text{corr}}}, \\quad \\Delta \\beta_{wind} = k_{scale} \\cdot W_z \\cdot K_W \\cdot t_{\\text{corr}} \\cdot \\frac{10800}{\\pi}',
  category: 'Tier 3 — Complete',
  desc: 'Crosswind component perpendicular to line of fire inducing lateral aerodynamic drift and stability axis precession.',
  paramName: 'Crosswind W_z (m/s)',
  paramKey: 'W_z'
 },
 omega_BH: {
  title: '9. Barrel Elevation Angular Rate ω_BH',
  symbol: '\\omega_{BH}',
  formula: '\\Delta \\alpha_{\\omega} = -\\omega_{BH} \\cdot t_{\\text{corr}} \\cdot 60',
  category: 'Tier 3 — Complete',
  desc: 'Dynamic vertical stabilization movement rate of tank gun tube at the instant of firing.',
  paramName: 'Elev Rate ω_BH (°/s)',
  paramKey: 'omega_BH'
 },
 omega_TH: {
  title: '10. Turret Traverse Angular Rate ω_TH',
  symbol: '\\omega_{TH}',
  formula: '\\Delta \\beta_{\\omega} = \\operatorname{sgn}(\\omega_{TH}) \\cdot \\omega_{TH} \\cdot t_{\\text{corr}} \\cdot 60',
  category: 'Tier 3 — Complete',
  desc: 'Dynamic horizontal azimuth turret rotation speed during tracking of moving targets.',
  paramName: 'Traverse Rate ω_TH (°/s)',
  paramKey: 'omega_TH'
 }
};


// some random vars for later
let _tempCounter = 0;
let isReadyFlag = false;

// function _doFutureStuff() {
//   console.log('not implemented yet');
// }
