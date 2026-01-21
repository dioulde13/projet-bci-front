import { TestBed } from '@angular/core/testing';

import { VerifierOtpAfterVerifiTokenService } from './verifier-otp-after-verifi-token.service';

describe('VerifierOtpAfterVerifiTokenService', () => {
  let service: VerifierOtpAfterVerifiTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifierOtpAfterVerifiTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
