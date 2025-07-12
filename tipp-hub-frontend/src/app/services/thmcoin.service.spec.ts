import { TestBed } from '@angular/core/testing';

import { ThmcoinService } from './thmcoin.service';

describe('ThmcoinService', () => {
  let service: ThmcoinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThmcoinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
