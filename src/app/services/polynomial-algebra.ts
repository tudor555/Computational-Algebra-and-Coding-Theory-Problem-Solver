import { Injectable } from '@angular/core';

type BigIntMatrix = bigint[][];
type BigIntPolynomial = bigint[]; // highest degree -> constant term

export type GaloisGroupName =
  | 'Trivial'
  | 'C2'
  | 'C3 (A3)'
  | 'S3'
  | 'V4'
  | 'C4'
  | 'D4'
  | 'A4'
  | 'S4'
  | 'Unknown';

export interface GaloisComputationResult {
  degree: 3 | 4;
  coefficients: bigint[]; // [a_n, ..., a_0]

  isZeroLeadingCoefficient: boolean;
  isMonic: boolean;

  hasRationalRoot: boolean;
  rationalRoots: { numerator: bigint; denominator: bigint }[];

  discriminant: bigint | null;
  discriminantIsPerfectSquare: boolean | null;

  // quartic only
  resolventCubic?: bigint[]; // integer polynomial after clearing denominators
  resolventHasRationalRoot?: boolean;
  resolventRationalRoots?: { numerator: bigint; denominator: bigint }[];

  group: GaloisGroupName;
  explanation: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PolynomialAlgebra {
  // Public entry point
  computeGaloisGroupForDegree3or4(coefficients: number[]): GaloisComputationResult {
    const big = coefficients.map((x) => BigInt(Math.trunc(x)));

    const degree = (big.length - 1) as 3 | 4;
    if (degree !== 3 && degree !== 4) {
      throw new Error('Polynomial must be degree 3 or 4 (provide 4 or 5 coefficients).');
    }

    const leading = big[0];
    const isZeroLeadingCoefficient = leading === 0n;

    if (isZeroLeadingCoefficient) {
      return {
        degree,
        coefficients: big,
        isZeroLeadingCoefficient: true,
        isMonic: false,
        hasRationalRoot: false,
        rationalRoots: [],
        discriminant: null,
        discriminantIsPerfectSquare: null,
        group: 'Unknown',
        explanation: [
          'Leading coefficient is 0, so the polynomial is not of the requested degree.',
        ],
      };
    }

    const isMonic = leading === 1n;

    // Rational roots (works for 3/4 and helps reducibility detection)
    const rationalRoots = this.findRationalRoots(big);
    const hasRationalRoot = rationalRoots.length > 0;

    const discriminant = this.computeDiscriminantViaResultant(big);
    const discriminantIsSquare =
      discriminant === null ? null : this.isPerfectSquareBigInt(this.abs(discriminant));

    const explanation: string[] = [];

    if (degree === 3) {
      // Cubic classification
      if (hasRationalRoot) {
        explanation.push('The polynomial has a rational root, so it is reducible over Q.');

        // For UI simplicity: if it factors as linear * quadratic:
        // Galois group over Q is C2 if the quadratic is irreducible; else trivial
        // We do a basic “does it have 3 rational roots?” check.
        if (rationalRoots.length >= 3) {
          explanation.push(
            'It splits completely into linear factors over Q -> splitting field is Q -> trivial group.',
          );
          return {
            degree,
            coefficients: big,
            isZeroLeadingCoefficient: false,
            isMonic,
            hasRationalRoot: true,
            rationalRoots,
            discriminant,
            discriminantIsPerfectSquare: discriminantIsSquare,
            group: 'Trivial',
            explanation,
          };
        }

        explanation.push(
          'Typical case: linear factor times an irreducible quadratic -> splitting field adds one quadratic root -> group C2.',
        );
        return {
          degree,
          coefficients: big,
          isZeroLeadingCoefficient: false,
          isMonic,
          hasRationalRoot: true,
          rationalRoots,
          discriminant,
          discriminantIsPerfectSquare: discriminantIsSquare,
          group: 'C2',
          explanation,
        };
      }

      explanation.push('No rational root -> cubic is irreducible over Q (rational root theorem).');
      if (discriminantIsSquare === true) {
        explanation.push('Discriminant is a square in Z -> Galois group is A3 ≅ C3.');
        return this.finish(
          degree,
          big,
          isMonic,
          hasRationalRoot,
          rationalRoots,
          discriminant,
          discriminantIsSquare,
          'C3 (A3)',
          explanation,
        );
      } else {
        explanation.push('Discriminant is not a square -> Galois group is S3.');
        return this.finish(
          degree,
          big,
          isMonic,
          hasRationalRoot,
          rationalRoots,
          discriminant,
          discriminantIsSquare,
          'S3',
          explanation,
        );
      }
    }

    // Quartic classification
    // Reducible cases:
    if (hasRationalRoot) {
      explanation.push('The quartic has a rational root -> reducible over Q.');
      // We keep the statement educational: reducible quartics vary; we give a safe output.
      explanation.push(
        'Reducible quartic: Galois group depends on factorization (linear/quadratic factors). This implementation focuses on irreducible quartics for S4/A4/D4/V4/C4 classification.',
      );
      return {
        degree,
        coefficients: big,
        isZeroLeadingCoefficient: false,
        isMonic,
        hasRationalRoot: true,
        rationalRoots,
        discriminant,
        discriminantIsPerfectSquare: discriminantIsSquare,
        group: 'Unknown',
        explanation,
      };
    }

    explanation.push(
      'No rational root found. We proceed with the standard irreducible-quartic classification approach (discriminant + resolvent cubic).',
    );

    const resolvent = this.buildQuarticResolventCubicInteger(big);
    const resolventRoots = this.findRationalRoots(resolvent);
    const resolventHasRoot = resolventRoots.length > 0;

    explanation.push(
      `Resolvent cubic has ${resolventRoots.length} rational root(s) (counting distinct roots found by rational-root test).`,
    );

    // Decision tree (common undergrad version):
    // If resolvent irreducible:
    //   Δ square -> A4 else S4
    // If resolvent has a rational root:
    //   Δ not square -> D4
    //   Δ square -> V4 or C4 (we distinguish heuristically via whether resolvent splits fully)
    if (!resolventHasRoot) {
      if (discriminantIsSquare === true) {
        explanation.push('Resolvent cubic irreducible and discriminant square -> Galois group A4.');
        return {
          degree,
          coefficients: big,
          isZeroLeadingCoefficient: false,
          isMonic,
          hasRationalRoot: false,
          rationalRoots: [],
          discriminant,
          discriminantIsPerfectSquare: discriminantIsSquare,
          resolventCubic: resolvent,
          resolventHasRationalRoot: false,
          resolventRationalRoots: [],
          group: 'A4',
          explanation,
        };
      } else {
        explanation.push(
          'Resolvent cubic irreducible and discriminant not a square -> Galois group S4.',
        );
        return {
          degree,
          coefficients: big,
          isZeroLeadingCoefficient: false,
          isMonic,
          hasRationalRoot: false,
          rationalRoots: [],
          discriminant,
          discriminantIsPerfectSquare: discriminantIsSquare,
          resolventCubic: resolvent,
          resolventHasRationalRoot: false,
          resolventRationalRoots: [],
          group: 'S4',
          explanation,
        };
      }
    }

    // resolvent has at least one rational root
    if (discriminantIsSquare !== true) {
      explanation.push(
        'Resolvent has a rational root and discriminant is not a square -> Galois group D4.',
      );
      return {
        degree,
        coefficients: big,
        isZeroLeadingCoefficient: false,
        isMonic,
        hasRationalRoot: false,
        rationalRoots: [],
        discriminant,
        discriminantIsPerfectSquare: discriminantIsSquare,
        resolventCubic: resolvent,
        resolventHasRationalRoot: true,
        resolventRationalRoots: resolventRoots,
        group: 'D4',
        explanation,
      };
    }

    // discriminant square + resolvent has rational root -> V4 or C4
    // Heuristic: if resolvent has 3 rational roots -> V4, else C4.
    if (resolventRoots.length >= 3) {
      explanation.push(
        'Discriminant square and resolvent splits (3 rational roots) -> Galois group V4 (Klein).',
      );
      return {
        degree,
        coefficients: big,
        isZeroLeadingCoefficient: false,
        isMonic,
        hasRationalRoot: false,
        rationalRoots: [],
        discriminant,
        discriminantIsPerfectSquare: discriminantIsSquare,
        resolventCubic: resolvent,
        resolventHasRationalRoot: true,
        resolventRationalRoots: resolventRoots,
        group: 'V4',
        explanation,
      };
    }

    explanation.push(
      'Discriminant square and resolvent has a rational root but does not split completely -> typical outcome C4.',
    );
    return {
      degree,
      coefficients: big,
      isZeroLeadingCoefficient: false,
      isMonic,
      hasRationalRoot: false,
      rationalRoots: [],
      discriminant,
      discriminantIsPerfectSquare: discriminantIsSquare,
      resolventCubic: resolvent,
      resolventHasRationalRoot: true,
      resolventRationalRoots: resolventRoots,
      group: 'C4',
      explanation,
    };
  }

  // Discriminant via resultant
  // Δ = (-1)^{n(n-1)/2} * Res(f, f') / a_n
  // (exact for integer polynomials)
  computeDiscriminantViaResultant(f: BigIntPolynomial): bigint | null {
    const n = f.length - 1;
    if (n < 1) {
      return null;
    }

    const aN = f[0];
    if (aN === 0n) {
      return null;
    }

    const fp = this.derivative(f);
    const res = this.resultantSylvester(f, fp);
    const sign = ((n * (n - 1)) / 2) % 2 === 0 ? 1n : -1n;

    // Discriminant definition for general (non-monic) f:
    // Δ = (-1)^{n(n-1)/2} * Res(f, f') / a_n
    // Res should be divisible by a_n for integer coefficients.
    const numerator = sign * res;
    return numerator / aN;
  }

  derivative(f: BigIntPolynomial): BigIntPolynomial {
    const n = f.length - 1;
    if (n === 0) {
      return [0n];
    }

    const result: bigint[] = [];
    for (let i = 0; i < n; i++) {
      const power = BigInt(n - i);
      result.push(f[i] * power);
    }
    return result;
  }

  // Sylvester matrix resultant det with Bareiss (exact integer determinant)
  resultantSylvester(f: BigIntPolynomial, g: BigIntPolynomial): bigint {
    const n = f.length - 1;
    const m = g.length - 1;
    const size = n + m;

    const matrix: BigIntMatrix = Array.from({ length: size }, () => Array(size).fill(0n));

    // Fill first m rows with shifts of f
    for (let row = 0; row < m; row++) {
      for (let i = 0; i <= n; i++) {
        matrix[row][row + i] = f[i];
      }
    }

    // Fill next n rows with shifts of g
    for (let row = 0; row < n; row++) {
      for (let i = 0; i <= m; i++) {
        matrix[m + row][row + i] = g[i];
      }
    }

    return this.determinantBareiss(matrix);
  }

  determinantBareiss(matrix: BigIntMatrix): bigint {
    const n = matrix.length;
    const A: BigIntMatrix = matrix.map((row) => row.slice());

    let prevPivot = 1n;
    let sign = 1n;

    for (let k = 0; k < n - 1; k++) {
      // Pivoting if needed
      if (A[k][k] === 0n) {
        let swapRow = -1;
        for (let r = k + 1; r < n; r++) {
          if (A[r][k] !== 0n) {
            swapRow = r;
            break;
          }
        }
        if (swapRow === -1) {
          return 0n;
        }
        const tmp = A[k];
        A[k] = A[swapRow];
        A[swapRow] = tmp;
        sign = -sign;
      }

      const pivot = A[k][k];

      for (let i = k + 1; i < n; i++) {
        for (let j = k + 1; j < n; j++) {
          A[i][j] = (A[i][j] * pivot - A[i][k] * A[k][j]) / prevPivot;
        }
      }

      // zero out below/left
      for (let i = k + 1; i < n; i++) {
        A[i][k] = 0n;
      }

      prevPivot = pivot;
    }

    return sign * A[n - 1][n - 1];
  }

  // Rational root test (p/q where p|a0, q|aN)
  findRationalRoots(f: BigIntPolynomial): { numerator: bigint; denominator: bigint }[] {
    const n = f.length - 1;
    const aN = f[0];
    const a0 = f[f.length - 1];

    if (aN === 0n) {
      return [];
    }

    const pDivs = this.integerDivisors(this.abs(a0));
    const qDivs = this.integerDivisors(this.abs(aN));

    const roots: { numerator: bigint; denominator: bigint }[] = [];
    const seen = new Set<string>();

    for (const p of pDivs) {
      for (const q of qDivs) {
        if (q === 0n) continue;

        // try ±p/q
        for (const sgn of [1n, -1n]) {
          const num = sgn * p;
          const den = q;

          const g = this.bigintGcd(this.abs(num), den);
          const nn = den === 0n ? num : num / g;
          const dd = den / g;

          const key = `${nn}/${dd}`;
          if (seen.has(key)) continue;

          if (this.evaluateAtRationalIsZero(f, nn, dd)) {
            seen.add(key);
            roots.push({ numerator: nn, denominator: dd });
          }
        }
      }
    }

    return roots;
  }

  evaluateAtRationalIsZero(f: BigIntPolynomial, num: bigint, den: bigint): boolean {
    // Check f(num/den) = 0 by clearing denominators:
    // Compute sum a_i * num^{deg-i} * den^{i} = 0 * den^deg
    const deg = f.length - 1;

    let total = 0n;
    for (let i = 0; i <= deg; i++) {
      const coeff = f[i];
      const powerNum = BigInt(deg - i);
      const powerDen = BigInt(i);

      total += coeff * this.powBigInt(num, powerNum) * this.powBigInt(den, powerDen);
    }

    return total === 0n;
  }

  // Quartic resolvent cubic
  // For ax^4+bx^3+cx^2+dx+e:
  // Depress via x = y - b/(4a) -> y^4 + p y^2 + q y + r
  // p = (8ac - 3b^2)/(8a^2)
  // q = (b^3 - 4abc + 8a^2 d)/(8a^3)
  // r = (-3b^4 + 256 a^3 e - 64 a^2 b d + 16 a b^2 c - 16 a^2 c^2)/(256 a^4)
  //
  // Resolvent cubic (standard Ferrari form):
  // z^3 - p z^2 - 4r z + (4rp - q^2) = 0
  //
  // We return an integer-coefficient cubic by clearing denominators.
  buildQuarticResolventCubicInteger(f4: BigIntPolynomial): bigint[] {
    if (f4.length !== 5) {
      throw new Error('Quartic must have 5 coefficients [a,b,c,d,e].');
    }

    const a = f4[0];
    const b = f4[1];
    const c = f4[2];
    const d = f4[3];
    const e = f4[4];

    // Build p,q,r as rationals with common denominators:
    // pNum/pDen, qNum/qDen, rNum/rDen
    const pNum = 8n * a * c - 3n * b * b;
    const pDen = 8n * a * a;

    const qNum = b * b * b - 4n * a * b * c + 8n * a * a * d;
    const qDen = 8n * a * a * a;

    const rNum =
      -3n * this.powBigInt(b, 4n) +
      256n * this.powBigInt(a, 3n) * e -
      64n * a * a * b * d +
      16n * a * b * b * c -
      16n * a * a * c * c;
    const rDen = 256n * this.powBigInt(a, 4n);

    // We want cubic:
    // z^3 - p z^2 - 4r z + (4rp - q^2) = 0
    //
    // Coeffs as rationals:
    // [1, -p, -4r, (4rp - q^2)]
    //
    // Clear denominators using L = lcm(pDen, rDen, qDen^2, ...).
    // We'll just use product of denominators to keep it simple (still safe at degree 4).
    const L = pDen * rDen * qDen * qDen;

    // Convert each coefficient to integer numerator with denom L.
    const c3 = L; // 1 * L

    const c2 = -this.toCommonNumerator(pNum, pDen, L); // -p
    const c1 = -4n * this.toCommonNumerator(rNum, rDen, L); // -4r

    // 4rp - q^2:
    // 4 * (pNum/pDen) * (rNum/rDen) - (qNum/qDen)^2
    const term1Num = 4n * pNum * rNum;
    const term1Den = pDen * rDen;

    const term2Num = qNum * qNum;
    const term2Den = qDen * qDen;

    const term1Common = this.toCommonNumerator(term1Num, term1Den, L);
    const term2Common = this.toCommonNumerator(term2Num, term2Den, L);

    const c0 = term1Common - term2Common;

    // polynomial: (c3) z^3 + (c2) z^2 + (c1) z + (c0)
    // Reduce by gcd of coefficients to keep it smaller.
    const g = this.bigintGcdMany([this.abs(c3), this.abs(c2), this.abs(c1), this.abs(c0)]);
    return [c3 / g, c2 / g, c1 / g, c0 / g];
  }

  private finish(
    degree: 3 | 4,
    coefficients: bigint[],
    isMonic: boolean,
    hasRationalRoot: boolean,
    rationalRoots: { numerator: bigint; denominator: bigint }[],
    discriminant: bigint | null,
    discriminantIsPerfectSquare: boolean | null,
    group: GaloisGroupName,
    explanation: string[],
  ): GaloisComputationResult {
    return {
      degree,
      coefficients,
      isZeroLeadingCoefficient: false,
      isMonic,
      hasRationalRoot,
      rationalRoots,
      discriminant,
      discriminantIsPerfectSquare,
      group,
      explanation,
    };
  }

  private toCommonNumerator(num: bigint, den: bigint, commonDen: bigint): bigint {
    // num/den -> NumCommon/commonDen
    return num * (commonDen / den);
  }

  // Utilities
  isPerfectSquareBigInt(n: bigint): boolean {
    if (n < 0n) return false;
    const r = this.isqrt(n);
    return r * r === n;
  }

  isqrt(n: bigint): bigint {
    if (n < 0n) {
      throw new Error('Square root of negative number.');
    }
    if (n < 2n) return n;

    // Newton iteration
    let x0 = n;
    let x1 = (x0 + 1n) >> 1n;

    while (x1 < x0) {
      x0 = x1;
      x1 = (x1 + n / x1) >> 1n;
    }

    return x0;
  }

  powBigInt(base: bigint, exponent: bigint): bigint {
    if (exponent < 0n) {
      throw new Error('Negative exponent not supported for BigInt pow.');
    }
    let result = 1n;
    let b = base;
    let e = exponent;

    while (e > 0n) {
      if (e & 1n) result *= b;
      b *= b;
      e >>= 1n;
    }
    return result;
  }

  bigintGcd(a: bigint, b: bigint): bigint {
    let x = a;
    let y = b;
    while (y !== 0n) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x < 0n ? -x : x;
  }

  bigintGcdMany(values: bigint[]): bigint {
    if (values.length === 0) return 1n;
    let g = values[0] === 0n ? 1n : values[0];
    for (let i = 1; i < values.length; i++) {
      g = this.bigintGcd(g, values[i]);
    }
    return g === 0n ? 1n : g;
  }

  abs(x: bigint): bigint {
    return x < 0n ? -x : x;
  }

  integerDivisors(n: bigint): bigint[] {
    if (n === 0n) {
      // For 0, rational root theorem degenerates. Return small set.
      return [0n, 1n];
    }

    const absN = this.abs(n);
    const divs: bigint[] = [];

    // Simple divisor enumeration; good enough for small lab inputs.
    // For large constants, this can be slow; but our UI inputs are typically small.
    const limit = Number(this.isqrt(absN)); // safe for typical lab sizes

    for (let i = 1; i <= limit; i++) {
      const bi = BigInt(i);
      if (absN % bi === 0n) {
        divs.push(bi);
        const other = absN / bi;
        if (other !== bi) {
          divs.push(other);
        }
      }
    }

    return divs.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }
}
