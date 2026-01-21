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

export interface LinearCodeCheckResult {
  modulus: number;
  length: number;
  wordCount: number;

  hasValidModulus: boolean;
  hasConsistentLengths: boolean;

  containsZeroWord: boolean;
  isClosedUnderAddition: boolean;
  isClosedUnderScalarMultiplication: boolean;

  isLinear: boolean;

  // Helpful counterexamples for explanations
  firstAdditionCounterexample: { a: Vector; b: Vector; aPlusB: Vector } | null;
  firstScalarCounterexample: { scalar: number; word: Vector; product: Vector } | null;
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
    modulus: number,
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
          'All words must have the same length as the number of columns in the parity-check matrix.',
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

  // Add two vectors component-wise modulo modulus
  addVectors(a: Vector, b: Vector, modulus: number): Vector {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length.');
    }

    return a.map((value, index) => this.normalizeMod(value + b[index], modulus));
  }

  // Multiply a vector by a scalar modulo modulus
  scalarMultiplyVector(scalar: number, vector: Vector, modulus: number): Vector {
    const normalizedScalar = this.normalizeMod(scalar, modulus);
    return vector.map((entry) => this.normalizeMod(normalizedScalar * entry, modulus));
  }

  // Build the zero word of a given length
  buildZeroWord(length: number): Vector {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error('Length must be a positive integer.');
    }
    return new Array(length).fill(0);
  }

  // Compare vectors modulo modulus (tolerant to values outside range by normalizing)
  areVectorsEqualMod(a: Vector, b: Vector, modulus: number): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let index = 0; index < a.length; index++) {
      if (this.normalizeMod(a[index], modulus) !== this.normalizeMod(b[index], modulus)) {
        return false;
      }
    }
    return true;
  }

  // Check if a code contains a given word (mod modulus)
  containsWord(code: Vector[], word: Vector, modulus: number): boolean {
    return code.some((candidate) => this.areVectorsEqualMod(candidate, word, modulus));
  }

  // Check whether a list of words is a linear code over Z_modulus (educational version).
  // Conditions:
  // 1) contains zero word
  // 2) closed under addition
  // 3) closed under scalar multiplication
  //
  // Note: For modulus not prime, Z_modulus is not a field
  checkIfCodeIsLinear(words: Vector[], modulus: number): LinearCodeCheckResult {
    const hasValidModulus = Number.isInteger(modulus) && modulus >= 2;

    if (!hasValidModulus) {
      return {
        modulus,
        length: 0,
        wordCount: words.length,
        hasValidModulus: false,
        hasConsistentLengths: false,
        containsZeroWord: false,
        isClosedUnderAddition: false,
        isClosedUnderScalarMultiplication: false,
        isLinear: false,
        firstAdditionCounterexample: null,
        firstScalarCounterexample: null,
      };
    }

    if (words.length === 0) {
      // Empty set is not a linear code in typical conventions
      return {
        modulus,
        length: 0,
        wordCount: 0,
        hasValidModulus: true,
        hasConsistentLengths: true,
        containsZeroWord: false,
        isClosedUnderAddition: false,
        isClosedUnderScalarMultiplication: false,
        isLinear: false,
        firstAdditionCounterexample: null,
        firstScalarCounterexample: null,
      };
    }

    const length = words[0].length;
    const hasConsistentLengths = words.every((w) => w.length === length);

    if (!hasConsistentLengths || length === 0) {
      return {
        modulus,
        length,
        wordCount: words.length,
        hasValidModulus: true,
        hasConsistentLengths: false,
        containsZeroWord: false,
        isClosedUnderAddition: false,
        isClosedUnderScalarMultiplication: false,
        isLinear: false,
        firstAdditionCounterexample: null,
        firstScalarCounterexample: null,
      };
    }

    const normalizedWords = words.map((w) => w.map((x) => this.normalizeMod(x, modulus)));

    const zeroWord = this.buildZeroWord(length);
    const containsZeroWord = this.containsWord(normalizedWords, zeroWord, modulus);

    // Closure under addition
    let isClosedUnderAddition = true;
    let firstAdditionCounterexample: { a: Vector; b: Vector; aPlusB: Vector } | null = null;

    for (let i = 0; i < normalizedWords.length && isClosedUnderAddition; i++) {
      for (let j = 0; j < normalizedWords.length && isClosedUnderAddition; j++) {
        const a = normalizedWords[i];
        const b = normalizedWords[j];
        const sum = this.addVectors(a, b, modulus);

        if (!this.containsWord(normalizedWords, sum, modulus)) {
          isClosedUnderAddition = false;
          firstAdditionCounterexample = { a, b, aPlusB: sum };
        }
      }
    }

    // Closure under scalar multiplication (test all non-zero scalars 1..modulus-1)
    let isClosedUnderScalarMultiplication = true;
    let firstScalarCounterexample: { scalar: number; word: Vector; product: Vector } | null = null;

    for (let scalar = 0; scalar < modulus && isClosedUnderScalarMultiplication; scalar++) {
      for (const word of normalizedWords) {
        const product = this.scalarMultiplyVector(scalar, word, modulus);

        if (!this.containsWord(normalizedWords, product, modulus)) {
          isClosedUnderScalarMultiplication = false;
          firstScalarCounterexample = { scalar, word, product };
          break;
        }
      }
    }

    const isLinear = containsZeroWord && isClosedUnderAddition && isClosedUnderScalarMultiplication;

    return {
      modulus,
      length,
      wordCount: normalizedWords.length,
      hasValidModulus: true,
      hasConsistentLengths: true,
      containsZeroWord,
      isClosedUnderAddition,
      isClosedUnderScalarMultiplication,
      isLinear,
      firstAdditionCounterexample,
      firstScalarCounterexample,
    };
  }
}
