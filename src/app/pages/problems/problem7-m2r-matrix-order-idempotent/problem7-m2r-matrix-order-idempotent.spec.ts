import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem7M2rMatrixOrderIdempotent } from './problem7-m2r-matrix-order-idempotent';

describe('Problem7M2rMatrixOrderIdempotent', () => {
  let component: Problem7M2rMatrixOrderIdempotent;
  let fixture: ComponentFixture<Problem7M2rMatrixOrderIdempotent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem7M2rMatrixOrderIdempotent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem7M2rMatrixOrderIdempotent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
