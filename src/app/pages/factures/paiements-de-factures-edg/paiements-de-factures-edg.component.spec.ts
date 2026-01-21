import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementsDeFacturesEDGComponent } from './paiements-de-factures-edg.component';

describe('PaiementsDeFacturesEDGComponent', () => {
  let component: PaiementsDeFacturesEDGComponent;
  let fixture: ComponentFixture<PaiementsDeFacturesEDGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementsDeFacturesEDGComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaiementsDeFacturesEDGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
