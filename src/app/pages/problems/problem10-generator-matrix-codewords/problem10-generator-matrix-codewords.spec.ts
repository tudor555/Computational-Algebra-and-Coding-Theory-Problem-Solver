import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Problem10GeneratorMatrixCodewords } from './problem10-generator-matrix-codewords';

describe('Problem10GeneratorMatrixCodewords', () => {
  let component: Problem10GeneratorMatrixCodewords;
  let fixture: ComponentFixture<Problem10GeneratorMatrixCodewords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Problem10GeneratorMatrixCodewords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Problem10GeneratorMatrixCodewords);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
