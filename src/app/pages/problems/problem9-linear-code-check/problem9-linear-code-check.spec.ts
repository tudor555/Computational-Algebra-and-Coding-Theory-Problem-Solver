import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem9LinearCodeCheck } from './problem9-linear-code-check';

describe('Problem9LinearCodeCheck', () => {
  let component: Problem9LinearCodeCheck;
  let fixture: ComponentFixture<Problem9LinearCodeCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem9LinearCodeCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem9LinearCodeCheck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
