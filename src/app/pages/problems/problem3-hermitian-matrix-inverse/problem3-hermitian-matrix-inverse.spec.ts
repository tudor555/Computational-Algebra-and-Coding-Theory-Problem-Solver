import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem3HermitianMatrixInverse } from './problem3-hermitian-matrix-inverse';

describe('Problem3HermitianMatrixInverse', () => {
  let component: Problem3HermitianMatrixInverse;
  let fixture: ComponentFixture<Problem3HermitianMatrixInverse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem3HermitianMatrixInverse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem3HermitianMatrixInverse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
