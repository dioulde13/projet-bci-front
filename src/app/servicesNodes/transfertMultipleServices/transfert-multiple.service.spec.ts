import { TestBed } from '@angular/core/testing';

import { TransfertMultipleServiceNode } from './transfert-multiple.service';

describe('TransfertMultipleService', () => {
  let service: TransfertMultipleServiceNode;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransfertMultipleServiceNode);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
