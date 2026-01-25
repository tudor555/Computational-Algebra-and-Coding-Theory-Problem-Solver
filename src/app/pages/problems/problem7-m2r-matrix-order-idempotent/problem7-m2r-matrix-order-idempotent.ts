import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Matrix, MatrixAlgebra, MatrixOrderResult } from '../../../services/matrix-algebra';

interface MatrixPreset {
  id: string;
  label: string;
  description: string;
  matrix: Matrix;
}

@Component({
  selector: 'app-problem7-m2r-matrix-order-idempotent',
  imports: [RouterModule, CommonModule],
  templateUrl: './problem7-m2r-matrix-order-idempotent.html',
  styleUrl: './problem7-m2r-matrix-order-idempotent.scss',
})
export class Problem7M2rMatrixOrderIdempotent {
  // fixed 2×2 as per statement M2(R)
  readonly size = 2;

  matrix: Matrix = [];

  maxPower = 50;
  tolerance = 1e-10;

  presets: MatrixPreset[] = [
    {
      id: 'identity',
      label: 'Identitatea (ordin 1)',
      description: 'I are ordin 1 și este idempotentă.',
      matrix: [
        [1, 0],
        [0, 1],
      ],
    },
    {
      id: 'minus-identity',
      label: '-I (ordin 2)',
      description: '(-I)^2 = I.',
      matrix: [
        [-1, 0],
        [0, -1],
      ],
    },
    {
      id: 'rotation-90',
      label: 'Rotație 90° (ordin 4)',
      description: 'Matrice de rotație: R^4 = I.',
      matrix: [
        [0, -1],
        [1, 0],
      ],
    },
    {
      id: 'projection-idempotent',
      label: 'Proiecție (idempotentă)',
      description: 'P^2 = P, dar nu are ordin finit (în general).',
      matrix: [
        [1, 0],
        [0, 0],
      ],
    },
    {
      id: 'scale-2',
      label: 'Scalare (fără ordin finit)',
      description: '2I nu ajunge la I pentru n>0.',
      matrix: [
        [2, 0],
        [0, 2],
      ],
    },
  ];

  errorMessage: string | null = null;
  result: MatrixOrderResult | null = null;

  constructor(private matrixAlgebraService: MatrixAlgebra) {
    this.initializeMatrix();
  }

  initializeMatrix(): void {
    this.matrix = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.errorMessage = null;
    this.result = null;
  }

  onApplyPreset(preset: MatrixPreset): void {
    this.matrix = preset.matrix.map((row) => [...row]);
    this.errorMessage = null;
    this.result = null;
  }

  onMaxPowerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 500) {
      this.errorMessage = 'Max power trebuie să fie un întreg între 1 și 500.';
      return;
    }

    this.maxPower = value;
    this.errorMessage = null;
    this.result = null;
  }

  onToleranceChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isFinite(value) || value <= 0 || value > 1e-2) {
      this.errorMessage = 'Toleranța trebuie să fie un număr pozitiv (ex: 1e-10).';
      return;
    }

    this.tolerance = value;
    this.errorMessage = null;
    this.result = null;
  }

  onCellChange(rowIndex: number, columnIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.matrix[rowIndex][columnIndex] = Number.isNaN(value) ? 0 : value;
  }

  onCompute(): void {
    this.errorMessage = null;
    this.result = null;

    try {
      this.result = this.matrixAlgebraService.computeOrderInMultiplicativeGroup(
        this.matrix,
        this.maxPower,
        this.tolerance,
        10,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }
}
