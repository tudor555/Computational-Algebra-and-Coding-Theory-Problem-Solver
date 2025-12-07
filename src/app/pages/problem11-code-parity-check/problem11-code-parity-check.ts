import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CodewordValidationResult,
  CodingTheory,
  Matrix,
  Vector,
} from '../../services/coding-theory';

interface ParityCheckPreset {
  id: string;
  label: string;
  description: string;
  modulus: number;
  parityCheckMatrix: Matrix;
  words: Vector[];
}

@Component({
  selector: 'app-problem11-code-parity-check',
  imports: [RouterModule],
  templateUrl: './problem11-code-parity-check.html',
  styleUrl: './problem11-code-parity-check.scss',
})
export class Problem11CodeParityCheck {
  presets: ParityCheckPreset[] = [
    {
      id: 'binary-single-parity',
      label: 'Cod binar cu sumă de paritate',
      description: 'Matrice de control 1×3, cod simplu cu sumă de paritate.',
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
      label: 'Cod Hamming (7, 4) binar',
      description: 'Matrice de control clasică pentru codul Hamming (7,4).',
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
      label: 'Cod ternar (q = 3)',
      description: 'Exemplu simplu peste ℤ₃ (modulo 3).',
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
      Array(this.parityColumnCount).fill(0)
    );
    this.validationResult = null;
    this.errorMessage = null;

    // Ensure words have correct length
    this.initializeWords();
  }

  // Initialize the list of words with zeros
  initializeWords(): void {
    this.words = Array.from({ length: this.wordCount }, () =>
      Array(this.parityColumnCount).fill(0)
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
      this.errorMessage = 'Modulul q trebuie să fie un întreg între 2 și 10.';
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
      this.errorMessage = 'Numărul de linii ale matricii de control trebuie să fie între 1 și 8.';
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
      this.errorMessage = 'Numărul de coloane trebuie să fie un întreg între 2 și 12.';
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
      this.errorMessage = 'Numărul de cuvinte trebuie să fie un întreg între 1 și 12.';
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
        this.modulus
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul calculului.';
      }
    }
  }

  // Determine whether the syndrome is zero, meaning the word is a codeword.
  isZeroSyndrome(syndrome: number[]): boolean {
    return syndrome.every((entry) => entry === 0);
  }
}
