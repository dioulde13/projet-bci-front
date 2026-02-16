import { TestBed } from '@angular/core/testing';

import { OrdreTransfertInternationalService } from './ordre-transfert-international.service';

describe('OrdreTransfertInternationalService', () => {
  let service: OrdreTransfertInternationalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdreTransfertInternationalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
