import { TestBed } from '@angular/core/testing';

import { PolynomialAlgebra } from './polynomial-algebra';

describe('PolynomialAlgebra', () => {
  let service: PolynomialAlgebra;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolynomialAlgebra);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
