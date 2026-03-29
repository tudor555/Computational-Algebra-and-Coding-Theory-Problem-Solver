import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem8CodeParameters } from './problem8-code-parameters';

describe('Problem8CodeParameters', () => {
  let component: Problem8CodeParameters;
  let fixture: ComponentFixture<Problem8CodeParameters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem8CodeParameters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem8CodeParameters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
