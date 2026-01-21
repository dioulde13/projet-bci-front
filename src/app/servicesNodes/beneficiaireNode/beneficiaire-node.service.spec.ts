import { TestBed } from '@angular/core/testing';

import { BeneficiaireNodeService } from './beneficiaire-node.service';

describe('BeneficiaireNodeService', () => {
  let service: BeneficiaireNodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeneficiaireNodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
