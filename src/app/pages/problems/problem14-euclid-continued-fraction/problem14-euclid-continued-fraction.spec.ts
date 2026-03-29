import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem14EuclidContinuedFraction } from './problem14-euclid-continued-fraction';

describe('Problem14EuclidContinuedFraction', () => {
  let component: Problem14EuclidContinuedFraction;
  let fixture: ComponentFixture<Problem14EuclidContinuedFraction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem14EuclidContinuedFraction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem14EuclidContinuedFraction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
