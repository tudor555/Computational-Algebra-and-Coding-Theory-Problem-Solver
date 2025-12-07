import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Matrix, MatrixAlgebra, MatrixDecompositionResult } from '../../services/matrix-algebra';

interface MatrixPreset {
  id: string;
  label: string;
  description: string;
  matrix: Matrix;
}

@Component({
  selector: 'app-problem2-matrix-decomposition',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './problem2-matrix-decomposition.html',
  styleUrl: './problem2-matrix-decomposition.scss',
})
export class Problem2MatrixDecomposition {
  // Matrix dimensions (square matrix only)
  size = 3;

  // Input matrix
  matrix: Matrix = [];

  // Computation result
  decompositionResult: MatrixDecompositionResult | null = null;

  // Error message (if something goes wrong)
  errorMessage: string | null = null;

  // Some predefined matrices for quick testing
  presets: MatrixPreset[] = [
    {
      id: '2x2-simple',
      label: 'Matrice 2×2 simplă',
      description: 'Exemplu mic, ușor de verificat manual.',
      matrix: [
        [1, 2],
        [3, 4],
      ],
    },
    {
      id: '3x3-mixed',
      label: 'Matrice 3×3 mixtă',
      description: 'Valori pozitive și negative.',
      matrix: [
        [2, -1, 0],
        [3, 5, 4],
        [0, -2, 1],
      ],
    },
    {
      id: '3x3-symmetric',
      label: 'Matrice 3×3 simetrică',
      description: 'Deja simetrică, componenta antisimetrică va fi zero.',
      matrix: [
        [2, 1, 3],
        [1, 4, 0],
        [3, 0, -1],
      ],
    },
  ];

  constructor(private matrixAlgebraService: MatrixAlgebra) {
    this.initializeMatrix();
  }

  // Initialize the matrix with zeros based on the current size.
  initializeMatrix(): void {
    this.matrix = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.decompositionResult = null;
    this.errorMessage = null;
  }

  // Handle change of matrix size from the input field.
  onSizeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value <= 0 || value > 6) {
      this.errorMessage = 'Dimensiunea matricii trebuie să fie un număr întreg între 1 și 6.';
      return;
    }

    this.size = value;
    this.initializeMatrix();
  }

  // Handle user input in a matrix cell.
  onCellChange(rowIndex: number, colIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.matrix[rowIndex][colIndex] = Number.isNaN(value) ? 0 : value;
  }

  // Apply a predefined matrix preset
  onApplyPreset(preset: MatrixPreset): void {
    const rows = preset.matrix.length;
    const cols = rows > 0 ? preset.matrix[0].length : 0;

    if (rows !== cols) {
      this.errorMessage = 'Preset matrix is not square.';
      return;
    }

    this.size = rows;
    // Deep copy to avoid mutating the preset
    this.matrix = preset.matrix.map((row) => [...row]);
    this.decompositionResult = null;
    this.errorMessage = null;
  }

  // Trigger the decomposition using the MatrixAlgebraService
  onDecompose(): void {
    this.errorMessage = null;
    this.decompositionResult = null;

    try {
      const result = this.matrixAlgebraService.decomposeIntoSymmetricAndSkew(this.matrix);
      this.decompositionResult = result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }

  // Helper method to format a matrix entry for display
  trackByIndex(index: number): number {
    return index;
  }
}
