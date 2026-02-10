import { TestBed } from '@angular/core/testing';

import { StatutBancaireService } from './statut-bancaire.service';

describe('StatutBancaireService', () => {
  let service: StatutBancaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatutBancaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
