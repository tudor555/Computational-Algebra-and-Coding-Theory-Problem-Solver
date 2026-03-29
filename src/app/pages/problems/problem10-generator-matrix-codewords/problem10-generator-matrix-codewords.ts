import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';
import {
  CodingTheory,
  GeneratorMatrixCodewordsResult,
  Matrix,
} from '../../../services/coding-theory';

interface GeneratorPreset {
  id: string;
  labelKey: string;
  descriptionKey: string;
  modulus: number;
  G: Matrix;
}

@Component({
  selector: 'app-problem10-generator-matrix-codewords',
  imports: [RouterModule, LucideAngularModule, TranslatePipe],
  templateUrl: './problem10-generator-matrix-codewords.html',
  styleUrl: './problem10-generator-matrix-codewords.scss',
})
export class Problem10GeneratorMatrixCodewords {
  modulus = 2;

  rowCount = 2; // k
  columnCount = 4; // n

  generatorMatrix: Matrix = [];

  presets: GeneratorPreset[] = [
    {
      id: 'z2-2x4',
      labelKey: 'problem10.presets.z2-2x4.label',
      descriptionKey: 'problem10.presets.z2-2x4.description',
      modulus: 2,
      G: [
        [1, 0, 1, 1],
        [0, 1, 1, 0],
      ],
    },
    {
      id: 'z2-3x5',
      labelKey: 'problem10.presets.z2-3x5.label',
      descriptionKey: 'problem10.presets.z2-3x5.description',
      modulus: 2,
      G: [
        [1, 0, 0, 1, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 1],
      ],
    },
    {
      id: 'z3-2x3',
      labelKey: 'problem10.presets.z3-2x3.label',
      descriptionKey: 'problem10.presets.z3-2x3.description',
      modulus: 3,
      G: [
        [1, 0, 1],
        [0, 1, 1],
      ],
    },
  ];

  errorMessage: string | null = null;
  result: GeneratorMatrixCodewordsResult | null = null;

  constructor(private codingTheoryService: CodingTheory) {
    this.initializeMatrix();
  }

  initializeMatrix(): void {
    this.generatorMatrix = Array.from({ length: this.rowCount }, () =>
      Array(this.columnCount).fill(0),
    );
    this.errorMessage = null;
    this.result = null;
  }

  onApplyPreset(preset: GeneratorPreset): void {
    this.modulus = preset.modulus;
    this.rowCount = preset.G.length;
    this.columnCount = preset.G[0]?.length ?? 0;
    this.generatorMatrix = preset.G.map((row) => [...row]);

    this.errorMessage = null;
    this.result = null;
  }

  onModulusChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 2 || value > 13) {
      this.errorMessage = 'problem10.errors.modulusRange';
      return;
    }

    this.modulus = value;
    this.errorMessage = null;
    this.result = null;
  }

  onRowCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 6) {
      this.errorMessage = 'problem10.errors.rowsRange';
      return;
    }

    this.rowCount = value;
    this.initializeMatrix();
  }

  onColumnCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 12) {
      this.errorMessage = 'problem10.errors.colsRange';
      return;
    }

    this.columnCount = value;
    this.initializeMatrix();
  }

  onCellChange(rowIndex: number, columnIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.generatorMatrix[rowIndex][columnIndex] = Number.isNaN(value) ? 0 : value;
  }

  onCompute(): void {
    this.errorMessage = null;
    this.result = null;

    try {
      // Keep runtime reasonable: q^k can explode
      const estimated = Math.pow(this.modulus, this.rowCount);
      if (estimated > 5000) {
        this.errorMessage = 'problem10.errors.tooMany';
        return;
      }

      this.result = this.codingTheoryService.computeAllCodewordsFromGeneratorMatrix(
        this.generatorMatrix,
        this.modulus,
      );
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error ? error.message : 'problem10.errors.unexpected';
    }
  }

  formatVector(vector: number[]): string {
    return `(${vector.join(', ')})`;
  }
}
