import { TestBed } from '@angular/core/testing';

import { OtpAfterChangeInfoService } from './otp-after-change-info.service';

describe('OtpAfterChangeInfoService', () => {
  let service: OtpAfterChangeInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpAfterChangeInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
