import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';
import { CodingTheory, LinearCodeCheckResult, Vector } from '../../../services/coding-theory';

interface CodePreset {
  id: string;
  labelKey: string;
  descriptionKey: string;
  modulus: number;
  words: Vector[];
}

@Component({
  selector: 'app-problem9-linear-code-check',
  imports: [RouterModule, LucideAngularModule, TranslatePipe],
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
      labelKey: 'problem9.presets.linear-z2.label',
      descriptionKey: 'problem9.presets.linear-z2.description',
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
      labelKey: 'problem9.presets.not-linear-missing-zero.label',
      descriptionKey: 'problem9.presets.not-linear-missing-zero.description',
      modulus: 2,
      words: [
        [1, 0, 1],
        [0, 1, 1],
        [1, 1, 0],
      ],
    },
    {
      id: 'not-linear-not-closed',
      labelKey: 'problem9.presets.not-linear-not-closed.label',
      descriptionKey: 'problem9.presets.not-linear-not-closed.description',
      modulus: 2,
      words: [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
      ],
    },
    {
      id: 'linear-z3',
      labelKey: 'problem9.presets.linear-z3.label',
      descriptionKey: 'problem9.presets.linear-z3.description',
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
      this.errorMessage = 'problem9.errors.modulusRange';
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
      this.errorMessage = 'problem9.errors.wordCountRange';
      return;
    }

    this.wordCount = value;
    this.initializeWords();
  }

  onWordLengthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 12) {
      this.errorMessage = 'problem9.errors.wordLengthRange';
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
        this.errorMessage = 'problem9.errors.modulusMin';
        return;
      }

      if (!this.result.hasConsistentLengths) {
        this.errorMessage = 'problem9.errors.inconsistentLengths';
        return;
      }
    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error ? error.message : 'problem9.errors.unexpectedCheck';
    }
  }

  formatVector(vector: Vector): string {
    return `(${vector.join(', ')})`;
  }
}
