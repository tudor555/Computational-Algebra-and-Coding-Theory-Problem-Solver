import { TestBed } from '@angular/core/testing';

import { NumberTheory } from './number-theory';

describe('NumberTheory', () => {
  let service: NumberTheory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NumberTheory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
