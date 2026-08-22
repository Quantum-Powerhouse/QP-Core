import type { Statevector } from "./statevector.ts";

export type MeasurementResult = {
  outcomeIndex: number;
  probabilities: number[];
};

export function probabilitiesOf(state: Statevector): number[] {
  return state.map((amp) => amp.re * amp.re + amp.im * amp.im);
}

/**
 * Simulates a single projective measurement in the computational basis:
 * real inverse-CDF sampling over |amplitude|^2, not a scripted animation.
 */
export function sampleMeasurement(state: Statevector): MeasurementResult {
  const probabilities = probabilitiesOf(state);
  const draw = Math.random();

  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (draw < cumulative) {
      return { outcomeIndex: i, probabilities };
    }
  }
  // Floating-point fallback: land on the last nonzero-probability outcome.
  return { outcomeIndex: probabilities.length - 1, probabilities };
}
