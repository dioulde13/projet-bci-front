import { TestBed } from '@angular/core/testing';

import { PaiementInterneExterneService } from './paiement-interne-externe.service';

describe('PaiementInterneExterneService', () => {
  let service: PaiementInterneExterneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaiementInterneExterneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
