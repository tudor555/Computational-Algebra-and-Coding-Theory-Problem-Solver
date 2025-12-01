import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CharacteristicPolynomialResult,
  Matrix,
  MatrixAlgebra,
} from '../../services/matrix-algebra';

interface EigenPreset {
  id: string;
  label: string;
  description: string;
  matrix: Matrix;
}

@Component({
  selector: 'app-problem12-eigenvalues',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './problem12-eigenvalues.html',
  styleUrl: './problem12-eigenvalues.scss',
})
export class Problem12Eigenvalues {
  presets: EigenPreset[] = [
    {
      id: 'diag-2x2',
      label: 'Diagonală 2×2',
      description: 'Valorile proprii sunt direct elementele diagonale.',
      matrix: [
        [4, 0],
        [0, -2],
      ],
    },
    {
      id: 'general-2x2',
      label: 'Generală 2×2',
      description: 'Exemplu cu două valori proprii reale distincte.',
      matrix: [
        [2, 1],
        [1, 2],
      ],
    },
    {
      id: 'rotation-2x2',
      label: 'Matrice de rotație 2D',
      description: 'Nu are valori proprii reale.',
      matrix: [
        [0, -1],
        [1, 0],
      ],
    },
    {
      id: 'upper-3x3',
      label: 'Triunghiulară 3×3',
      description: 'Valorile proprii sunt elementele diagonale.',
      matrix: [
        [3, 1, 2],
        [0, 4, 1],
        [0, 0, -1],
      ],
    },
  ];

  size: 2 | 3 = 2;

  matrix: Matrix = [];

  errorMessage: string | null = null;
  result: CharacteristicPolynomialResult | null = null;

  constructor(private matrixAlgebraService: MatrixAlgebra) {
    this.initializeMatrix();
  }

  // Initialize the matrix with zeros based on the current size
  initializeMatrix(): void {
    this.matrix = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.errorMessage = null;
    this.result = null;
  }

  onApplyPreset(preset: EigenPreset): void {
    const size = preset.matrix.length;

    if (size !== 2 && size !== 3) {
      this.errorMessage = 'Presetul are o dimensiune invalidă.';
      return;
    }

    this.size = size as 2 | 3;

    // Deep copy matrix
    this.matrix = preset.matrix.map((row) => [...row]);

    this.errorMessage = null;
    this.result = null;
  }

  // Handle changes in the matrix size (2×2 or 3×3)
  onSizeChange(value: number): void {
    if (value !== 2 && value !== 3) {
      this.errorMessage = 'Dimensiunea matricii trebuie să fie 2 sau 3.';
      return;
    }

    this.size = value as 2 | 3;
    this.initializeMatrix();
  }

  // Handle user input in a matrix cell
  onCellChange(rowIndex: number, columnIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.matrix[rowIndex][columnIndex] = Number.isNaN(value) ? 0 : value;
  }

  // Compute the characteristic polynomial and eigenvalues
  onCompute(): void {
    this.errorMessage = null;
    this.result = null;

    try {
      this.result = this.matrixAlgebraService.computeCharacteristicPolynomialAndEigenvalues(
        this.matrix
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
