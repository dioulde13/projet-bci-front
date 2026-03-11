import { TestBed } from '@angular/core/testing';

import { GenericFileService } from './generic-file.service';

describe('GenericFileService', () => {
  let service: GenericFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
