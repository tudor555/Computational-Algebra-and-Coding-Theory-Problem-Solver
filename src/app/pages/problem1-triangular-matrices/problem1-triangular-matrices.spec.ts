import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem1TriangularMatrices } from './problem1-triangular-matrices';

describe('Problem1TriangularMatrices', () => {
  let component: Problem1TriangularMatrices;
  let fixture: ComponentFixture<Problem1TriangularMatrices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem1TriangularMatrices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem1TriangularMatrices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
