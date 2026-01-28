import { TestBed } from '@angular/core/testing';

import { GetAccountNameService } from './get-account-name.service';

describe('GetAccountNameService', () => {
  let service: GetAccountNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAccountNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
