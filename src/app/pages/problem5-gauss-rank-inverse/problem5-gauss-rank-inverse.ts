import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Matrix, MatrixAlgebra, RankAndInverseResult } from '../../services/matrix-algebra';

interface MatrixPreset {
  id: string;
  label: string;
  description: string;
  matrix: Matrix;
}

@Component({
  selector: 'app-problem5-gauss-rank-inverse',
  imports: [RouterModule, CommonModule],
  templateUrl: './problem5-gauss-rank-inverse.html',
  styleUrl: './problem5-gauss-rank-inverse.scss',
})
export class Problem5GaussRankInverse {
  rowCount = 3;
  columnCount = 3;

  matrix: Matrix = [];

  presets: MatrixPreset[] = [
    {
      id: '3x3-easy',
      label: 'Matrice 3×3 simplă',
      description: 'Exemplu ușor pentru verificarea rangului.',
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    },
    {
      id: '3x3-invertible',
      label: 'Matrice 3×3 inversabilă',
      description: 'Determinant nenul, bună pentru testarea inversei.',
      matrix: [
        [2, 1, 1],
        [1, 3, 2],
        [1, 0, 0],
      ],
    },
    {
      id: '2x2-invertible',
      label: 'Matrice 2×2 inversabilă',
      description: 'Exemplu mic, inversabil sigur.',
      matrix: [
        [4, 7],
        [2, 6],
      ],
    },
    {
      id: '2x2-singular',
      label: 'Matrice 2×2 singulară',
      description: 'Determinant zero → fără inversă.',
      matrix: [
        [1, 2],
        [2, 4],
      ],
    },
    {
      id: '4x3-rectangular',
      label: 'Matrice 4×3 rectangulară',
      description: 'Bună pentru testarea rangului și forma escalonată.',
      matrix: [
        [1, 2, 0],
        [3, 6, 0],
        [1, 1, 1],
        [2, 3, 1],
      ],
    },
  ];

  errorMessage: string | null = null;
  computationResult: RankAndInverseResult | null = null;

  constructor(private matrixAlgebraService: MatrixAlgebra) {
    this.initializeMatrix();
  }

  // Initialize the matrix with zeros based on the current row and column count.
  initializeMatrix(): void {
    this.matrix = Array.from({ length: this.rowCount }, () => Array(this.columnCount).fill(0));
    this.errorMessage = null;
    this.computationResult = null;
  }

  onApplyPreset(preset: MatrixPreset): void {
    const rows = preset.matrix.length;
    const cols = preset.matrix[0].length;

    this.rowCount = rows;
    this.columnCount = cols;

    // Deep copy to avoid mutating the preset
    this.matrix = preset.matrix.map((row) => [...row]);

    this.errorMessage = null;
    this.computationResult = null;
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

  // Compute rank and, if applicable, inverse using Gaussian elimination.
  onCompute(): void {
    this.errorMessage = null;
    this.computationResult = null;

    try {
      this.computationResult = this.matrixAlgebraService.computeRankAndInverse(this.matrix);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }
}
