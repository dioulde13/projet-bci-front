import { TestBed } from '@angular/core/testing';

import { SaveFichierCSVService } from './save-fichier-csv.service';

describe('SaveFichierCSVService', () => {
  let service: SaveFichierCSVService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveFichierCSVService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
