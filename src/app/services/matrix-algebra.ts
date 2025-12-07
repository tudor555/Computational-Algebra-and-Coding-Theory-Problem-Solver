import { Injectable } from '@angular/core';

export type Matrix = number[][];
export type TriangularType = 'none' | 'upper' | 'lower' | 'both';

export interface MatrixDecompositionResult {
  symmetric: Matrix;
  skewSymmetric: Matrix;
}

export interface RankAndInverseResult {
  rowEchelonForm: Matrix;
  rank: number;
  isSquare: boolean;
  hasInverse: boolean;
  inverse: Matrix | null;
}

export interface CharacteristicPolynomialResult {
  size: 2 | 3;
  coefficients: number[]; // [a_n, a_{n-1}, ..., a_0] for p(λ) = a_n λ^n + ... + a_0
  formattedPolynomial: string;
  eigenvalues: number[]; // only real eigenvalues
  hasRealEigenvalues: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MatrixAlgebra {
  // Decompose a square matrix A into a symmetric part S and a skew-symmetric part K:
  // S = (A + A^T) / 2
  // K = (A - A^T) / 2
  decomposeIntoSymmetricAndSkew(A: Matrix): MatrixDecompositionResult {
    if (!this.isSquare(A)) {
      throw new Error('Matrix must be square for this decomposition.');
    }

    const AT = this.transpose(A);
    const symmetric = this.multiplyByScalar(this.add(A, AT), 0.5);
    const skewSymmetric = this.multiplyByScalar(this.subtract(A, AT), 0.5);

    return { symmetric, skewSymmetric };
  }

  // Compute the row echelon form of a matrix using Gaussian elimination
  // Returns the row echelon form and the rank
  //
  // NOTE: This does not modify the original matrix; it works on a cloned copy
  toRowEchelonForm(matrix: Matrix): { rowEchelonForm: Matrix; rank: number } {
    const rowCount = this.getRowCount(matrix);
    const columnCount = this.getColumnCount(matrix);

    const workingMatrix = this.cloneMatrix(matrix);
    let pivotRow = 0;
    let pivotColumn = 0;

    while (pivotRow < rowCount && pivotColumn < columnCount) {
      // Find a row with a non-zero entry in the current pivot column
      let pivotRowCandidate = pivotRow;
      while (pivotRowCandidate < rowCount && workingMatrix[pivotRowCandidate][pivotColumn] === 0) {
        pivotRowCandidate++;
      }

      if (pivotRowCandidate === rowCount) {
        // No pivot in this column; move to the next column
        pivotColumn++;
        continue;
      }

      // Swap the current row with the row containing the pivot
      if (pivotRowCandidate !== pivotRow) {
        this.swapRows(workingMatrix, pivotRow, pivotRowCandidate);
      }

      const pivotValue = workingMatrix[pivotRow][pivotColumn];

      if (pivotValue !== 0) {
        // Normalize the pivot row
        this.multiplyRow(workingMatrix, pivotRow, 1 / pivotValue);

        // Eliminate entries below the pivot
        for (let row = pivotRow + 1; row < rowCount; row++) {
          const factor = -workingMatrix[row][pivotColumn];
          if (factor !== 0) {
            this.addMultipleOfRow(workingMatrix, row, pivotRow, factor);
          }
        }

        pivotRow++;
      }

      pivotColumn++;
    }

    // Rank is the number of non-zero rows in the row echelon form
    let rank = 0;
    for (let row = 0; row < rowCount; row++) {
      const isNonZeroRow = workingMatrix[row].some((value) => value !== 0);
      if (isNonZeroRow) {
        rank++;
      }
    }

    return {
      rowEchelonForm: workingMatrix,
      rank,
    };
  }

  // Compute the rank of a matrix using Gaussian elimination
  computeRank(matrix: Matrix): number {
    const { rank } = this.toRowEchelonForm(matrix);
    return rank;
  }

  // Compute the inverse of a square matrix using Gauss–Jordan elimination
  // If the matrix is not square or not invertible, returns null
  //
  // The algorithm works on the augmented matrix [A | I] and reduces it to [I | A^{-1}]
  computeInverseGauss(matrix: Matrix): Matrix | null {
    if (!this.isSquare(matrix)) {
      return null;
    }

    const size = this.getRowCount(matrix);

    // Build augmented matrix [A | I]
    const augmented: number[][] = [];
    for (let row = 0; row < size; row++) {
      const leftPart = [...matrix[row]];
      const rightPart = Array.from({ length: size }, (_, col) => (col === row ? 1 : 0));
      augmented.push([...leftPart, ...rightPart]);
    }

    const totalColumns = 2 * size;

    // Gauss–Jordan elimination to transform [A | I] into [I | A^{-1}]
    for (let pivotIndex = 0; pivotIndex < size; pivotIndex++) {
      // Find pivot (non-zero) in current column
      let pivotRow = pivotIndex;
      while (pivotRow < size && augmented[pivotRow][pivotIndex] === 0) {
        pivotRow++;
      }

      if (pivotRow === size) {
        // No pivot found -> matrix is singular
        return null;
      }

      // Swap rows if needed
      if (pivotRow !== pivotIndex) {
        const temp = augmented[pivotIndex];
        augmented[pivotIndex] = augmented[pivotRow];
        augmented[pivotRow] = temp;
      }

      // Normalize pivot row to make the pivot equal to 1
      const pivotValue = augmented[pivotIndex][pivotIndex];
      if (pivotValue === 0) {
        return null;
      }

      for (let column = 0; column < totalColumns; column++) {
        augmented[pivotIndex][column] /= pivotValue;
      }

      // Eliminate all other entries in pivot column
      for (let row = 0; row < size; row++) {
        if (row === pivotIndex) {
          continue;
        }
        const factor = augmented[row][pivotIndex];
        if (factor !== 0) {
          for (let column = 0; column < totalColumns; column++) {
            augmented[row][column] -= factor * augmented[pivotIndex][column];
          }
        }
      }
    }

    // Extract the right half as the inverse matrix
    const inverse: Matrix = [];
    for (let row = 0; row < size; row++) {
      const inverseRow = augmented[row].slice(size, totalColumns);
      inverse.push(inverseRow);
    }

    return inverse;
  }

  // Compute both the rank and, if applicable, the inverse of a matrix.
  computeRankAndInverse(matrix: Matrix): RankAndInverseResult {
    const { rowEchelonForm, rank } = this.toRowEchelonForm(matrix);
    const isSquare = this.isSquare(matrix);

    let hasInverse = false;
    let inverse: Matrix | null = null;

    if (isSquare) {
      inverse = this.computeInverseGauss(matrix);
      hasInverse = inverse !== null;
    }

    return {
      rowEchelonForm,
      rank,
      isSquare,
      hasInverse,
      inverse,
    };
  }

  // Compute the characteristic polynomial and real eigenvalues of a 2×2 or 3×3 matrix.
  computeCharacteristicPolynomialAndEigenvalues(matrix: Matrix): CharacteristicPolynomialResult {
    if (!this.isSquare(matrix)) {
      throw new Error('Matrix must be square (2×2 or 3×3).');
    }

    const size = matrix.length;

    if (size === 2) {
      return this.computeCharacteristicPolynomial2x2(matrix);
    }

    if (size === 3) {
      return this.computeCharacteristicPolynomial3x3(matrix);
    }

    throw new Error('This method only supports matrices of size 2×2 or 3×3.');
  }

  // Classify a matrix as upper / lower / both (diagonal) / none
  classifyTriangular(matrix: Matrix, tolerance = 1e-10): TriangularType {
    const isUpper = this.isUpperTriangular(matrix, tolerance);
    const isLower = this.isLowerTriangular(matrix, tolerance);

    if (isUpper && isLower) {
      return 'both'; // essentially diagonal
    }

    if (isUpper) {
      return 'upper';
    }

    if (isLower) {
      return 'lower';
    }

    return 'none';
  }

  // Get the number of rows in a matrix
  getRowCount(matrix: Matrix): number {
    return matrix.length;
  }

  // Get the number of columns in a matrix
  getColumnCount(matrix: Matrix): number {
    return matrix.length > 0 ? matrix[0].length : 0;
  }

  // Create a deep copy of a matrix
  cloneMatrix(matrix: Matrix): Matrix {
    return matrix.map((row) => [...row]);
  }

  // Check if a matrix is square
  isSquare(A: Matrix): boolean {
    if (A.length === 0) {
      return false;
    }
    const cols = A[0].length;
    return A.every((row) => row.length === cols) && A.length === cols;
  }

  // Transpose of a matrix
  transpose(A: Matrix): Matrix {
    const rows = A.length;
    const cols = rows > 0 ? A[0].length : 0;
    const result: Matrix = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = A[i][j];
      }
    }

