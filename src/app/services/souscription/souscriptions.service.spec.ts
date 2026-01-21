import { TestBed } from '@angular/core/testing';

import { SouscriptionsService } from './souscriptions.service';

describe('SouscriptionsService', () => {
  let service: SouscriptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SouscriptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
