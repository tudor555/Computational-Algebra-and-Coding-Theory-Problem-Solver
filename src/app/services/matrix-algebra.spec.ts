import { TestBed } from '@angular/core/testing';

import { MatrixAlgebra } from './matrix-algebra';

describe('MatrixAlgebra', () => {
  let service: MatrixAlgebra;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatrixAlgebra);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
