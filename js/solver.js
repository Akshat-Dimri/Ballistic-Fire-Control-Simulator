// reminder to refactor this

import { SHELLS } from './shellsData.js';

export function solveBallistics(inputs, ammoKey, degreeMode = 3) {
 const shell = SHELLS[ammoKey] || SHELLS['SABOT_1'];

 // just setting things up here
 const D1 = parseFloat(inputs.D1) || 2000;
 const D2 = parseFloat(inputs.D2) || 2000;
 const dt_LRF = parseFloat(inputs.dt_LRF) || 0;
 const dT3 = degreeMode >= 2 ? (parseFloat(inputs.dT3) || 0) : 0;
 const dTB = degreeMode >= 2 ? (parseFloat(inputs.dTB) || 0) : 0;
 const dH = degreeMode >= 3 ? (parseFloat(inputs.dH) || 0) : 0;
 const dV0 = degreeMode >= 2 ? (parseFloat(inputs.dV0) || 0) : 0;
 const dd = parseFloat(inputs.dd) || 0;
 const V_T = parseFloat(inputs.V_T) || 0;
 const q_deg = parseFloat(inputs.q) || 0;
 const q_rad = (q_deg * Math.PI) / 180;
 const gamma_deg = degreeMode >= 3 ? (parseFloat(inputs.gamma) || 0) : 0;
 const gamma_rad = (gamma_deg * Math.PI) / 180;
 const phi_arcmin = degreeMode >= 3 ? (parseFloat(inputs.phi) || 0) : 0;
 const omega_BH = degreeMode >= 3 ? (parseFloat(inputs.omega_BH) || 0) : 0;
 const omega_TH = degreeMode >= 3 ? (parseFloat(inputs.omega_TH) || 0) : 0;
 const W_z = degreeMode >= 3 ? (parseFloat(inputs.W_z) || 0) : 0;

 const D_avg = (D1 + D2) / 2;

 // gotta fix this later maybe
 let V_xi = 0;
 if (dt_LRF > 0 && dt_LRF <= 5.0) {
  const V_xi_num = (D1 - D2) / dt_LRF - V_T * Math.cos(q_rad);
  if (Math.abs(V_xi_num) <= 15.0) {
   V_xi = V_xi_num;
  }
 }

 // basic stuff
 let D_y = D_avg;
 let a0_iter = 0;
 let t1_iter = 0;
 let a_corr = 0;
 let t_corr = 0;
 let Sfp_a = 0;
 let Sfp_t = 0;

 for (let iter = 0; iter < 2; iter++) {
  a0_iter = evaluateAlpha0(shell.id, D_y);
  t1_iter = evaluateTau1(shell.id, D_y);

  const K_H_eff = shell.K_H * 1e-4;
  const K_TB_eff = shell.K_TB * 1e-4;

  Sfp_a = shell.K_T3 * dT3 + K_TB_eff * dTB * D_y + K_H_eff * dH * D_y + shell.K_V0 * dV0 + shell.K_Dd_a * dd;
  Sfp_t = shell.K_T3 * (dT3 / 2) + K_TB_eff * (dTB * D_y / 2) + K_H_eff * (dH * D_y / 2) + shell.K_V0 * (dV0 / 2) + shell.K_Dd_t * dd;

  a_corr = a0_iter / (1 - Sfp_a);
  t_corr = t1_iter / (1 - Sfp_t);

  D_y = D_avg + V_xi * t_corr;
 }

 // just setting things up here
 let V = shell.V0;
 if (shell.id === 'TRACER_5') {
  V = shell.V0 * (1 + (V_T * Math.cos(q_rad)) / shell.V0 + (shell.K_T3 * dT3) / 2);
 } else {
  const term_dV0 = dV0 / 100;
  const term_wind = (V_T * Math.cos(q_rad)) / shell.V0;
  const term_temp = shell.K_V0 !== 0 ? (shell.K_T3 * dT3) / (100 * shell.K_V0) : 0;
  V = shell.V0 * (1 + term_dV0 + term_wind + term_temp);
 }

 // math is hard sometimes
 const K_W = (1 / D_y) - (1 / (V * t_corr));

 // math is hard sometimes
 const cos_gamma = 1 - Math.pow(Math.sin(gamma_rad), 2) / 2; // small-angle form
 const term1_a = a_corr * cos_gamma;
 const term2_a = (-omega_BH - (V_T * Math.cos(q_rad) * (phi_arcmin - a0_iter / 60)) / D_y) * t_corr * 60;
 const term3_a = W_z * K_W * gamma_rad * t_corr * 60;
 const term4_a = (phi_arcmin * V_T * Math.cos(q_rad) / V) * 60;

 const alpha_sigma = term1_a + term2_a + term3_a + term4_a;

 // reminder to refactor this
 const sin_gamma = Math.sin(gamma_rad);
 const term1_b = a_corr * sin_gamma;
 const term2_b = shell.ot_sign * omega_TH * t_corr * 60;
 const term3_b = shell.kw_scale * W_z * K_W * t_corr * (10800 / Math.PI);
 const term4_b = (D_y > 400 ? shell.lambda_b : 0) * Math.cos(gamma_rad);

 const beta_sigma = term1_b + term2_b + term3_b + term4_b;

 return {
  D_y,
  V_xi,
  a0: a0_iter,
  t1: t1_iter,
  Sfp_a,
  Sfp_t,
  a_corr,
  t_corr,
  V,
  K_W,
  alpha_sigma,
  beta_sigma,
  alpha_mrad: alpha_sigma * 0.290888, // 1 arcmin = 0.290888 mrad
  beta_mrad: beta_sigma * 0.290888,
 };
}

