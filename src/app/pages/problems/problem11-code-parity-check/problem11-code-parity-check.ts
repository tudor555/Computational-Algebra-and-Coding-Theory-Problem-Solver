import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CodewordValidationResult,
  CodingTheory,
  Matrix,
  Vector,
} from '../../../services/coding-theory';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';

interface ParityCheckPreset {
  id: string;
  labelKey: string;
  descriptionKey: string;
  modulus: number;
  parityCheckMatrix: Matrix;
  words: Vector[];
}

@Component({
  selector: 'app-problem11-code-parity-check',
  imports: [RouterModule, LucideAngularModule, TranslatePipe],
  templateUrl: './problem11-code-parity-check.html',
  styleUrl: './problem11-code-parity-check.scss',
})
export class Problem11CodeParityCheck {
  presets: ParityCheckPreset[] = [
    {
      id: 'binary-single-parity',
      labelKey: 'problem11.presets.binary-single-parity.label',
      descriptionKey: 'problem11.presets.binary-single-parity.description',
      modulus: 2,
      parityCheckMatrix: [[1, 1, 1]],
      words: [
        [0, 0, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
    },
    {
      id: 'binary-hamming-7-4',
      labelKey: 'problem11.presets.binary-hamming-7-4.label',
      descriptionKey: 'problem11.presets.binary-hamming-7-4.description',
      modulus: 2,
      parityCheckMatrix: [
        [1, 0, 0, 1, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 1],
        [0, 0, 1, 0, 1, 1, 1],
      ],
      words: [
        [0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 1, 0, 0, 0],
        [1, 1, 0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1],
      ],
    },
    {
      id: 'ternary-example',
      labelKey: 'problem11.presets.ternary-example.label',
      descriptionKey: 'problem11.presets.ternary-example.description',
      modulus: 3,
      parityCheckMatrix: [
        [1, 1, 1],
        [0, 1, 2],
      ],
      words: [
        [0, 0, 0],
        [1, 1, 1],
        [1, 2, 0],
      ],
    },
  ];

  modulus = 2;

  parityRowCount = 3;
  parityColumnCount = 4;

  wordCount = 3;

  parityCheckMatrix: Matrix = [];
  words: Vector[] = [];

  errorMessage: string | null = null;
  validationResult: CodewordValidationResult | null = null;

  constructor(private codingTheoryService: CodingTheory) {
    this.initializeParityCheckMatrix();
    this.initializeWords();
  }

  // Initialize the parity-check matrix H with zeros
  initializeParityCheckMatrix(): void {
    this.parityCheckMatrix = Array.from({ length: this.parityRowCount }, () =>
      Array(this.parityColumnCount).fill(0),
    );
    this.validationResult = null;
    this.errorMessage = null;

    // Ensure words have correct length
    this.initializeWords();
  }

  // Initialize the list of words with zeros
  initializeWords(): void {
    this.words = Array.from({ length: this.wordCount }, () =>
      Array(this.parityColumnCount).fill(0),
    );
    this.validationResult = null;
    this.errorMessage = null;
  }

  onApplyPreset(preset: ParityCheckPreset): void {
    this.modulus = preset.modulus;

    // Update H dimensions
    this.parityRowCount = preset.parityCheckMatrix.length;
    this.parityColumnCount = this.parityRowCount > 0 ? preset.parityCheckMatrix[0].length : 0;

    // Update number of words
    this.wordCount = preset.words.length;

    // Deep copy matrices and words to avoid mutating presets
    this.parityCheckMatrix = preset.parityCheckMatrix.map((row) => [...row]);
    this.words = preset.words.map((word) => [...word]);

    this.errorMessage = null;
    this.validationResult = null;
  }

  // Handle changes in the modulus (field size)
  onModulusChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 2 || value > 10) {
      this.errorMessage = 'problem11.errors.modulusRange';
      return;
    }

    this.modulus = value;
    this.errorMessage = null;
    this.validationResult = null;
  }

  // Handle changes in the row count of the parity-check matrix
  onParityRowCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value <= 0 || value > 8) {
      this.errorMessage = 'problem11.errors.rowsRange';
      return;
    }

    this.parityRowCount = value;
    this.initializeParityCheckMatrix();
  }

  // Handle changes in the column count of the parity-check matrix
  onParityColumnCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value <= 1 || value > 12) {
      this.errorMessage = 'problem11.errors.colsRange';
      return;
    }

    this.parityColumnCount = value;
    this.initializeParityCheckMatrix();
    this.initializeWords();
  }

  // Handle changes in the number of words
  onWordCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value <= 0 || value > 12) {
      this.errorMessage = 'problem11.errors.wordCountRange';
      return;
    }

    this.wordCount = value;
    this.initializeWords();
  }

  // Handle user input in a parity-check matrix cell
  onParityCellChange(rowIndex: number, columnIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.parityCheckMatrix[rowIndex][columnIndex] = Number.isNaN(value) ? 0 : value;
  }

  // Handle user input in a word cell
  onWordCellChange(wordIndex: number, symbolIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    this.words[wordIndex][symbolIndex] = Number.isNaN(value) ? 0 : value;
  }

  // Run the validation: compute syndromes and classify words
  onValidate(): void {
    this.errorMessage = null;
    this.validationResult = null;

    try {
      this.validationResult = this.codingTheoryService.validateCodewords(
        this.parityCheckMatrix,
        this.words,
        this.modulus,
      );
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error ? error.message : 'errors.unexpectedComputation';
    }
  }

  // Determine whether the syndrome is zero, meaning the word is a codeword.
  isZeroSyndrome(syndrome: number[]): boolean {
    return syndrome.every((entry) => entry === 0);
  }
}
