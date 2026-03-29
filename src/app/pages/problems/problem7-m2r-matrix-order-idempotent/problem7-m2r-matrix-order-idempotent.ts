import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';
import { Matrix, MatrixAlgebra, MatrixOrderResult } from '../../../services/matrix-algebra';

interface MatrixPreset {
  id: string;
  labelKey: string;
  descriptionKey: string;
  matrix: Matrix;
}

@Component({
  selector: 'app-problem7-m2r-matrix-order-idempotent',
  imports: [RouterModule, CommonModule, LucideAngularModule, TranslatePipe],
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
      labelKey: 'problem7.presets.identity.label',
      descriptionKey: 'problem7.presets.identity.description',
      matrix: [
        [1, 0],
        [0, 1],
      ],
    },
    {
      id: 'minus-identity',
      labelKey: 'problem7.presets.minus-identity.label',
      descriptionKey: 'problem7.presets.minus-identity.description',
      matrix: [
        [-1, 0],
        [0, -1],
      ],
    },
    {
      id: 'rotation-90',
      labelKey: 'problem7.presets.rotation90.label',
      descriptionKey: 'problem7.presets.rotation90.description',
      matrix: [
        [0, -1],
        [1, 0],
      ],
    },
    {
      id: 'projection-idempotent',
      labelKey: 'problem7.presets.projection-idempotent.label',
      descriptionKey: 'problem7.presets.projection-idempotent.description',
      matrix: [
        [1, 0],
        [0, 0],
      ],
    },
    {
      id: 'scale-2',
      labelKey: 'problem7.presets.scale-2.label',
      descriptionKey: 'problem7.presets.scale-2.description',
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
      this.errorMessage = 'problem7.errors.maxPowerRange';
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
      this.errorMessage = 'problem7.errors.tolerancePositive';
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
      this.errorMessage = error instanceof Error ? error.message : 'errors.unexpectedComputation';
    }
  }
}
