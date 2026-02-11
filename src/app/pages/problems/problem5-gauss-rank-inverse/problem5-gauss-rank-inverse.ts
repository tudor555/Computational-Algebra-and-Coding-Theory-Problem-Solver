import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Matrix, MatrixAlgebra, RankAndInverseResult } from '../../../services/matrix-algebra';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';

interface MatrixPreset {
  id: string;
  labelKey: string;
  descriptionKey: string;
  matrix: Matrix;
}

@Component({
  selector: 'app-problem5-gauss-rank-inverse',
  imports: [RouterModule, CommonModule, LucideAngularModule, TranslatePipe],
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
      labelKey: 'problem5.presets.easy3x3Matrix.label',
      descriptionKey: 'problem5.presets.easy3x3Matrix.description',
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    },
    {
      id: '3x3-invertible',
      labelKey: 'problem5.presets.inverse3x3Matrix.label',
      descriptionKey: 'problem5.presets.inverse3x3Matrix.description',
      matrix: [
        [2, 1, 1],
        [1, 3, 2],
        [1, 0, 0],
      ],
    },
    {
      id: '2x2-invertible',
      labelKey: 'problem5.presets.invertible2x2Matrix.label',
      descriptionKey: 'problem5.presets.invertible2x2Matrix.description',
      matrix: [
        [4, 7],
        [2, 6],
      ],
    },
    {
      id: '2x2-singular',
      labelKey: 'problem5.presets.singular2x2Matrix.label',
      descriptionKey: 'problem5.presets.singular2x2Matrix.description',
      matrix: [
        [1, 2],
        [2, 4],
      ],
    },
    {
      id: '4x3-rectangular',
      labelKey: 'problem5.presets.rectangular4x3Matrix.label',
      descriptionKey: 'problem5.presets.rectangular4x3Matrix.description',
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

  // Initialize the matrix with zeros based on the current row and column count
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
      this.errorMessage = 'problem5.errors.rowsRange';
      return;
    }

    this.rowCount = value;
    this.initializeMatrix();
  }

  onColumnCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value <= 0 || value > 8) {
      this.errorMessage = 'problem5.errors.columnsRange';
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

  // Compute rank and, if applicable, inverse using Gaussian elimination
  onCompute(): void {
    this.errorMessage = null;
    this.computationResult = null;

    try {
      this.computationResult = this.matrixAlgebraService.computeRankAndInverse(this.matrix);
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error ? error.message : 'errors.unexpectedComputation';
    }
  }
}
