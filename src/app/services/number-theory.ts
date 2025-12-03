import { Injectable } from '@angular/core';

export interface GcdStep {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

export interface GcdResult {
  a: number;
  b: number;
  gcd: number;
  steps: GcdStep[];
}

export interface ExtendedEuclidStep {
  remainderPrevious: number;
  remainderCurrent: number;
  quotient: number;
  coefficientSPrevious: number;
  coefficientSCurrent: number;
  coefficientTPrevious: number;
  coefficientTCurrent: number;
}

export interface ExtendedEuclidResult {
  a: number;
  b: number;
  gcd: number;
  coefficientA: number;
  coefficientB: number;
  steps: ExtendedEuclidStep[];
}

export interface ContinuedFractionResult {
  numerator: number;
  denominator: number;
  quotients: number[]; // [q0, q1, q2, ...]
}

@Injectable({
  providedIn: 'root',
})
export class NumberTheory {
  // Compute gcd(a, b) using the Euclidean algorithm and record all steps
  computeGcdWithSteps(a: number, b: number): GcdResult {
    let first = Math.abs(a);
    let second = Math.abs(b);

    const steps: GcdStep[] = [];

    // Handle the trivial case where one of the numbers is zero
    if (second === 0) {
      return {
        a,
        b,
        gcd: first,
        steps: [
          {
            dividend: first,
            divisor: 0,
            quotient: 0,
            remainder: first,
          },
        ],
      };
    }

    while (second !== 0) {
      const quotient = Math.floor(first / second);
      const remainder = first % second;

      steps.push({
        dividend: first,
        divisor: second,
        quotient,
        remainder,
      });

      first = second;
      second = remainder;
    }

    return {
      a,
      b,
      gcd: first,
      steps,
    };
  }

  // Run the extended Euclidean algorithm to find x, y such that a·x + b·y = gcd(a, b)
  computeExtendedEuclid(a: number, b: number): ExtendedEuclidResult {
    let oldRemainder = Math.abs(a);
    let remainder = Math.abs(b);

    let oldS = 1;
    let s = 0;

    let oldT = 0;
    let t = 1;

    const steps: ExtendedEuclidStep[] = [];

    while (remainder !== 0) {
      const quotient = Math.floor(oldRemainder / remainder);

      const tempRemainder = oldRemainder - quotient * remainder;
      const tempS = oldS - quotient * s;
      const tempT = oldT - quotient * t;

      steps.push({
        remainderPrevious: oldRemainder,
        remainderCurrent: remainder,
        quotient,
        coefficientSPrevious: oldS,
        coefficientSCurrent: s,
        coefficientTPrevious: oldT,
        coefficientTCurrent: t,
      });

      oldRemainder = remainder;
      remainder = tempRemainder;

      oldS = s;
      s = tempS;

      oldT = t;
      t = tempT;
    }

    // oldRemainder is gcd(a, b), and a * oldS + b * oldT = gcd
    // Adjust signs to match original a, b
    const signA = a < 0 ? -1 : 1;
    const signB = b < 0 ? -1 : 1;

    const coefficientA = oldS * signA;
    const coefficientB = oldT * signB;

    return {
      a,
      b,
      gcd: oldRemainder,
      coefficientA,
      coefficientB,
      steps,
    };
  }

  // Compute the continued fraction expansion of a rational number a/b
  computeContinuedFraction(numerator: number, denominator: number): ContinuedFractionResult {
    if (denominator === 0) {
      throw new Error('Denominator must be non-zero for a/b.');
    }

    if (numerator < 0 || denominator < 0) {
      throw new Error('Both a and b should be natural numbers (non-negative).');
    }

    let currentNumerator = numerator;
    let currentDenominator = denominator;

    const quotients: number[] = [];

    while (currentDenominator !== 0) {
      const quotient = Math.floor(currentNumerator / currentDenominator);
      const remainder = currentNumerator % currentDenominator;

      quotients.push(quotient);

      currentNumerator = currentDenominator;
      currentDenominator = remainder;
    }

    return {
      numerator,
      denominator,
      quotients,
    };
  }
}
