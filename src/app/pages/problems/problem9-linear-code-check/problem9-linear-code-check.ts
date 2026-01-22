import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CodingTheory, LinearCodeCheckResult, Vector } from '../../../services/coding-theory';

interface CodePreset {
  id: string;
  label: string;
  description: string;
  modulus: number;
  words: Vector[];
}

@Component({
  selector: 'app-problem9-linear-code-check',
  imports: [RouterModule],
  templateUrl: './problem9-linear-code-check.html',
  styleUrl: './problem9-linear-code-check.scss',
})
export class Problem9LinearCodeCheck {
  modulus = 2;

  wordCount = 4;
  wordLength = 3;

  words: Vector[] = [];

  presets: CodePreset[] = [
    {
      id: 'linear-z2',
      label: 'Cod liniar (Z₂)',
      description: 'Exemplu clasic: subspațiu în (Z₂)^3.',
      modulus: 2,
      words: [
        [0, 0, 0],
        [1, 0, 1],
        [0, 1, 1],
        [1, 1, 0],
      ],
    },
    {
      id: 'not-linear-missing-zero',
      label: 'Nu e liniar (lipsește 0)',
      description: 'Nu conține cuvântul zero.',
      modulus: 2,
      words: [
        [1, 0, 1],
        [0, 1, 1],
        [1, 1, 0],
      ],
    },
    {
      id: 'not-linear-not-closed',
      label: 'Nu e liniar (nu e închis la +)',
      description: 'Conține 0, dar nu este închis la adunare.',
      modulus: 2,
      words: [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
      ],
    },
    {
      id: 'linear-z3',
      label: 'Cod liniar (Z₃)',
      description: 'Exemplu mic în (Z₃)^2.',
      modulus: 3,
      words: [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
    },
  ];

  errorMessage: string | null = null;
  result: LinearCodeCheckResult | null = null;

  constructor(private codingTheoryService: CodingTheory) {
    this.initializeWords();
  }

  initializeWords(): void {
    this.words = Array.from({ length: this.wordCount }, () => Array(this.wordLength).fill(0));
    this.errorMessage = null;
    this.result = null;
  }

  onApplyPreset(preset: CodePreset): void {
    this.modulus = preset.modulus;
    this.wordCount = preset.words.length;
    this.wordLength = preset.words[0]?.length ?? 0;
    this.words = preset.words.map((w) => [...w]);

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

  onWordCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 32) {
      this.errorMessage = 'Numărul de cuvinte trebuie să fie un întreg între 1 și 32.';
      return;
    }

    this.wordCount = value;
    this.initializeWords();
  }

  onWordLengthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 12) {
      this.errorMessage = 'Lungimea cuvintelor trebuie să fie un întreg între 1 și 12.';
      return;
    }

    this.wordLength = value;
    this.initializeWords();
  }

  onCellChange(wordIndex: number, positionIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.words[wordIndex][positionIndex] = Number.isNaN(value) ? 0 : value;
  }

  onCompute(): void {
    this.errorMessage = null;
    this.result = null;

    try {
      this.result = this.codingTheoryService.checkIfCodeIsLinear(this.words, this.modulus);

      if (!this.result.hasValidModulus) {
        this.errorMessage = 'Modulus trebuie să fie cel puțin 2.';
        return;
      }

      if (!this.result.hasConsistentLengths) {
        this.errorMessage = 'Toate cuvintele trebuie să aibă aceeași lungime.';
        return;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'A apărut o eroare neașteptată în timpul verificării.';
      }
    }
  }

  formatVector(vector: Vector): string {
    return `(${vector.join(', ')})`;
  }
}
