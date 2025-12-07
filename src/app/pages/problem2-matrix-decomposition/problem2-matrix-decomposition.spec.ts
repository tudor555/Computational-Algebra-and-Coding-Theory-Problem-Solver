import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem2MatrixDecomposition } from './problem2-matrix-decomposition';

describe('Problem2MatrixDecomposition', () => {
  let component: Problem2MatrixDecomposition;
  let fixture: ComponentFixture<Problem2MatrixDecomposition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem2MatrixDecomposition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem2MatrixDecomposition);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
