import { TestBed } from '@angular/core/testing';

import { AjouterComptesService } from './ajouter-comptes.service';

describe('AjouterComptesService', () => {
  let service: AjouterComptesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AjouterComptesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
