import { TestBed } from '@angular/core/testing';

import { BeneficiaireEnAttenteService } from './beneficiaire-en-attente.service';

describe('BeneficiaireEnAttenteService', () => {
  let service: BeneficiaireEnAttenteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeneficiaireEnAttenteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
