import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../../pipes/translate';
import { CodeParametersResult, CodingTheory, Vector } from '../../../services/coding-theory';

interface CodePreset {
  id: string;
  labelKey: string;
  descriptionKey: string;
  modulus: number;
  words: Vector[];
}

@Component({
  selector: 'app-problem8-code-parameters',
  imports: [RouterModule, LucideAngularModule, TranslatePipe],
  templateUrl: './problem8-code-parameters.html',
  styleUrl: './problem8-code-parameters.scss',
})
export class Problem8CodeParameters {
  modulus = 2;

  wordCount = 4;
  wordLength = 3;

  words: Vector[] = [];

  presets: CodePreset[] = [
    {
      id: 'z2-linear-4words',
      labelKey: 'problem8.presets.z2-linear-4words.label',
      descriptionKey: 'problem8.presets.z2-linear-4words.description',
      modulus: 2,
      words: [
        [0, 0, 0],
        [1, 0, 1],
        [0, 1, 1],
        [1, 1, 0],
      ],
    },
    {
      id: 'z2-nonlinear',
      labelKey: 'problem8.presets.z2-nonlinear.label',
      descriptionKey: 'problem8.presets.z2-nonlinear.description',
      modulus: 2,
      words: [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
        [0, 1, 0],
      ],
    },
    {
      id: 'z3-small',
      labelKey: 'problem8.presets.z3-small.label',
      descriptionKey: 'problem8.presets.z3-small.description',
      modulus: 3,
      words: [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
    },
  ];

  errorMessage: string | null = null;
  result: CodeParametersResult | null = null;

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
      this.errorMessage = 'problem8.errors.modulusRange';
      return;
    }

    this.modulus = value;
    this.errorMessage = null;
    this.result = null;
  }

  onWordCountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 64) {
      this.errorMessage = 'problem8.errors.wordCountRange';
      return;
    }

    this.wordCount = value;
    this.initializeWords();
  }

  onWordLengthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 12) {
      this.errorMessage = 'problem8.errors.wordLengthRange';
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
      this.result = this.codingTheoryService.computeCodeParameters(this.words, this.modulus);
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error ? error.message : 'errors.unexpectedComputation';
    }
  }

  formatVector(vector: Vector): string {
    return `(${vector.join(', ')})`;
  }
}
