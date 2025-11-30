import { Injectable } from '@angular/core';

export type Matrix = number[][];

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
  
  // Compute the row echelon form of a matrix using Gaussian elimination.
  // Returns the row echelon form and the rank.
  //
  // NOTE: This does not modify the original matrix; it works on a cloned copy.
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

  // Compute the rank of a matrix using Gaussian elimination.
  computeRank(matrix: Matrix): number {
    const { rank } = this.toRowEchelonForm(matrix);
    return rank;
  }

  // Compute the inverse of a square matrix using Gauss–Jordan elimination.
  // If the matrix is not square or not invertible, returns null.
  //
  // The algorithm works on the augmented matrix [A | I] and reduces it to [I | A^{-1}].
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
}
