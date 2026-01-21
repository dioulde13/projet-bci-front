import { TestBed } from '@angular/core/testing';

import { ValiderUtilisateurServiceService } from './valider-utilisateur-service.service';

describe('ValiderUtilisateurServiceService', () => {
  let service: ValiderUtilisateurServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValiderUtilisateurServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
