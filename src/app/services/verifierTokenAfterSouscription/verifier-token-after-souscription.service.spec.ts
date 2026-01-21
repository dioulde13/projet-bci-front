import { TestBed } from '@angular/core/testing';

import { VerifierTokenAfterSouscriptionService } from './verifier-token-after-souscription.service';

describe('VerifierTokenAfterSouscriptionService', () => {
  let service: VerifierTokenAfterSouscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifierTokenAfterSouscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
