import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem12Eigenvalues } from './problem12-eigenvalues';

describe('Problem12Eigenvalues', () => {
  let component: Problem12Eigenvalues;
  let fixture: ComponentFixture<Problem12Eigenvalues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem12Eigenvalues]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem12Eigenvalues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
