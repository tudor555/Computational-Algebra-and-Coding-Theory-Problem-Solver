import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem6ZnOrderIdempotent } from './problem6-zn-order-idempotent';

describe('Problem6ZnOrderIdempotent', () => {
  let component: Problem6ZnOrderIdempotent;
  let fixture: ComponentFixture<Problem6ZnOrderIdempotent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem6ZnOrderIdempotent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem6ZnOrderIdempotent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
