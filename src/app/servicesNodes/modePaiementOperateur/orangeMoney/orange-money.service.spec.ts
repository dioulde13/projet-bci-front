import { TestBed } from '@angular/core/testing';

import { OrangeMoneyService } from './orange-money.service';

describe('OrangeMoneyService', () => {
  let service: OrangeMoneyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrangeMoneyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
