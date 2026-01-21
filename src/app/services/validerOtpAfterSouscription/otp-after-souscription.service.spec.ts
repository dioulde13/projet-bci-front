import { TestBed } from '@angular/core/testing';

import { OtpAfterSouscriptionService } from './otp-after-souscription.service';

describe('OtpAfterSouscriptionService', () => {
  let service: OtpAfterSouscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpAfterSouscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
