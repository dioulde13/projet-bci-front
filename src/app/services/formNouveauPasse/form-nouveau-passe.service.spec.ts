import { TestBed } from '@angular/core/testing';

import { FormNouveauPasseService } from './form-nouveau-passe.service';

describe('FormNouveauPasseService', () => {
  let service: FormNouveauPasseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormNouveauPasseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
