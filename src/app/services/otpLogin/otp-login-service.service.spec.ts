import { TestBed } from '@angular/core/testing';

import { OtpLoginServiceService } from './otp-login-service.service';

describe('OtpLoginServiceService', () => {
  let service: OtpLoginServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpLoginServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
