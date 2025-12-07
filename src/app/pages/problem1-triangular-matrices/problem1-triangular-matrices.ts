import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Matrix, MatrixAlgebra, TriangularType } from '../../services/matrix-algebra';

interface TriangularPreset {
  id: string;
  label: string;
  description: string;
  size: number;
  matrixA: Matrix;
  matrixB: Matrix;
}

interface TriangularAnalysisResult {
  size: number;

  matrixAType: TriangularType;
  matrixBType: TriangularType;

  inverseExists: boolean;
  inverseMatrixA: Matrix | null;
  inverseMatrixAType: TriangularType | null;

  productMatrix: Matrix | null;
  productMatrixType: TriangularType | null;
}

@Component({
  selector: 'app-problem1-triangular-matrices',
  imports: [RouterModule, CommonModule],
  templateUrl: './problem1-triangular-matrices.html',
  styleUrl: './problem1-triangular-matrices.scss',
})
export class Problem1TriangularMatrices {
  size = 3;

  matrixA: Matrix = [];
  matrixB: Matrix = [];

  errorMessage: string | null = null;
  analysisResult: TriangularAnalysisResult | null = null;

  presets: TriangularPreset[] = [
    {
      id: 'upper-3x3',
      label: 'Două matrici 3×3 triunghiulare superioare',
      description: 'Exemplu în care inversa și produsul rămân triunghiulare superioare.',
      size: 3,
      matrixA: [
        [2, 1, -1],
        [0, 3, 4],
        [0, 0, 5],
      ],
      matrixB: [
        [1, -2, 0],
        [0, 4, 1],
        [0, 0, 2],
      ],
    },
    {
      id: 'lower-3x3',
      label: 'Două matrici 3×3 triunghiulare inferioare',
      description: 'Produsul și inversa (dacă există) rămân triunghiulare inferioare.',
      size: 3,
      matrixA: [
        [1, 0, 0],
        [2, 3, 0],
        [-1, 4, 2],
      ],
      matrixB: [
        [2, 0, 0],
        [1, 1, 0],
        [3, -2, 1],
      ],
    },
    {
      id: 'non-triangular',
      label: 'Matrice care nu este triunghiulară',
      description: 'Exemplu în care matricea A nu este triunghiulară.',
      size: 3,
      matrixA: [
        [1, 2, 0],
        [3, 4, 5],
        [0, 6, 7],
      ],
      matrixB: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    },
  ];

  constructor(private matrixAlgebraService: MatrixAlgebra) {
    this.initializeMatrices();
  }

  // Initialize both A and B as zero matrices of current size
  initializeMatrices(): void {
    this.matrixA = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.matrixB = Array.from({ length: this.size }, () => Array(this.size).fill(0));

    this.errorMessage = null;
    this.analysisResult = null;
  }

  // Handle matrix size changes
  onSizeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 6) {
      this.errorMessage = 'Dimensiunea matricii trebuie să fie un întreg între 1 și 6.';
      return;
    }

    this.size = value;
    this.initializeMatrices();
  }

  // Handle user input in matrix A
  onCellChangeA(rowIndex: number, columnIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.matrixA[rowIndex][columnIndex] = Number.isNaN(value) ? 0 : value;
  }

  // Handle user input in matrix B
  onCellChangeB(rowIndex: number, columnIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.matrixB[rowIndex][columnIndex] = Number.isNaN(value) ? 0 : value;
  }

  // Apply a predefined preset for matrices A and B
  onApplyPreset(preset: TriangularPreset): void {
    this.size = preset.size;

    this.matrixA = preset.matrixA.map((row) => [...row]);
    this.matrixB = preset.matrixB.map((row) => [...row]);

    this.errorMessage = null;
    this.analysisResult = null;
  }

  // Compute inverse(A) and the product A·B, then classify their triangular properties
  onAnalyze(): void {
    this.errorMessage = null;
    this.analysisResult = null;

    try {
      const typeA = this.matrixAlgebraService.classifyTriangular(this.matrixA);
      const typeB = this.matrixAlgebraService.classifyTriangular(this.matrixB);

      // Inverse of A using existing Gauss–Jordan logic from the service
      let inverseMatrixA: Matrix | null = null;
      let inverseExists = false;
      let inverseType: TriangularType | null = null;

      // We reuse the same method that computes rank and inverse (used also in Problem 5).
      const rankAndInverseResult = this.matrixAlgebraService.computeRankAndInverse(this.matrixA);

      if (
        rankAndInverseResult.isSquare &&
        rankAndInverseResult.hasInverse &&
        rankAndInverseResult.inverse
      ) {
        inverseExists = true;
        inverseMatrixA = rankAndInverseResult.inverse.map((row) => [...row]);
        inverseType = this.matrixAlgebraService.classifyTriangular(inverseMatrixA);
      }

      // Compute the product C = A · B
      let productMatrix: Matrix | null = null;
      let productType: TriangularType | null = null;

      try {
        productMatrix = this.matrixAlgebraService.multiplyMatrices(this.matrixA, this.matrixB);
        productType = this.matrixAlgebraService.classifyTriangular(productMatrix);
      } catch (multiplicationError) {
        // If multiplication fails due to incompatible sizes, leave product as null
        productMatrix = null;
        productType = null;
      }

      this.analysisResult = {
        size: this.size,
        matrixAType: typeA,
        matrixBType: typeB,
        inverseExists,
        inverseMatrixA,
        inverseMatrixAType: inverseType,
        productMatrix,
        productMatrixType: productType,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }

  // Map a triangular type to a human-readable label in Romanian
  getTriangularLabel(type: TriangularType | null): string {
    if (!type || type === 'none') {
      return 'netriunghiulară';
    }

    if (type === 'upper') {
      return 'triunghiulară superioară';
    }

    if (type === 'lower') {
      return 'triunghiulară inferioară';
    }

    // 'both' -> diagonal (upper and lower)
    return 'diagonală (triunghiulară superioară și inferioară)';
  }
}
