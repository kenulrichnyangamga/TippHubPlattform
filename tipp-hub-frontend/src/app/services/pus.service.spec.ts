import { TestBed } from '@angular/core/testing';

import { PusService } from './pus.service';

describe('PusService', () => {
  let service: PusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
