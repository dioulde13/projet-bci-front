import { TestBed } from '@angular/core/testing';

import { InactivityServiceTsService } from './inactivity.service.ts.service';

describe('InactivityServiceTsService', () => {
  let service: InactivityServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InactivityServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