// i think this is right
function evaluateAlpha0(id, x0) {
 switch (id) {
  case 'SABOT_1': { // o2 fit
   const term1 = x0 + ((((-0.96722114 - x0) - ((x0 + 2.2272618) * -8.701007e-6)) + x0) * (x0 - 1.0491073));
   const term2 = ((x0 * x0 * 0.00010920789) + 1.5049798) / (0.07098921 - (Math.pow(x0, 0.45458212) * 0.3281663));
   return term1 + term2;
  }
  case 'SABOT_2': { // k2 fit
   const term1 = ((x0 * x0) / ((x0 * -31.396269) + 239003.75)) + 20.08968;
   const inner = (1.7563405 / ((x0 / -8.61663) + 6.1408644)) + 0.01671054;
   const term2 = inner * x0;
   const term3 = (30.549679 / ((x0 * -0.02404518) + 88.18354)) / ((x0 * -0.013807458) + 19.98516);
   return (term1 + term2) - term3;
  }
  case 'KINETIC_3': { // b3 fit
   const term1 = x0 * 1.0052665;
   const p1 = Math.pow(1.0219158, (x0 - 0.073671974) * -0.6090087) * 9.193342 - x0;
   const inner1 = (x0 + 1.0929593) - ((Math.pow(x0, 1.3872111) * -2.784342e-6) * x0);
   const inner2 = ((x0 - 0.6335724) + x0) * 1.425264e-7;
   const term2 = p1 + (inner1 * inner2);
   return term1 + term2;
  }
  case 'HEAT_4': { // b4 fit
   const term1 = 3.5822244 / (0.3655389 - (((x0 * (x0 * -6.130886e-8)) + 0.88722247) * x0));
   const term2 = ((x0 - 1.0952158) * Math.pow(x0, 2.0e-43)) * (((((Math.pow(x0, 3.8460538) * 4.474005e-22) - -2.8641847e-7) * x0) + 0.0056756246));
   return term1 + term2;
  }
  case 'TRACER_5': { // pkt fit
   return (((Math.pow(-0.13807671, x0 + x0) * 2.2999692) + ((-218.45805 + x0) * -0.03853867)) + 1.2809612) + (((((x0 + x0) + x0) * -3.9794152) + (((x0 + x0) * (x0 * -0.017122688)) + x0)) / -556.26953);
  }
  case 'KINETIC_6': { // b2 fit
   const term1 = ((x0 * 0.0062754555) - -0.3356655) - (41.18557 / ((-3.8410332 - x0) - ((Math.pow(x0, 0.3513222)) + (x0 + 0.1715391))));
   const term2 = (((((x0 - x0) - (x0 * -0.45940483)) * x0) + (x0 * -0.7176227)) * (x0 + 0.6516913)) * -1.0791283e-10;
   return term1 - term2;
  }
  case 'SABOT_7': { // k1 fit
   const term1 = (((x0 * (x0 * 69.2735)) - 68.04507) / (-3.6494348 - (x0 * (-2915.857 - (x0 / -2.313647)))));
   const term2 = ((-16.634016 / (3995.0044 - x0)) + (((-16.690342 / (x0 + -2498.715)) - (x0 * 0.048937436)) + -1.4572204));
   const term3 = (x0 + x0) * -0.026341826;
   return (term1 - term2) + term3;
  }
  case 'GUIDED_8': {
   return 30.0; // guided baseline
  }
  default:
   return x0 * 0.01;
 }
}

