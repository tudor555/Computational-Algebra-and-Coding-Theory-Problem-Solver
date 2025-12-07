import { TestBed } from '@angular/core/testing';

import { CodingTheory } from './coding-theory';

describe('CodingTheory', () => {
  let service: CodingTheory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodingTheory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
