import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';
import {
  LinearSystemSolutionResult,
  Matrix,
  MatrixAlgebra,
} from '../../../services/matrix-algebra';

interface LinearSystemPreset {
  id: string;
  labelKey: string;
  descriptionKey: string;
  A: Matrix;
  b: number[];
}

@Component({
  selector: 'app-problem4-gauss-rang4-linear-system',
  imports: [RouterModule, CommonModule, LucideAngularModule, TranslatePipe],
  templateUrl: './problem4-gauss-rang4-linear-system.html',
  styleUrl: './problem4-gauss-rang4-linear-system.scss',
})
export class Problem4GaussRang4LinearSystem {
  // Keep it fixed to 4×4 (as per statement).
  readonly size = 4;

  A: Matrix = [];
  b: number[] = [];

  presets: LinearSystemPreset[] = [
    {
      id: 'unique-solution',
      labelKey: 'problem4.presets.uniqueSolution.label',
      descriptionKey: 'problem4.presets.uniqueSolution.description',
      A: [
        [2, 1, -1, 1],
        [1, 3, 2, -2],
        [1, 0, 0, 3],
        [0, 2, 1, 1],
      ],
      b: [2, 9, 7, 4],
    },
    {
      id: 'no-solution',
      labelKey: 'problem4.presets.noSolution.label',
      descriptionKey: 'problem4.presets.noSolution.description',
      A: [
        [1, 1, 0, 0],
        [2, 2, 0, 0],
        [0, 0, 1, 1],
        [0, 0, 2, 2],
      ],
      b: [1, 3, 1, 2],
    },
    {
      id: 'infinite-solutions',
      labelKey: 'problem4.presets.infiniteSolutions.label',
      descriptionKey: 'problem4.presets.infiniteSolutions.description',
      A: [
        [1, 1, 0, 0],
        [2, 2, 0, 0],
        [0, 0, 1, 1],
        [0, 0, 2, 2],
      ],
      b: [1, 2, 1, 2],
    },
  ];

  errorMessage: string | null = null;
  result: LinearSystemSolutionResult | null = null;

  constructor(private matrixAlgebraService: MatrixAlgebra) {
    this.initialize();
  }

  initialize(): void {
    this.A = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.b = Array(this.size).fill(0);
    this.errorMessage = null;
    this.result = null;
  }

  onApplyPreset(preset: LinearSystemPreset): void {
    this.A = preset.A.map((row) => [...row]);
    this.b = [...preset.b];
    this.errorMessage = null;
    this.result = null;
  }

  onCellChange(rowIndex: number, columnIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.A[rowIndex][columnIndex] = Number.isNaN(value) ? 0 : value;
  }

  onBChange(rowIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.b[rowIndex] = Number.isNaN(value) ? 0 : value;
  }

  onCompute(): void {
    this.errorMessage = null;
    this.result = null;

    try {
      this.result = this.matrixAlgebraService.solveLinearSystemGaussJordan(this.A, this.b);
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error ? error.message : 'errors.unexpectedComputation';
    }
  }
}