function evaluateTau1(id, x0) {
 switch (id) {
  case 'SABOT_1': {
   const t1n = -0.0020474321 / ((x0 * 0.0004603604) - 2.34658);
   const t1d = (x0 * 0.00027753646) - 1.06896834e-7;
   const term1 = t1n / t1d;
   const inner = ((x0 * 0.0001306463) * (x0 + x0)) * (-5.372906e-5 - (x0 * -4.2710384e-5));
   const term2 = inner + (x0 + x0);
   const factor = 0.0005870568 - (x0 * -3.9833843e-8);
   return (term1 + term2) * factor;
  }
  case 'SABOT_2': {
   const part1 = ((x0 + x0) + (-0.71188015 - 2.2905326)) * ((x0 / 101.45583) / 1410.7313);
   const part2 = part1 - 0.7736247;
   const part3 = x0 + ((x0 * 3.2455198e-6) + (0.0042400463 - x0));
   const term1 = part2 * part3;
   const term2 = x0 * 1.0401312;
   const term3 = (x0 + (x0 * 0.038974002)) + 0.009448903;
   return (term1 + term2) - term3;
  }
  case 'KINETIC_3': {
   const num = ((0.027556129 * x0) - 7.712339) - (x0 * (((x0 * -3.2201477e-8) - 1.0005308) * x0));
   const den = ((x0 * -3.2588e-8) + x0) + (-0.42873216 / x0);
   const sub = (-3.2588e-8 * x0) + ((x0 + (x0 * 1.8797243e-7)) + (x0 * -3.2588e-8));
   return (num / den) - sub;
  }
  case 'HEAT_4': {
   const term1 = ((0.26161367 / -0.22874504) - -1.9878478) * (-0.08261643 / (x0 * -0.18826087));
   const term2 = (((x0 - -0.15933229) / ((18710.39 + (-1.0116102 * x0)) - 0.31377897)) + 1.7578957) / (((3023.8103 / x0) + x0) - x0);
   return term1 + term2;
  }
  case 'TRACER_5': {
   return ((x0 + (x0 * 0.3744139)) / (x0 + x0)) - (((-0.0046960237 - (-0.27049395 / x0)) * ((x0 - 482.59036) * x0)) / (x0 - -644.39197));
  }
  case 'KINETIC_6': {
   return ((x0 * x0) / (((((0.4833322 / x0) + x0) * (x0 - -0.7865501)) - (((x0 + 0.8482119) * x0) + -1892.3315)) * (x0 / 1.1029253))) - -0.0043064407;
  }
  case 'SABOT_7': {
   const denom = ((-4.2442085e-11 - x0) - ((x0 * 6.5863803e-9) / 0.6101818)) - (-1.3305831 / ((x0 * 4.144727e-11) * x0));
   const term1 = -0.6291913 / denom;
   const inner = ((1.0905167 - (x0 * -7.675812e-5)) * 0.0010374311) + (x0 * (x0 * 4.250711e-11));
   const term2 = inner * (x0 + -2.7273443);
   return term1 + term2;
  }
  case 'GUIDED_8': {
   return 12.0; // baseline duration
  }
  default:
   return x0 / 1000;
 }
}


// some random vars for later
let _tempCounter = 0;
let isReadyFlag = false;

// function _doFutureStuff() {
//   console.log('not implemented yet');
// }
