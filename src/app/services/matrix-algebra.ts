import { Injectable } from '@angular/core';

export type Matrix = number[][];

export interface MatrixDecompositionResult {
  symmetric: Matrix;
  skewSymmetric: Matrix;
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
}
