import { TestBed } from '@angular/core/testing';

import { MarchandService } from './marchand.service';

describe('MarchandService', () => {
  let service: MarchandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarchandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
