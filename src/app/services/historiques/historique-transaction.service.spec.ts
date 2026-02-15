import { TestBed } from '@angular/core/testing';

import { HistoriqueTransactionService } from './historique-transaction.service';

describe('HistoriqueTransactionService', () => {
  let service: HistoriqueTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
