import { TestBed } from '@angular/core/testing';

import { AuthServicesNodes } from './auth.service';

describe('AuthService', () => {
  let service: AuthServicesNodes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthServicesNodes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
