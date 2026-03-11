import { TestBed } from '@angular/core/testing';

import { TransfertMultipleService } from './transfert-multiple.service';

describe('TransfertMultipleService', () => {
  let service: TransfertMultipleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransfertMultipleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
