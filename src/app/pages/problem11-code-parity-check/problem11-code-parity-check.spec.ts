import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem11CodeParityCheck } from './problem11-code-parity-check';

describe('Problem11CodeParityCheck', () => {
  let component: Problem11CodeParityCheck;
  let fixture: ComponentFixture<Problem11CodeParityCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem11CodeParityCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem11CodeParityCheck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
