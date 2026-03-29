import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem5GaussRankInverse } from './problem5-gauss-rank-inverse';

describe('Problem5GaussRankInverse', () => {
  let component: Problem5GaussRankInverse;
  let fixture: ComponentFixture<Problem5GaussRankInverse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem5GaussRankInverse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem5GaussRankInverse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
