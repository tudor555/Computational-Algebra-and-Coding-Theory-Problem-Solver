import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem13GaloisGroupPolynomial } from './problem13-galois-group-polynomial';

describe('Problem13GaloisGroupPolynomial', () => {
  let component: Problem13GaloisGroupPolynomial;
  let fixture: ComponentFixture<Problem13GaloisGroupPolynomial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem13GaloisGroupPolynomial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem13GaloisGroupPolynomial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
