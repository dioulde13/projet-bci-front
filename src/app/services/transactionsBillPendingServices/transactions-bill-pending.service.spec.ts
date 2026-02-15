import { TestBed } from '@angular/core/testing';

import { TransactionsBillPendingService } from './transactions-bill-pending.service';

describe('TransactionsBillPendingService', () => {
  let service: TransactionsBillPendingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionsBillPendingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
