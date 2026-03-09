import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';
import {
  ContinuedFractionResult,
  ExtendedEuclidResult,
  GcdResult,
  NumberTheory,
} from '../../../services/number-theory';

interface EuclidPreset {
  id: string;
  labelKey: string;
  descriptionKey: string;
  a: number;
  b: number;
}

@Component({
  selector: 'app-problem14-euclid-continued-fraction',
  imports: [RouterModule, LucideAngularModule, TranslatePipe],
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
      labelKey: 'problem14.presets.30-18.label',
      descriptionKey: 'problem14.presets.30-18.description',
      a: 30,
      b: 18,
    },
    {
      id: '21-13',
      labelKey: 'problem14.presets.21-13.label',
      descriptionKey: 'problem14.presets.21-13.description',
      a: 21,
      b: 13,
    },
    {
      id: '48-20',
      labelKey: 'problem14.presets.48-20.label',
      descriptionKey: 'problem14.presets.48-20.description',
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
      this.errorMessage = 'problem14.errors.naturalNumbers';
      return;
    }

    if (a === 0 && b === 0) {
      this.errorMessage = 'problem14.errors.bothZero';
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
      this.errorMessage = error instanceof Error ? error.message : 'errors.unexpectedComputation';
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
