import { TestBed } from '@angular/core/testing';

import { MesNotifsService } from './mes-notifs-service.service';

describe('MesNotifsService', () => {
  let service: MesNotifsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MesNotifsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
