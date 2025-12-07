import { Injectable } from '@angular/core';

export type Vector = number[];
export type Matrix = number[][];

export interface CodewordValidationResult {
  modulus: number;
  parityCheckMatrix: Matrix;
  words: Vector[];
  validWords: Vector[];
  invalidWords: Vector[];
  syndromes: Vector[];
}

@Injectable({
  providedIn: 'root',
})
export class CodingTheory {
  // Normalize a number modulo `modulus` into [0, modulus - 1]
  normalizeMod(value: number, modulus: number): number {
    if (modulus <= 0) {
      throw new Error('Modulus must be a positive integer.');
    }
    const remainder = value % modulus;
    return remainder < 0 ? remainder + modulus : remainder;
  }

  // Check whether a vector is the zero vector modulo `modulus`
  isZeroVector(vector: Vector, modulus: number): boolean {
    return vector.every((entry) => this.normalizeMod(entry, modulus) === 0);
  }

  // Multiply a parity-check matrix H (rows x cols) with a column vector v^T,
  // in (Z_modulus), i.e. over the finite ring Z_modulus
  //
  // syndrome = H * v^T (mod modulus)
  computeSyndrome(parityCheckMatrix: Matrix, word: Vector, modulus: number): Vector {
    const rowCount = parityCheckMatrix.length;
    const columnCount = rowCount > 0 ? parityCheckMatrix[0].length : 0;

    if (word.length !== columnCount) {
      throw new Error('Word length must match the number of columns of the parity-check matrix.');
    }

    const syndrome: Vector = new Array(rowCount).fill(0);

    for (let row = 0; row < rowCount; row++) {
      let sum = 0;
      for (let column = 0; column < columnCount; column++) {
        const hEntry = this.normalizeMod(parityCheckMatrix[row][column], modulus);
        const wordEntry = this.normalizeMod(word[column], modulus);
        sum += hEntry * wordEntry;
      }
      syndrome[row] = this.normalizeMod(sum, modulus);
    }

    return syndrome;
  }

  // Given a parity-check matrix and a list of words, classify them into
  // codewords (syndrome = 0) and non-codewords
  validateCodewords(
    parityCheckMatrix: Matrix,
    words: Vector[],
    modulus: number
  ): CodewordValidationResult {
    if (modulus <= 1) {
      throw new Error('Modulus must be at least 2.');
    }

    const rowCount = parityCheckMatrix.length;
    const columnCount = rowCount > 0 ? parityCheckMatrix[0].length : 0;

    if (columnCount === 0) {
      throw new Error('Parity-check matrix must have at least one column.');
    }

    const syndromes: Vector[] = [];
    const validWords: Vector[] = [];
    const invalidWords: Vector[] = [];

    for (const word of words) {
      if (word.length !== columnCount) {
        throw new Error(
          'All words must have the same length as the number of columns in the parity-check matrix.'
        );
      }

      const syndrome = this.computeSyndrome(parityCheckMatrix, word, modulus);
      syndromes.push(syndrome);

      if (this.isZeroVector(syndrome, modulus)) {
        validWords.push(word);
      } else {
        invalidWords.push(word);
      }
    }

    return {
      modulus,
      parityCheckMatrix,
      words,
      validWords,
      invalidWords,
      syndromes,
    };
  }
}
