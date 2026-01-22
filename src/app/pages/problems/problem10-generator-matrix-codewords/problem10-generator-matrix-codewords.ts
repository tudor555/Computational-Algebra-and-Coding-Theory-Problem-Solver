import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CodingTheory,
  GeneratorMatrixCodewordsResult,
  Matrix,
} from '../../../services/coding-theory';

interface GeneratorPreset {
  id: string;
  label: string;
  description: string;
  modulus: number;
  G: Matrix;
}

@Component({
  selector: 'app-problem10-generator-matrix-codewords',
  imports: [RouterModule],
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
      label: 'Z₂: G (2×4)',
      description: 'Exemplu mic: 2 biți informație, lungime 4.',
      modulus: 2,
      G: [
        [1, 0, 1, 1],
        [0, 1, 1, 0],
      ],
    },
    {
      id: 'z2-3x5',
      label: 'Z₂: G (3×5)',
      description: 'Puțin mai mare, încă rapid de generat.',
      modulus: 2,
      G: [
        [1, 0, 0, 1, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 1],
      ],
    },
    {
      id: 'z3-2x3',
      label: 'Z₃: G (2×3)',
      description: 'Exemplu peste Z₃.',
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
      this.errorMessage = 'Modulus trebuie să fie un întreg între 2 și 13.';
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
      this.errorMessage = 'Numărul de linii (k) trebuie să fie un întreg între 1 și 6.';
      return;
    }

    this.rowCount = value;
    this.initializeMatrix();
  }

  onColumnCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 12) {
      this.errorMessage = 'Numărul de coloane (n) trebuie să fie un întreg între 1 și 12.';
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
        this.errorMessage =
          'Prea multe cuvinte de generat (q^k este foarte mare). Reduceți k sau modulus.';
        return;
      }

      this.result = this.codingTheoryService.computeAllCodewordsFromGeneratorMatrix(
        this.generatorMatrix,
        this.modulus,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul generării.';
      }
    }
  }

  formatVector(vector: number[]): string {
    return `(${vector.join(', ')})`;
  }
}
