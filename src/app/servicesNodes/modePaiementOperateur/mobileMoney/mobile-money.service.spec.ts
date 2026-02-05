import { TestBed } from '@angular/core/testing';

import { MobileMoneyService } from './mobile-money.service';

describe('MobileMoneyService', () => {
  let service: MobileMoneyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileMoneyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