    return result;
  }

  // Add two matrices of the same size
  add(A: Matrix, B: Matrix): Matrix {
    this.ensureSameSize(A, B);

    return A.map((row, i) => row.map((value, j) => value + B[i][j]));
  }

  // Subtract two matrices of the same size
  subtract(A: Matrix, B: Matrix): Matrix {
    this.ensureSameSize(A, B);

    return A.map((row, i) => row.map((value, j) => value - B[i][j]));
  }

  // Multiply a matrix by a scalar
  multiplyByScalar(A: Matrix, scalar: number): Matrix {
    return A.map((row) => row.map((value) => value * scalar));
  }

  // Multiply two matrices A (m × n) and B (n × p)
  multiplyMatrices(matrixA: Matrix, matrixB: Matrix): Matrix {
    const rowCountA = matrixA.length;
    const columnCountA = rowCountA > 0 ? matrixA[0].length : 0;

    const rowCountB = matrixB.length;
    const columnCountB = rowCountB > 0 ? matrixB[0].length : 0;

    if (columnCountA === 0 || rowCountB === 0 || columnCountA !== rowCountB) {
      throw new Error('Matrix dimensions are not compatible for multiplication.');
    }

    const result: Matrix = Array.from({ length: rowCountA }, () => Array(columnCountB).fill(0));

    for (let row = 0; row < rowCountA; row++) {
      for (let column = 0; column < columnCountB; column++) {
        let sum = 0;
        for (let k = 0; k < columnCountA; k++) {
          sum += matrixA[row][k] * matrixB[k][column];
        }
        result[row][column] = sum;
      }
    }

    return result;
  }

  // Check if a matrix is upper triangular (values below the main diagonal are zero)
  isUpperTriangular(matrix: Matrix, tolerance = 1e-10): boolean {
    const rowCount = matrix.length;
    if (rowCount === 0) {
      return false;
    }

    const columnCount = matrix[0].length;
    if (rowCount !== columnCount) {
      return false;
    }

    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < row; column++) {
        if (Math.abs(matrix[row][column]) > tolerance) {
          return false;
        }
      }
    }

    return true;
  }

  // Check if a matrix is lower triangular (values above the main diagonal are zero)
  isLowerTriangular(matrix: Matrix, tolerance = 1e-10): boolean {
    const rowCount = matrix.length;
    if (rowCount === 0) {
      return false;
    }

    const columnCount = matrix[0].length;
    if (rowCount !== columnCount) {
      return false;
    }

    for (let row = 0; row < rowCount; row++) {
      for (let column = row + 1; column < columnCount; column++) {
        if (Math.abs(matrix[row][column]) > tolerance) {
          return false;
        }
      }
    }

    return true;
  }

  // Ensure that two matrices have the same dimensions
  private ensureSameSize(A: Matrix, B: Matrix): void {
    if (A.length !== B.length) {
      throw new Error('Matrices must have the same number of rows.');
    }

    for (let i = 0; i < A.length; i++) {
      if (A[i].length !== B[i].length) {
        throw new Error('Matrices must have the same number of columns in each row.');
      }
    }
  }

  // Swap two rows in a matrix (in-place)
  private swapRows(matrix: Matrix, rowIndexA: number, rowIndexB: number): void {
    const temp = matrix[rowIndexA];
    matrix[rowIndexA] = matrix[rowIndexB];
    matrix[rowIndexB] = temp;
  }

  // Multiply a row by a non-zero scalar (in-place)
  private multiplyRow(matrix: Matrix, rowIndex: number, scalar: number): void {
    matrix[rowIndex] = matrix[rowIndex].map((value) => value * scalar);
  }

  // Add a multiple of one row to another (in-place):
  // targetRow = targetRow + factor * sourceRow
  private addMultipleOfRow(
    matrix: Matrix,
    targetRowIndex: number,
    sourceRowIndex: number,
    factor: number
  ): void {
    const targetRow = matrix[targetRowIndex];
    const sourceRow = matrix[sourceRowIndex];

    matrix[targetRowIndex] = targetRow.map(
      (value, columnIndex) => value + factor * sourceRow[columnIndex]
    );
  }

  // Format a polynomial as a readable string (e.g., λ³ - 2λ² + λ - 5)
  private formatPolynomial(coefficients: number[]): string {
    // coefficients: [a_n, ..., a_0]
    const degree = coefficients.length - 1;
    const terms: string[] = [];

    for (let index = 0; index < coefficients.length; index++) {
      const coefficient = coefficients[index];
      const power = degree - index;

      if (Math.abs(coefficient) < 1e-12) {
        continue;
      }

      const isFirstTerm = terms.length === 0;
      const sign = coefficient < 0 ? ' - ' : isFirstTerm ? '' : ' + ';
      const absoluteValue = Math.abs(coefficient);

      let term = '';

      // Coefficient part
      if (power === 0 || absoluteValue !== 1) {
        term += absoluteValue.toFixed(2).replace(/\.00$/, '');
      }

      // Variable part
      if (power >= 1) {
        term += term ? '·' : ''; // if we already added a coefficient, add a dot
        term += 'λ';
        if (power > 1) {
          term += power === 2 ? '²' : `^${power}`;
        }
      }

      terms.push((isFirstTerm ? (coefficient < 0 ? '-' : '') : sign) + term);
    }

    if (terms.length === 0) {
      return '0';
    }

    return terms.join('');
  }

  // Compute characteristic polynomial and eigenvalues for a 2×2 matrix
  private computeCharacteristicPolynomial2x2(matrix: Matrix): CharacteristicPolynomialResult {
    if (matrix.length !== 2 || matrix[0].length !== 2) {
      throw new Error('Matrix must be 2×2 for this computation.');
    }

    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];

    const trace = a + d;
    const determinant = a * d - b * c;

    // p(λ) = λ² - tr(A) λ + det(A)
    const coefficients = [1, -trace, determinant];
    const formattedPolynomial = this.formatPolynomial(coefficients);

    // Quadratic formula: λ = (tr ± sqrt(tr² - 4 det)) / 2
    const discriminant = trace * trace - 4 * determinant;

    const eigenvalues: number[] = [];
    let hasRealEigenvalues = true;

    if (discriminant < 0) {
      hasRealEigenvalues = false;
    } else {
      const sqrtDiscriminant = Math.sqrt(discriminant);
      const lambda1 = (trace + sqrtDiscriminant) / 2;
      const lambda2 = (trace - sqrtDiscriminant) / 2;
      eigenvalues.push(lambda1, lambda2);
    }

    return {
      size: 2,
      coefficients,
      formattedPolynomial,
      eigenvalues,
      hasRealEigenvalues,
    };
  }

  // Compute determinant of a 3×3 matrix
  private determinant3x3(matrix: Matrix): number {
    if (matrix.length !== 3 || matrix[0].length !== 3) {
      throw new Error('Matrix must be 3×3 to compute determinant3x3.');
    }

    const m = matrix;
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  }

  // Compute trace of a matrix
  private trace(matrix: Matrix): number {
    let sum = 0;
    const size = matrix.length;
    for (let index = 0; index < size; index++) {
      sum += matrix[index][index];
    }
    return sum;
  }

  // Compute trace of A²
  private traceOfSquare(matrix: Matrix): number {
    // Compute A^2 and then trace(A^2)
    const size = matrix.length;
    const result: Matrix = Array.from({ length: size }, () => Array(size).fill(0));

    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += matrix[row][k] * matrix[k][column];
        }
        result[row][column] = sum;
      }
    }

    return this.trace(result);
  }

  // Compute characteristic polynomial and eigenvalues for a 3×3 matrix
  private computeCharacteristicPolynomial3x3(matrix: Matrix): CharacteristicPolynomialResult {
    if (matrix.length !== 3 || matrix[0].length !== 3) {
      throw new Error('Matrix must be 3×3 for this computation.');
    }

    const traceA = this.trace(matrix);
    const traceA2 = this.traceOfSquare(matrix);
    const determinantA = this.determinant3x3(matrix);

    // p(λ) = λ³ - tr(A) λ² + 1/2 (tr(A)² - tr(A²)) λ - det(A)
    const coefficientLambda3 = 1;
    const coefficientLambda2 = -traceA;
    const coefficientLambda1 = 0.5 * (traceA * traceA - traceA2);
    const coefficientLambda0 = -determinantA;

    const coefficients = [
      coefficientLambda3,
      coefficientLambda2,
      coefficientLambda1,
      coefficientLambda0,
    ];

    const formattedPolynomial = this.formatPolynomial(coefficients);

    const eigenvalues = this.findRealRootsOfCubic(coefficients);
    const hasRealEigenvalues = eigenvalues.length > 0;

    return {
      size: 3,
      coefficients,
      formattedPolynomial,
      eigenvalues,
      hasRealEigenvalues,
    };
  }

  // Evaluate a cubic polynomial p(x) = a x³ + b x² + c x + d
  private evaluateCubic(coefficients: number[], x: number): number {
    const [a, b, c, d] = coefficients;
    return ((a * x + b) * x + c) * x + d;
  }

  // Find real roots of a cubic polynomial a x³ + b x² + c x + d using a simple numeric approach (scanning + bisection)
  // This method is not meant to be a high-performance solver, but it is sufficient for educational purposes and small matrices
  private findRealRootsOfCubic(coefficients: number[]): number[] {
    const [a, b, c, d] = coefficients;
    if (Math.abs(a) < 1e-12) {
      // Not truly cubic; in practice this should not happen for 3×3 char polynomials.
      return [];
    }

    const radius = 1 + Math.max(Math.abs(b / a), Math.abs(c / a), Math.abs(d / a));

    const start = -radius;
    const end = radius;
    const steps = 200;
    const stepSize = (end - start) / steps;

    const roots: number[] = [];
    const tolerance = 1e-6;

    let previousX = start;
    let previousValue = this.evaluateCubic(coefficients, previousX);

    for (let index = 1; index <= steps; index++) {
      const currentX = start + index * stepSize;
      const currentValue = this.evaluateCubic(coefficients, currentX);

      if (Math.abs(currentValue) < tolerance) {
        // Close enough to zero: treat as root
        roots.push(currentX);
      }

      if (previousValue * currentValue < 0) {
        // Sign change -> root in (previousX, currentX)
        let left = previousX;
        let right = currentX;
        let mid = 0;

        for (let iteration = 0; iteration < 40; iteration++) {
          mid = 0.5 * (left + right);
          const midValue = this.evaluateCubic(coefficients, mid);

          if (Math.abs(midValue) < tolerance) {
            break;
          }

          if (previousValue * midValue < 0) {
            right = mid;
            currentValue; // just to respect structure; will be overwritten next
          } else {
            left = mid;
            previousValue = midValue;
          }
        }

        roots.push(mid);
      }

      previousX = currentX;
      previousValue = currentValue;
    }

    // Merge very close roots (due to numeric noise)
    const uniqueRoots: number[] = [];
    for (const root of roots) {
      if (!uniqueRoots.some((existing) => Math.abs(existing - root) < 1e-4)) {
        uniqueRoots.push(root);
      }
    }

    return uniqueRoots.sort((x, y) => x - y);
  }
}
