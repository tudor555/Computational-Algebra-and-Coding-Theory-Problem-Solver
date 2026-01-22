import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Matrix, MatrixAlgebra } from '../../../services/matrix-algebra';

interface MatrixPreset {
  id: string;
  label: string;
  description: string;
  matrix: Matrix;
}

interface HermitianInverseCheckResult {
  isSquare: boolean;
  isHermitian: boolean;
  hasInverse: boolean;
  inverse: Matrix | null;
  inverseIsHermitian: boolean | null; // null when inverse not computed
}

@Component({
  selector: 'app-problem3-hermitian-matrix-inverse',
  imports: [RouterModule, CommonModule],
  templateUrl: './problem3-hermitian-matrix-inverse.html',
  styleUrl: './problem3-hermitian-matrix-inverse.scss',
})
export class Problem3HermitianMatrixInverse {
  rowCount = 3;
  columnCount = 3;

  matrix: Matrix = [];

  presets: MatrixPreset[] = [
    {
      id: '3x3-symmetric-invertible',
      label: 'Matrice Hermitică (reală) inversabilă',
      description: 'Exemplu simetric real, cu inversă.',
      matrix: [
        [4, 1, 2],
        [1, 3, 0],
        [2, 0, 2],
      ],
    },
    {
      id: '3x3-symmetric-singular',
      label: 'Matrice Hermitică (reală) singulară',
      description: 'Simetrică, dar determinant zero → fără inversă.',
      matrix: [
        [1, 2, 3],
        [2, 4, 6],
        [3, 6, 9],
      ],
    },
    {
      id: '3x3-not-hermitian',
      label: 'Nu este Hermitică',
      description: 'Exemplu care nu este simetric (pentru intrări reale).',
      matrix: [
        [1, 2, 0],
        [0, 1, 3],
        [4, 0, 1],
      ],
    },
    {
      id: '2x2-symmetric-invertible',
      label: '2×2 Hermitică (reală) inversabilă',
      description: 'Exemplu mic, bun pentru verificare rapidă.',
      matrix: [
        [2, -1],
        [-1, 2],
      ],
    },
  ];

  errorMessage: string | null = null;
  result: HermitianInverseCheckResult | null = null;

  constructor(private matrixAlgebraService: MatrixAlgebra) {
    this.initializeMatrix();
  }

  initializeMatrix(): void {
    this.matrix = Array.from({ length: this.rowCount }, () => Array(this.columnCount).fill(0));
    this.errorMessage = null;
    this.result = null;
  }

  onApplyPreset(preset: MatrixPreset): void {
    const rows = preset.matrix.length;
    const cols = preset.matrix[0].length;

    this.rowCount = rows;
    this.columnCount = cols;
    this.matrix = preset.matrix.map((row) => [...row]);

    this.errorMessage = null;
    this.result = null;
  }

  onRowCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value <= 0 || value > 8) {
      this.errorMessage = 'Numărul de linii trebuie să fie un întreg între 1 și 8.';
      return;
    }

    this.rowCount = value;
    this.initializeMatrix();
  }

  onColumnCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value <= 0 || value > 8) {
      this.errorMessage = 'Numărul de coloane trebuie să fie un întreg între 1 și 8.';
      return;
    }

    this.columnCount = value;
    this.initializeMatrix();
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
      const isSquare = this.matrixAlgebraService.isSquare(this.matrix);
      const isHermitian = isSquare ? this.matrixAlgebraService.isHermitianReal(this.matrix) : false;

      let inverse: Matrix | null = null;
      let hasInverse = false;
      let inverseIsHermitian: boolean | null = null;

      if (isSquare && isHermitian) {
        inverse = this.matrixAlgebraService.computeInverseGauss(this.matrix);
        hasInverse = inverse !== null;

        if (inverse) {
          inverseIsHermitian = this.matrixAlgebraService.isHermitianReal(inverse);
        } else {
          inverseIsHermitian = null;
        }
      }

      this.result = {
        isSquare,
        isHermitian,
        hasInverse,
        inverse,
        inverseIsHermitian,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }
}
