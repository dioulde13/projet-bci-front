import { TestBed } from '@angular/core/testing';

import { BciLoaderService } from './bci-loader.service';

describe('BciLoaderService', () => {
  let service: BciLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BciLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
