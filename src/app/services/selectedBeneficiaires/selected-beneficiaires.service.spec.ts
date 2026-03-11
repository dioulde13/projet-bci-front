import { TestBed } from '@angular/core/testing';

import { SelectedBeneficiairesService } from './selected-beneficiaires.service';

describe('SelectedBeneficiairesService', () => {
  let service: SelectedBeneficiairesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedBeneficiairesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
