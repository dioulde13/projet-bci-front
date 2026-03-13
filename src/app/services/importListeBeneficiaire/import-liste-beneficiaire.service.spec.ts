import { TestBed } from '@angular/core/testing';

import { ImportListeBeneficiaireService } from './import-liste-beneficiaire.service';

describe('ImportListeBeneficiaireService', () => {
  let service: ImportListeBeneficiaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportListeBeneficiaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
