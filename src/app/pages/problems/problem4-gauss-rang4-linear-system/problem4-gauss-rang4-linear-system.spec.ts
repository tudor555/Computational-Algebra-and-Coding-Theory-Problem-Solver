import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem4GaussRang4LinearSystem } from './problem4-gauss-rang4-linear-system';

describe('Problem4GaussRang4LinearSystem', () => {
  let component: Problem4GaussRang4LinearSystem;
  let fixture: ComponentFixture<Problem4GaussRang4LinearSystem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem4GaussRang4LinearSystem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem4GaussRang4LinearSystem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
