import { TestBed } from '@angular/core/testing';

import { ModularGroup } from './modular-group';

describe('ModularGroup', () => {
  let service: ModularGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModularGroup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
