import { TestBed } from '@angular/core/testing';

import { BanqueNameVerifierService } from './banque-name-verifier.service';

describe('BanqueNameVerifierService', () => {
  let service: BanqueNameVerifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BanqueNameVerifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
