import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementFactureElectriciteComponent } from './paiement-facture-electricite.component';

describe('PaiementFactureElectriciteComponent', () => {
  let component: PaiementFactureElectriciteComponent;
  let fixture: ComponentFixture<PaiementFactureElectriciteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementFactureElectriciteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaiementFactureElectriciteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
