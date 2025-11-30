import { Injectable } from '@angular/core';

export interface PowerStep {
  exponent: number;
  value: number;
}

export interface OrderComputationResult {
  modulus: number;
  element: number;
  normalizedElement: number;
  gcdWithModulus: number;
  isUnit: boolean;
  order: number | null;
  steps: PowerStep[];
}

@Injectable({
  providedIn: 'root',
})
export class ModularGroup {
  // Normalize a number modulo n to the range [0, n - 1].
  normalizeMod(element: number, modulus: number): number {
    if (modulus <= 0) {
      throw new Error('Modulus must be a positive integer.');
    }

    const remainder = element % modulus;
    return remainder < 0 ? remainder + modulus : remainder;
  }

  // Compute gcd(first, second) using the Euclidean algorithm.
  gcd(first: number, second: number): number {
    let dividend = Math.abs(first);
    let divisor = Math.abs(second);

    while (divisor !== 0) {
      const remainder = dividend % divisor;
      dividend = divisor;
      divisor = remainder;
    }

    return dividend;
  }

  // Check whether a is a unit in Z_n (i.e., gcd(a, n) = 1).
  isUnitInZn(element: number, modulus: number): boolean {
    return this.gcd(element, modulus) === 1;
  }

  // Compute the multiplicative order of `element` in (Z_modulus, ·), if it exists.
  //
  // We work in the group of units modulo `modulus`.
  // The order of element is the smallest positive integer k such that:
  //   element^k ≡ 1 (mod modulus).
  //
  // To avoid infinite loops for bad or large inputs, we use a configurable `maxSteps` limit.
  computeOrderInZn(
    element: number,
    modulus: number,
    maxSteps: number = 2000
  ): OrderComputationResult {
    if (modulus <= 1) {
      throw new Error('Modulus must be at least 2.');
    }

    const normalizedElement = this.normalizeMod(element, modulus);
    const gcdWithModulus = this.gcd(normalizedElement, modulus);
    const isUnit = gcdWithModulus === 1;

    const steps: PowerStep[] = [];

    // If the element is not invertible, its order in the multiplicative group is not defined.
    if (!isUnit) {
      return {
        modulus,
        element,
        normalizedElement,
        gcdWithModulus,
        isUnit,
        order: null,
        steps,
      };
    }

    let currentPower = 1;
    let order: number | null = null;

    for (let exponent = 1; exponent <= maxSteps; exponent++) {
      currentPower = (currentPower * normalizedElement) % modulus;
      steps.push({ exponent, value: currentPower });

      if (currentPower === 1) {
        order = exponent;
        break;
      }
    }

    return {
      modulus,
      element,
      normalizedElement,
      gcdWithModulus,
      isUnit,
      order,
      steps,
    };
  }

  // Check whether `element` is idempotent modulo `modulus`.
  //
  // An element is idempotent if:
  //   element^2 ≡ element (mod modulus)
  // which is equivalent to:
  //   element * element ≡ element (mod modulus).
  isIdempotent(element: number, modulus: number): boolean {
    if (modulus <= 0) {
      throw new Error('Modulus must be a positive integer.');
    }

    const normalizedElement = this.normalizeMod(element, modulus);
    const squared = (normalizedElement * normalizedElement) % modulus;
    const difference = this.normalizeMod(squared - normalizedElement, modulus);

    return difference === 0;
  }
}
