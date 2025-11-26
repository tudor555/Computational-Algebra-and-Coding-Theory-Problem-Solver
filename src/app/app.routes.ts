import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Problem2MatrixDecomposition } from './pages/problem2-matrix-decomposition/problem2-matrix-decomposition';
import { Problem5GaussRankInverse } from './pages/problem5-gauss-rank-inverse/problem5-gauss-rank-inverse';
import { Problem6ZnOrderIdempotent } from './pages/problem6-zn-order-idempotent/problem6-zn-order-idempotent';
import { Problem11CodeParityCheck } from './pages/problem11-code-parity-check/problem11-code-parity-check';
import { Problem12Eigenvalues } from './pages/problem12-eigenvalues/problem12-eigenvalues';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
  { path: 'home', component: Home },
  { path: 'matrix-decomposition', component: Problem2MatrixDecomposition },
  { path: 'gauss-rank-inverse', component: Problem5GaussRankInverse },
  { path: 'zn-order-idempotent', component: Problem6ZnOrderIdempotent },
  { path: 'code-parity-check', component: Problem11CodeParityCheck },
  { path: 'eigen-values', component: Problem12Eigenvalues },
  { path: '**', component: NotFound }, // Wildcard route for 404
  { path: 'not-found', component: NotFound }, // Wildcard route for 404
];
