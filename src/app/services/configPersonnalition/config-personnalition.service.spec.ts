import { TestBed } from '@angular/core/testing';

import { ConfigPersonnalitionService } from './config-personnalition.service';

describe('ConfigPersonnalitionService', () => {
  let service: ConfigPersonnalitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigPersonnalitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
