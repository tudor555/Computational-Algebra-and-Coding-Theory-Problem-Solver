import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ContinuedFractionResult,
  ExtendedEuclidResult,
  GcdResult,
  NumberTheory,
} from '../../services/number-theory';

interface EuclidPreset {
  id: string;
  label: string;
  description: string;
  a: number;
  b: number;
}

@Component({
  selector: 'app-problem14-euclid-continued-fraction',
  imports: [RouterModule],
  templateUrl: './problem14-euclid-continued-fraction.html',
  styleUrl: './problem14-euclid-continued-fraction.scss',
})
export class Problem14EuclidContinuedFraction {
  inputA = 30;
  inputB = 18;

  errorMessage: string | null = null;

  gcdResult: GcdResult | null = null;
  extendedResult: ExtendedEuclidResult | null = null;
  continuedFractionResult: ContinuedFractionResult | null = null;

  presets: EuclidPreset[] = [
    {
      id: '30-18',
      label: 'a = 30, b = 18',
      description: 'Exemplu clasic: cmmdc(30, 18) = 6.',
      a: 30,
      b: 18,
    },
    {
      id: '21-13',
      label: 'a = 21, b = 13',
      description: 'Raport apropiat de secțiunea de aur.',
      a: 21,
      b: 13,
    },
    {
      id: '48-20',
      label: 'a = 48, b = 20',
      description: 'Exemplu cu cmmdc(48, 20) = 4.',
      a: 48,
      b: 20,
    },
  ];

  constructor(private numberTheory: NumberTheory) {}

  // Handle changes in the input a
  onInputAChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.inputA = Number.isNaN(value) ? 0 : value;
  }

  // Handle changes in the input b
  onInputBChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.inputB = Number.isNaN(value) ? 0 : value;
  }

  // Apply a preset pair (a, b)
  onApplyPreset(preset: EuclidPreset): void {
    this.inputA = preset.a;
    this.inputB = preset.b;

    this.errorMessage = null;
    this.gcdResult = null;
    this.extendedResult = null;
    this.continuedFractionResult = null;
  }

  // Run all computations: gcd, extended Euclid and continued fraction
  onCompute(): void {
    this.errorMessage = null;
    this.gcdResult = null;
    this.extendedResult = null;
    this.continuedFractionResult = null;

    const a = this.inputA;
    const b = this.inputB;

    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
      this.errorMessage = 'a și b trebuie să fie numere naturale (întregi nenegative).';
      return;
    }

    if (a === 0 && b === 0) {
      this.errorMessage =
        'Cel puțin unul dintre numere trebuie să fie nenul pentru a calcula cmmdc.';
      return;
    }

    try {
      this.gcdResult = this.numberTheory.computeGcdWithSteps(a, b);
      this.extendedResult = this.numberTheory.computeExtendedEuclid(a, b);

      if (b !== 0) {
        this.continuedFractionResult = this.numberTheory.computeContinuedFraction(a, b);
      } else {
        this.continuedFractionResult = null;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }

  // Format continued fraction as [q0; q1, q2, ...]
  formatContinuedFraction(result: ContinuedFractionResult): string {
    if (!result.quotients.length) {
      return '[]';
    }

    const [first, ...rest] = result.quotients;
    if (!rest.length) {
      return `[${first}]`;
    }

    return `[${first}; ${rest.join(', ')}]`;
  }

  // Format the linear combination a·x + b·y = d as a readable string
  formatLinearCombination(result: ExtendedEuclidResult | null): string | null {
    if (!result) {
      return null;
    }

    const { a, b, gcd, coefficientA, coefficientB } = result;
    return `${a} · (${coefficientA}) + ${b} · (${coefficientB}) = ${gcd}`;
  }
}
