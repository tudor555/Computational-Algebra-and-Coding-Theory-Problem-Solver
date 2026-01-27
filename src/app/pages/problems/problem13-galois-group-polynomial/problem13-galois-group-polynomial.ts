import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GaloisComputationResult, PolynomialAlgebra } from '../../../services/polynomial-algebra';

type Degree = 3 | 4;

interface PolynomialPreset {
  id: string;
  label: string;
  description: string;
  degree: Degree;
  coefficients: number[]; // [a_n..a_0]
}

@Component({
  selector: 'app-problem13-galois-group-polynomial',
  imports: [RouterModule],
  templateUrl: './problem13-galois-group-polynomial.html',
  styleUrl: './problem13-galois-group-polynomial.scss',
})
export class Problem13GaloisGroupPolynomial {
  degree: Degree = 3;

  // Store as numbers (integers), convert inside service
  coefficients: number[] = [1, 0, 0, -2]; // x^3 - 2 default

  presets: PolynomialPreset[] = [
    {
      id: 'cubic_s3',
      label: 'Cubic: x³ − 2',
      description: 'Irreducible cubic, discriminant not square → S3.',
      degree: 3,
      coefficients: [1, 0, 0, -2],
    },
    {
      id: 'cubic_a3',
      label: 'Cubic: x³ − 3x − 1',
      description: 'Often gives discriminant square → A3 (C3) in many examples.',
      degree: 3,
      coefficients: [1, 0, -3, -1],
    },
    {
      id: 'quartic_s4',
      label: 'Quartic: x⁴ − 2',
      description: 'Typical irreducible quartic → often S4.',
      degree: 4,
      coefficients: [1, 0, 0, 0, -2],
    },
    {
      id: 'quartic_dihedral',
      label: 'Quartic: x⁴ − 5x² + 6',
      description: 'Has special structure; try classification via resolvent.',
      degree: 4,
      coefficients: [1, 0, -5, 0, 6],
    },
  ];

  errorMessage: string | null = null;
  result: GaloisComputationResult | null = null;

  constructor(private polynomialService: PolynomialAlgebra) {}

  onApplyPreset(preset: PolynomialPreset): void {
    this.degree = preset.degree;
    this.coefficients = [...preset.coefficients];
    this.errorMessage = null;
    this.result = null;
  }

  onDegreeChange(event: Event): void {
    const input = event.target as HTMLSelectElement;
    const value = Number(input.value) as Degree;

    this.degree = value;

    // Resize coefficients
    this.coefficients = value === 3 ? [1, 0, 0, 0] : [1, 0, 0, 0, 0];
    this.errorMessage = null;
    this.result = null;
  }

  onCoefficientChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.coefficients[index] = Number.isNaN(value) ? 0 : Math.trunc(value);
  }

  onCompute(): void {
    this.errorMessage = null;
    this.result = null;

    try {
      // Ensure coefficient length matches degree
      const expectedLength = this.degree === 3 ? 4 : 5;
      const coeffs = this.coefficients.slice(0, expectedLength);

      this.result = this.polynomialService.computeGaloisGroupForDegree3or4(coeffs);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }

  formatBigInt(x: bigint | null): string {
    return x === null ? '—' : x.toString();
  }

  formatRoots(roots: { numerator: bigint; denominator: bigint }[]): string {
    if (roots.length === 0) {
      return '—';
    }

    return roots
      .map((r) =>
        r.denominator === 1n
          ? r.numerator.toString()
          : `${r.numerator.toString()}/${r.denominator.toString()}`,
      )
      .join(', ');
  }

  polynomialToString(coeffs: number[]): string {
    const deg = coeffs.length - 1;
    const parts: string[] = [];

    for (let i = 0; i < coeffs.length; i++) {
      const a = coeffs[i];
      const power = deg - i;
      if (a === 0) continue;

      const sign = a < 0 ? ' - ' : parts.length === 0 ? '' : ' + ';
      const absA = Math.abs(a);

      let term = '';

      switch (power) {
        case 0:
          term = `${absA}`;
          break;
        case 1:
          term = absA === 1 ? 'x' : `${absA}·x`;
          break;
        default:
          term = absA === 1 ? `x^${power}` : `${absA}·x^${power}`;
      }

      parts.push((parts.length === 0 && a < 0 ? '-' : sign) + term);
    }

    return parts.length === 0 ? '0' : parts.join('');
  }
}
