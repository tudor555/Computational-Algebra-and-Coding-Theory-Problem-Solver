import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Problem1TriangularMatrices } from './pages/problems/problem1-triangular-matrices/problem1-triangular-matrices';
import { Problem2MatrixDecomposition } from './pages/problems/problem2-matrix-decomposition/problem2-matrix-decomposition';
import { Problem3HermitianMatrixInverse } from './pages/problems/problem3-hermitian-matrix-inverse/problem3-hermitian-matrix-inverse';
import { Problem4GaussRang4LinearSystem } from './pages/problems/problem4-gauss-rang4-linear-system/problem4-gauss-rang4-linear-system';
import { Problem5GaussRankInverse } from './pages/problems/problem5-gauss-rank-inverse/problem5-gauss-rank-inverse';
import { Problem6ZnOrderIdempotent } from './pages/problems/problem6-zn-order-idempotent/problem6-zn-order-idempotent';
import { Problem7M2rMatrixOrderIdempotent } from './pages/problems/problem7-m2r-matrix-order-idempotent/problem7-m2r-matrix-order-idempotent';
import { Problem8CodeParameters } from './pages/problems/problem8-code-parameters/problem8-code-parameters';
import { Problem9LinearCodeCheck } from './pages/problems/problem9-linear-code-check/problem9-linear-code-check';
import { Problem10GeneratorMatrixCodewords } from './pages/problems/problem10-generator-matrix-codewords/problem10-generator-matrix-codewords';
import { Problem11CodeParityCheck } from './pages/problems/problem11-code-parity-check/problem11-code-parity-check';
import { Problem12Eigenvalues } from './pages/problems/problem12-eigenvalues/problem12-eigenvalues';
import { Problem13GaloisGroupPolynomial } from './pages/problems/problem13-galois-group-polynomial/problem13-galois-group-polynomial';
import { Problem14EuclidContinuedFraction } from './pages/problems/problem14-euclid-continued-fraction/problem14-euclid-continued-fraction';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
  { path: 'home', component: Home },
  { path: 'triangular-matrices', component: Problem1TriangularMatrices },
  { path: 'matrix-decomposition', component: Problem2MatrixDecomposition },
  { path: 'hermitian-matrix-inverse', component: Problem3HermitianMatrixInverse },
  { path: 'gauss-4x4-linear-system', component: Problem4GaussRang4LinearSystem },
  { path: 'gauss-rank-inverse', component: Problem5GaussRankInverse },
  { path: 'zn-order-idempotent', component: Problem6ZnOrderIdempotent },
  { path: 'm2r-matrix-order-idempotent', component: Problem7M2rMatrixOrderIdempotent },
  { path: 'code-parameters', component: Problem8CodeParameters },
  { path: 'linear-code-check', component: Problem9LinearCodeCheck },
  { path: 'generator-matrix-codewords', component: Problem10GeneratorMatrixCodewords },
  { path: 'code-parity-check', component: Problem11CodeParityCheck },
  { path: 'eigen-values', component: Problem12Eigenvalues },
  { path: 'galois-group-polynomial', component: Problem13GaloisGroupPolynomial },
  { path: 'euclid-continued-fraction', component: Problem14EuclidContinuedFraction },
  { path: '**', component: NotFound }, // Wildcard route for 404
  { path: 'not-found', component: NotFound }, // Wildcard route for 404
];
