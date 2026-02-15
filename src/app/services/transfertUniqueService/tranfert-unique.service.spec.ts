import { TestBed } from '@angular/core/testing';

import { TranfertUniqueService } from './tranfert-unique.service';

describe('TranfertUniqueService', () => {
  let service: TranfertUniqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranfertUniqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
