import { TestBed } from '@angular/core/testing';

import { TransactionInternationalService } from './transaction-international.service';

describe('TransactionInternationalService', () => {
  let service: TransactionInternationalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionInternationalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
